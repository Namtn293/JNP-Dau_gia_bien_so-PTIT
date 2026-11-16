# Danh sách cần sửa: bảo mật, đo RAM (macOS và Windows), kiểm chứng DB, script Windows

> Cơ sở: đọc mã nguồn bản `JNP-Dau_gia_bien_so-PTIT_3.zip` (working tree trên commit `a469e56`).
> Chưa biên dịch và chưa chạy thử (môi trường phân tích không có JDK compiler, Maven hoặc Windows). Mọi bước kiểm chứng ở dưới cần được chạy trên máy của bạn.
>
> **Về cụm "2 lỗi ở trên window":** tài liệu này hiểu là hai chỗ chưa kiểm chứng đã nêu ở lần review trước (**F4**, **F5**), kèm các lỗi riêng của Windows tìm thấy trong script chạy (**F6**, **F7**). Nếu bạn muốn nói hai lỗi khác thì cần bổ sung.

## 0. Bảng tổng hợp

| ID | Việc | Nơi sửa | Đụng DB | Ưu tiên |
|---|---|---|---|---|
| F1 | Chặn token giả `mock:<email>:<tên>` (đăng nhập thành bất kỳ ai, kể cả ADMIN) | `AuthenticationService`, test, yml | Không | **Cao nhất** |
| F2 | Xác thực Google thật thiếu kiểm tra `aud` và `email_verified` | `AuthenticationService` | Không | Cao |
| F3 | Đo RAM đúng theo hệ điều hành (macOS sai, Windows cần xác nhận, Linux giữ) | `MetricsSampler` | Không | Cao |
| F4 | Kiểm tra ràng buộc `status` có cho `PAUSED` không, `ALTER` nếu thiếu | Neon | **Có (đổi schema, cần duyệt)** | Cao |
| F5 | `AuctionDemoDataInitializer` có thể đưa phiên đang `PAUSED` về `LIVE` khi khởi động lại | `AuctionDemoDataInitializer` | Ghi dữ liệu (hành vi) | Trung bình |
| F6 | Script Windows ghi cứng đường dẫn JDK của một máy | `env-java21.ps1`, `run-*.ps1` | Không | Trung bình |
| F7 | Script Windows không build jar và mở Admin trước khi Core sẵn sàng | `run-admin.ps1`, `start-all.ps1` | Không | Thấp |

Thứ tự làm đề xuất: F1, F2, F3, F4, F5, F6, F7. F1 và F2 nên làm cùng một lượt.

---

## F1. Chặn token giả `mock:<email>:<tên>` (lỗ hổng bảo mật)

**Vấn đề.** `AuthenticationService.authenticateGoogle` (dòng 116-121) coi mọi `idToken` bắt đầu bằng `mock:` là hợp lệ, rồi lấy email và tên từ chính chuỗi đó mà không xác minh gì với Google.
Endpoint `POST /api/auth/google` là công khai (`/api/auth/**` được `permitAll`). Nếu email đã có trong `main_user_info`, hệ thống cấp JWT của người đó.

**Tác động.** Ai biết email của một tài khoản (kể cả ADMIN) gửi `{"idToken":"mock:admin@mail.com:x"}` là nhận được token của tài khoản đó. Khi đó họ gọi được mọi API admin.

**Cách sửa.** Chỉ chấp nhận token giả khi bật cờ cấu hình, mặc định tắt.

`AuthenticationService.java`: thêm field (lớp dùng constructor `@Autowired` tường minh, nên `@Value` trên field không `final` hoạt động bình thường):

```java
@Value("${auth.google.allow-mock:false}")
private boolean allowMockGoogleToken;
```

Đổi nhánh đầu của `authenticateGoogle`:

```java
// TRƯỚC
if (dto.getIdToken().startsWith("mock:")) {
    String[] parts = dto.getIdToken().split(":");
    ...
} else {
    ...
}

// SAU
if (dto.getIdToken().startsWith("mock:")) {
    if (!allowMockGoogleToken) {
        throw new BusinessException(ErrorCode.GOOGLE_AUTH_FAILED);   // từ chối ngay, không gọi Google
    }
    String[] parts = dto.getIdToken().split(":");
    ...
} else {
    ...
}
```

Cấu hình: thêm vào `application.yml.example` (và yml của bạn nếu cần Postman) khối sau. **Không bật `true` trên máy dùng chung hoặc khi demo công khai.**

```yaml
auth:
  google:
    allow-mock: false
```

**Sửa test.** `AuthenticationControllerTest` có 3 test dùng token giả (dòng 142, 188, 256), nên nếu không sửa thì chúng sẽ fail. Thêm vào `@TestPropertySource` của lớp đó:

```java
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "auth.google.allow-mock=true"          // THÊM: chỉ dùng trong test
})
```

Thêm một test mới (nên đặt trong lớp test riêng không bật cờ): gọi `POST /api/auth/google` với `mock:...` khi cờ tắt, mong đợi `success=false` với `GOOGLE_AUTH_FAILED` và **không có token nào được cấp**.

**Kiểm tra.**
1. Cờ tắt: `curl -X POST localhost:8080/api/auth/google -H 'Content-Type: application/json' -d '{"idToken":"mock:admin@x.com:x"}'` phải trả lỗi, không có `token`.
2. `./mvnw -q test` xanh.
3. Đăng nhập Google thật từ web vẫn thành công.

---

## F2. Xác thực Google thật thiếu `aud` và `email_verified`

**Vấn đề.** Nhánh thật gọi `https://oauth2.googleapis.com/tokeninfo?id_token=...` rồi lấy `email`, nhưng không kiểm tra token có được cấp cho ứng dụng của bạn không (`aud`) và email đã được Google xác minh chưa (`email_verified`). Một ID token hợp lệ do ứng dụng Google khác cấp vẫn được chấp nhận.

**Cách sửa.** Trong `AuthenticationService`, thêm field và kiểm tra sau khi lấy `payload`:

```java
@Value("${spring.google.client-id:}")
private String googleClientId;

// ... trong nhánh Google thật, sau khi có payload:
String aud = String.valueOf(payload.get("aud"));
boolean emailVerified = "true".equals(String.valueOf(payload.get("email_verified")));
if (googleClientId.isBlank() || !googleClientId.equals(aud) || !emailVerified) {
    throw new BusinessException(ErrorCode.GOOGLE_AUTH_FAILED);
}
```

**Lưu ý.** Cần `spring.google.client-id` đúng với client mà web dùng để lấy token. Nếu để trống thì mọi đăng nhập Google đều bị từ chối (chủ ý, tránh âm thầm cho qua).

**Kiểm tra.** Đăng nhập Google thật bằng Gmail đã được thêm làm người dùng thử (nếu OAuth ở chế độ Testing). Thử một token từ client khác thì bị từ chối.

---

## F3. Đo RAM đúng theo hệ điều hành

**Vấn đề.** `MetricsSampler.readMemoryUsage` ở nhánh macOS tính `active + inactive + speculative − purgeable` rồi cộng wired và compressed. Ba loại trang đầu bao gồm cả bộ nhớ đệm file, nên tổng ≈ `tổng RAM − free`. Kết quả vẫn xấp xỉ 99% (sai giống số của JDK), nên cảnh báo "RAM vượt ngưỡng" vẫn xuất hiện (ngưỡng mặc định `RAM_WARN=85`, `RAM_CRIT=95`).

**Nguyên tắc chung.** `đã dùng = tổng − bộ nhớ khả dụng`, trong đó bộ nhớ khả dụng **không** được tính cache file như "đã dùng".

| Hệ điều hành | Cách lấy | Tương ứng công cụ nào |
|---|---|---|
| Linux | `MemAvailable` trong `/proc/meminfo` (giữ nguyên) | `free -m`, cột `available` |
| macOS | `(Anonymous pages − Pages purgeable + Pages wired down + Pages occupied by compressor) × pageSize` từ `vm_stat` | Activity Monitor, "Memory Used" (App + Wired + Compressed) |
| Windows | `OperatingSystemMXBean.getFreeMemorySize()` của JDK | Task Manager, "Available"; "In use" = tổng − available |

Với Windows, theo mã nguồn JDK thì `getFreeMemorySize()` trả về bộ nhớ vật lý **khả dụng** (`ullAvailPhys` của `GlobalMemoryStatusEx`), đã bao gồm vùng standby, nên **không cần đổi công thức**. Đây là suy luận từ mã JDK, chưa kiểm chứng trên máy Windows, nên phải đối chiếu với Task Manager.

**Cách sửa.** Thay hàm `readMemoryUsage` trong `MetricsSampler.java`:

```java
private double[] readMemoryUsage() throws IOException, InterruptedException {
    String osName = System.getProperty("os.name", "").toLowerCase();

    if (osName.contains("linux")) {
        long totalKb = 0, availableKb = 0;
        for (String line : Files.readAllLines(Path.of("/proc/meminfo"))) {
            if (line.startsWith("MemTotal:")) totalKb = parseMeminfoKb(line);
            else if (line.startsWith("MemAvailable:")) availableKb = parseMeminfoKb(line);
        }
        if (totalKb > 0 && availableKb > 0) {
            return new double[]{(totalKb - availableKb) * 1024.0 / GB, totalKb * 1024.0 / GB};
        }
    } else if (osName.contains("mac")) {
        Process process = new ProcessBuilder("vm_stat").redirectErrorStream(true).start();
        if (!process.waitFor(2, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            throw new IOException("vm_stat timeout");
        }
        String output = new String(process.getInputStream().readAllBytes());
        long pageSize = parseNumber(output, "page size of (\\d+) bytes");
        long anonymous = parsePageCount(output, "Anonymous pages");
        long purgeable = parsePageCount(output, "Pages purgeable");
        long wired = parsePageCount(output, "Pages wired down");
        long compressed = parsePageCount(output, "Pages occupied by compressor");
        if (pageSize <= 0 || anonymous <= 0) {
            throw new IOException("vm_stat thiếu dữ liệu cần thiết");   // rơi về cách đo mặc định bên dưới
        }
        long appPages = Math.max(0, anonymous - purgeable);              // "App Memory" của Activity Monitor
        long usedBytes = (appPages + wired + compressed) * pageSize;
        long totalBytes = os.getTotalMemorySize();
        return new double[]{Math.min(totalBytes, usedBytes) / GB, totalBytes / GB};
    }

    // Windows và các hệ khác: getFreeMemorySize() của JDK
    // (Windows trả về bộ nhớ khả dụng nên "đã dùng" = tổng − khả dụng là đúng).
    long total = os.getTotalMemorySize();
    long free = os.getFreeMemorySize();
    return new double[]{Math.max(0, total - free) / GB, total / GB};
}
```

Các biến `active`, `inactive`, `speculative` cũ không còn dùng, nên xóa. `parsePageCount` hiện có khớp được dòng `Anonymous pages:` vì nó ghép tên + `:` + khoảng trắng + số.

Gợi ý để dễ kiểm thử: đưa phần phân tích `vm_stat` thành hàm tĩnh nhận chuỗi. Ví dụ với `page size of 16384 bytes`, `Anonymous pages: 200000`, `Pages purgeable: 10000`, `Pages wired down: 100000`, `Pages occupied by compressor: 80000` thì kết quả mong đợi là `(190000 + 100000 + 80000) × 16384 ≈ 5,65 GiB`.

**Kiểm tra (chấp nhận khi sai lệch dưới khoảng 5%).**

| Máy | Cách đối chiếu |
|---|---|
| macOS | Activity Monitor, tab Memory, mục "Memory Used" so với thẻ RAM trong Admin Console |
| Windows | Task Manager, Performance, Memory, mục "In use" so với thẻ RAM |
| Linux | `free -m`, `used` được tính bằng `total − available` |

Sau khi sửa, trên máy 8 GB đang chạy nhiều ứng dụng, mức RAM hiển thị phải rơi vào khoảng 60% đến 85% (không còn 99%). Cảnh báo RAM chỉ còn xuất hiện khi thật sự vượt ngưỡng liên tục 30 giây (`MIN_SUSTAINED_MS`).

---

## F4. Kiểm tra ràng buộc `status` có cho `PAUSED` không (DB)

**Vấn đề.** HALT giờ lưu `status = PAUSED` vào `auction_session`. Bản `schema.sql` cũ có ràng buộc `status IN ('SOON','LIVE','END')`. Cấu hình `ddl-auto: update` **không sửa ràng buộc CHECK đã có**, nên nếu Neon vẫn giữ ràng buộc cũ thì lệnh HALT sẽ lỗi `violates check constraint` ngay lần đầu.

**Bước 1 (chỉ đọc), chạy trên Neon Console:**

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'auction_session'::regclass AND contype = 'c';
```

- Có `PAUSED` trong danh sách: **không cần làm gì thêm**.
- Không thấy ràng buộc nào hoặc có `PAUSED`: xong.
- Thấy danh sách thiếu `PAUSED`: làm bước 2.

**Bước 2 (đổi schema, CHƯA CHẠY, cần bạn duyệt). Làm trên branch test, trong một giao dịch:**

```sql
BEGIN;
ALTER TABLE auction_session DROP CONSTRAINT <tên_ràng_buộc_ở_bước_1>;
ALTER TABLE auction_session
  ADD CONSTRAINT auction_session_status_check
  CHECK (status IN ('SOON', 'LIVE', 'PAUSED', 'END'));
COMMIT;
```

**Hoàn tác** (chỉ khi chưa có dòng nào mang giá trị `PAUSED`):

```sql
UPDATE auction_session SET status = 'LIVE' WHERE status = 'PAUSED';   -- ghi dữ liệu, ghi lại trước
ALTER TABLE auction_session DROP CONSTRAINT auction_session_status_check;
ALTER TABLE auction_session ADD CONSTRAINT auction_session_status_check CHECK (status IN ('SOON', 'LIVE', 'END'));
```

**Kiểm tra.** HALT một phiên `LIVE` của branch test, rồi `SELECT session_code, status FROM auction_session WHERE session_code = '<mã>'` phải ra `PAUSED`. Đặt giá từ USER phải bị từ chối.

---

## F5. `AuctionDemoDataInitializer` ghi đè phiên đang `PAUSED`

**Vấn đề.** Khi core khởi động, `ensureDemoSessionsActive` chỉ coi là hợp lệ các phiên `LIVE` chưa hết hạn. Phiên `PAUSED` không được tính, nên nếu không còn phiên `LIVE` hợp lệ, hàm này làm mới các phiên mẫu (`SES-HN-30K88888`, `SES-HN-30K56789`, …) về `LIVE` và đặt lại giờ. Vì vậy khởi động lại core có thể **hủy tác dụng của HALT** trên phiên mẫu.

**Cách sửa đề xuất.** Không đụng vào phiên `PAUSED`. Trong mỗi khối `findBySessionCode("...").ifPresent(s -> { ... })` của hàm, thêm dòng đầu:

```java
if (s.getStatus() == AuctionStatusEnum.PAUSED) return;   // phiên đang bị admin tạm dừng: không ghi đè
```

Đây là file của đồng đội, nên báo họ trước khi sửa. Phương án thay thế nhanh là tắt hẳn bộ khởi tạo bằng cờ cấu hình khi đã có dữ liệu thật.

**Kiểm tra.** HALT `SES-HN-30K56789`, khởi động lại core, rồi `SELECT status FROM auction_session WHERE session_code = 'SES-HN-30K56789'` vẫn là `PAUSED`.

---

## F6. Script Windows ghi cứng đường dẫn JDK

**Vấn đề.** `env-java21.ps1`, `run-core.ps1`, `run-admin.ps1`, `run-udp.ps1` đều đặt `JAVA_HOME = "C:\Users\trann\.jdks\ms-21.0.8"`, là đường dẫn của một máy. Trên máy khác thư mục này không tồn tại, nên `java` hoặc `mvn` không chạy được hoặc chạy nhầm bản.

**Cách sửa.** Để một chỗ duy nhất quyết định JDK. `env-java21.ps1`:

```powershell
# Ưu tiên biến JNP_JAVA_HOME (nếu bạn muốn chỉ định riêng), nếu không thì dùng JAVA_HOME của máy.
if ($env:JNP_JAVA_HOME) { $env:JAVA_HOME = $env:JNP_JAVA_HOME }
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Write-Host "Chưa có JAVA_HOME hợp lệ (cần JDK 21). Đặt JAVA_HOME hoặc JNP_JAVA_HOME rồi chạy lại." -ForegroundColor Red
    exit 1
}
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
java -version
```

Ba script còn lại bỏ hai dòng ghi cứng `JAVA_HOME` và `Path`, thay bằng:

```powershell
. "$PSScriptRoot\env-java21.ps1"
```

**Kiểm tra.** Mở PowerShell mới, chạy `.\run-udp.ps1` trên một máy không phải máy của `trann`, thấy `java -version` in JDK 21.

---

## F7. Script Windows không build jar và không đợi Core

**Vấn đề.**
- `run-admin.ps1` chạy `java -jar target\admin-console-1.0.0-jar-with-dependencies.jar` nhưng không build. Lần chạy đầu sẽ báo `Unable to access jarfile`.
- `start-all.ps1` chỉ chờ 2 giây giữa các cửa sổ, trong khi Core cần lâu hơn mới nghe cổng 8080. Admin Console mở ra sẽ gặp lỗi kết nối ở những lần polling đầu.

**Cách sửa.** `run-admin.ps1`, trước dòng `java -jar`:

```powershell
$jar = "target\admin-console-1.0.0-jar-with-dependencies.jar"
if (-not (Test-Path $jar)) {
    Write-Host "Chưa có jar, đang build Admin Console..." -ForegroundColor Yellow
    mvn -q -DskipTests package
}
```

`start-all.ps1`: thêm hàm chờ cổng và gọi nó giữa bước 2 và bước 3:

```powershell
function Wait-Port([int]$Port, [int]$TimeoutSec = 90) {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if (Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue) { return $true }
        Start-Sleep -Seconds 2
    }
    return $false
}

# sau khi mở run-core.ps1:
if (-not (Wait-Port 8080)) { Write-Host "Core chưa sẵn sàng sau 90 giây, kiểm tra cửa sổ Core." -ForegroundColor Red }
```

**Ghi chú về đọc cấu hình trên Windows.** `AdminConfig` đọc `tcp.control.secret`, `admin-console.core-admin-user` và `core-admin-password` từ `..\auction-core-service\src\main\resources\application.yml` theo đường dẫn tương đối. `run-admin.ps1` chạy từ thư mục `admin-console` nên đường dẫn này hợp lệ. Nếu chạy jar từ thư mục khác thì đặt biến môi trường `CORE_APPLICATION_CONFIG` trỏ tới file yml.

---

## Tác động lên database

| ID | Loại | Chi tiết |
|---|---|---|
| F1, F2, F3, F6, F7 | Không | Chỉ đổi code và script |
| F4 bước 1 | Chỉ đọc | Truy vấn catalog |
| F4 bước 2 | **Đổi schema** | Xóa và tạo lại ràng buộc CHECK của `auction_session`. Chỉ làm khi bước 1 cho thấy thiếu `PAUSED`, trên branch test |
| F5 | Không đổi schema | Chỉ ngăn bộ khởi tạo ghi đè `status` của phiên đang `PAUSED` |

## Danh sách kiểm tra sau khi sửa

- [ ] `POST /api/auth/google` với `mock:...` bị từ chối khi cờ tắt (F1).
- [ ] `./mvnw -q test` ở `auction-core-service` xanh, kể cả `AuthenticationControllerTest` (F1).
- [ ] Đăng nhập Google thật vẫn chạy (F1, F2).
- [ ] Thẻ RAM khớp Activity Monitor hoặc Task Manager trong khoảng 5% (F3).
- [ ] 30 phút chạy liên tục không còn cảnh báo RAM sai (F3).
- [ ] HALT ghi `PAUSED` vào Neon và chặn đặt giá (F4).
- [ ] Khởi động lại core không làm phiên `PAUSED` trở lại `LIVE` (F5).
- [ ] `start-all.ps1` chạy được trên máy Windows khác máy `trann` (F6, F7).
