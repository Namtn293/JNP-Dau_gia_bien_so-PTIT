# Kế hoạch chi tiết: nối Admin Console với dữ liệu thật trên Neon

> Phạm vi: phần của **Bảo** (Admin Console, TCP 9090, UDP Telemetry, SMTP) theo `BAO_CAO_TIEN_DO.md`.
> Cơ sở: đọc mã nguồn tại commit `a469e56` (15/11/2026). Chưa biên dịch và chưa chạy thử vì môi trường phân tích không có mạng,
> nên mọi điểm ghi **(cần xác minh)** phải được kiểm tra khi thực hiện.

---

## 1. Mục tiêu và tiêu chí hoàn thành

**Mục tiêu:** mọi số liệu, danh sách và lệnh trên Admin Console đều đi từ database Neon (qua core) hoặc là số đo thật. Không còn giá trị cứng hay dữ liệu mẫu.

**Hoàn thành khi (Definition of Done):**

1. Bảng phòng khớp từng dòng với bảng `auction_session` trong Neon, và trống nếu bảng trống (không còn phòng giả).
2. Số người trong phòng khớp số đăng ký còn hiệu lực trong `auction_registration`.
3. Danh sách người tham gia hiện đúng ID (`auth_user.id`) và đúng họ tên.
4. HALT làm đặt giá bị từ chối thật. RESUME mở lại được. CANCEL hoàn cọc thật. KICK có tác dụng thật.
5. Email biên bản gửi cho người thắng thật, với biển số, giá và phiên thật.
6. Chạy 30 phút liên tục không còn cảnh báo giả về METRICS hoặc RAM.
7. Mỗi bước kiểm chứng được bằng SQL chỉ đọc (xem phụ lục C).

---

## 2. Kiến trúc dữ liệu

```
Neon (PostgreSQL)  ◄── JPA ──  Core (8080, TCP 9090)  ──REST/TCP──►  Admin Console (Swing)
                                   │ METRICS (UDP 9001)                    ▲  ▲
                                   ▼                                       │  │ PING/PONG (UDP 9002)
                               UDP Server ── METRICS + ALERT (UDP 8888) ───┘  │
                                   └──────────────────────────────────────────┘
```

Admin Console **không nối JDBC trực tiếp** vào Neon. Mọi dữ liệu đi qua core, vì thông tin đăng nhập database chỉ nên nằm ở core
và các lệnh (HALT, CANCEL…) cần logic nghiệp vụ như ví, đăng ký, broadcast.

**Hai không gian ID khác nhau (quan trọng):**

| Bảng | Khóa | Dùng ở |
|---|---|---|
| `auth_user` | `id` | JWT (`userId`), `bid_history.userid`, `auction_registration.user_id`, ví, `auction_session.user_info_id` |
| `main_user_info` | `id` (dãy riêng) | Hồ sơ: họ tên, email. Nối với `auth_user` qua **`username`** |

Ví dụ thực tế: tài khoản `test` có `auth_user.id = 9` nhưng `main_user_info.id = 7`. Mọi chỗ tra tên bằng `userInfoRepository.findById(userId)` đều sai.

---

## 3. Hiện trạng: những gì còn giả hoặc lỗi

| # | Vấn đề | Vị trí | Mức |
|---|---|---|---|
| 1 | **Core không biên dịch**: dùng `auctionRegistrationRepository`, `roomRoleResolver` nhưng không khai báo field và import | `AdminAuctionServiceImplement` (`getParticipants`, ~dòng 110 và 149) | Chặn |
| 2 | `getRooms` trả 8 phòng giả khi DB không có phiên | `getDefaultMockRooms()` | Mock |
| 3 | `getMetrics` REST trả số cứng (CPU 38, RAM 9.8/16, `online=251`, 11.7 bid/s, ping 29) | `getMetrics()`; chỉ core dùng `AdminServerMetricsVO`, không có consumer ngoài | Mock |
| 4 | `participantCount` đọc cột tĩnh `participant_count`, trong khi đã có bảng đăng ký | `getRooms()` | Mock |
| 5 | Tra tên người dùng sai không gian ID (`findAllById` trên `main_user_info` với ID của `auth_user`) | `getParticipants()` ~dòng 133 | Lỗi dữ liệu |
| 6 | `userId` định dạng `"U-" + %04d`, không phải ID thật | `getParticipants()` | Theo yêu cầu |
| 7 | `rttMs = 32` và `connection = "CONNECTED"` cố định cho mọi phòng và người | `getRooms()`, `getParticipants()` | Mock |
| 8 | HALT chỉ thêm vào `pausedRooms` trong bộ nhớ; `status` trong DB vẫn `LIVE` nên đặt giá vẫn thành công. Mất khi khởi động lại | `halt()` | Chức năng giả |
| 9 | CANCEL báo "hoàn 100% cọc" nhưng không gọi `WalletService.handleSessionCancelled` (đã có ở `WalletServiceImpl:331`) | `cancel()` | Chức năng giả |
| 10 | KICK chỉ phát thông báo, không có tác dụng | `kick()` | Chức năng giả |
| 11 | Cổng TCP 9090 không xác thực | `TcpControlServer` | Bảo mật |
| 12 | Email chỉ là mẫu (`AUC-1023`, có dòng "email mẫu"), không có mã QR như báo cáo mô tả | `MailTemplates`, `AdminConsoleUI.sendSampleMail` | Mock |
| 13 | `getRooms` làm khoảng 1 + N + M truy vấn tuần tự lên Neon | `getRooms()` | Hiệu năng |
| 14 | Parse nghiêm ngặt: `RoomStatus.valueOf`, `ConnectionState.valueOf`, một giá trị lạ làm hỏng cả bảng | `CoreAdminGateway.toRooms/toParticipants` | Độ bền |
| 15 | Tên người vận hành và ca trực là hằng số | `AdminConfig.OPERATOR_NAME/OPERATOR_ROLE` | Mock |
| 16 | Hai tab cùng poll `getRooms` mỗi giây; cảnh báo RAM sai trên macOS; cảnh báo METRICS trễ | admin + udp-server + `MetricsSampler` | Ổn định |

Đã có sẵn và đúng: `HALT ` có dấu cách, mã 401, `/api/v1/admin/**` yêu cầu ADMIN, gỡ `AUC-1023` và `U-0842` khỏi cấu hình, `MetricsSampler` đọc DB ở luồng nền,
`SessionControlPanel` không hỏng cả tab khi thiếu METRICS.

---

## 4. Quyết định thiết kế

| Vấn đề | Lựa chọn | Lý do |
|---|---|---|
| ID hiển thị của người dùng | **`auth_user.id`** (số thô, ví dụ `9`) | Là ID trong JWT, bid, đăng ký, ví. KICK, BAN dùng đúng ID này |
| Tra tên | `auth_user.id → username → main_user_info.username` | Hai bảng chỉ nối bằng username |
| `participantCount` | Đếm `auction_registration` có `status = ACTIVE` | Phản ánh người có quyền đặt giá thật |
| HALT | Lưu `status = PAUSED` vào DB | `BidServiceImpl` đã từ chối khi `status != LIVE` (`AUCTION_NOT_LIVE`), nên chặn đặt giá tự động |
| Thời gian khi RESUME | **Phương án A** (khuyến nghị): cộng cố định 30 giây như hiện nay, không đổi schema. Phương án B: thêm cột `paused_at` để cộng đúng thời gian đã dừng (đổi schema) | A đủ cho demo |
| KICK | **Phương án B** (khuyến nghị): chặn user đặt giá trong phòng đó đến hết phiên + phát thông báo. Phương án A: giữ thông báo, sửa lại lời báo cho đúng | Cần thêm một dòng kiểm tra trong `BidServiceImpl` của đồng đội |
| `rttMs`, `connection` theo từng người/phòng | Bỏ khỏi bảng hoặc hiển thị "—" cho đến khi core theo dõi được phiên STOMP | Core chưa có dữ liệu thật; tránh số giả |
| Metrics qua REST | Giữ **một** endpoint đọc từ `MetricsSampler`, dùng làm dự phòng và kiểm tra sức khỏe. Admin vẫn nhận qua UDP | Một nguồn sự thật |
| Lệnh khẩn cấp | **Giữ TCP 9090**, không thêm REST song song. Thêm bước xác thực | Là trọng tâm kiến thức mạng của dự án |
| Trạng thái `SETTLED` | Chưa làm | `BidServiceImpl` gán `user_info_id` theo người dẫn giá ở mỗi lượt đặt, nên không phân biệt được phiên bị hủy. Cần thêm cờ riêng (đổi schema) |

---

## 5. Kế hoạch thực hiện theo phase

Quy ước: mỗi mục là **một patch** gửi để review. `[core]` sửa `auction-core-service`, `[admin]` sửa `admin-console`, `[udp]` sửa `udp-server`.
Cỡ việc: S nhỏ, M vừa, L lớn (ước lượng).

### Phase 0: Cho hệ thống chạy lại được và lập baseline

**T0.1 `[core]` Khai báo hai field còn thiếu (S).** Trong `AdminAuctionServiceImplement`:

```java
// import
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.service.RoomRoleResolver;

// field (cạnh các repository khác; @RequiredArgsConstructor sẽ tự inject)
private final AuctionRegistrationRepository auctionRegistrationRepository;
private final RoomRoleResolver roomRoleResolver;
```

Kiểm tra: `./mvnw -q -DskipTests compile` thành công. Chạy `./mvnw test` để có baseline (hiện có `BidServiceTest`, `WalletServiceTest`, `ShillDetectionServiceTest`, `StepPriceCalculatorTest`).

**T0.2 Môi trường test (S).**
- **Tài khoản ADMIN không được đặt giá** (`BidServiceImpl` trả `FORBIDDEN`). Cần ít nhất 2 tài khoản USER (ví dụ `test`, `test2`), đăng ký qua `POST /api/auth/register`.
- Ví tự tạo khi cần, số dư khởi tạo mặc định 1.000.000.000 (cấu hình `auction.wallet`). Đăng ký tham gia phiên sẽ giữ cọc 40.000.000.
- `AuctionDemoDataInitializer` chạy khi core khởi động: nếu không còn phiên LIVE hợp lệ thì tự làm mới `SES-HN-30K88888`, `SES-HN-30K56789` (LIVE) và `SES-HCM-51K99999` (SOON). **Dùng các phiên này để test, không cần sửa tay bằng SQL.**

**T0.3 Kiểm tra DB chỉ đọc (S).** Chạy các câu ở phụ lục C.1 và C.2. Mục đích: biết constraint của `auction_session.status` có `PAUSED` không (cần cho T2.1), và tên các bảng ví.

**T0.4 Baseline (S).** Chạy lại các bước test 0 đến 5 đã thực hiện trước đây (đăng nhập admin, đặt giá, xem người tham gia) với core mới. Ghi lại kết quả để so sánh sau.

### Phase 1: Dữ liệu đọc hoàn toàn từ DB `[core]`

**T1.1 `getRooms` (M).**
1. Bỏ nhánh `if (sessions.isEmpty()) return getDefaultMockRooms();`, trả danh sách rỗng, và xóa phương thức `getDefaultMockRooms()`.
2. Gom truy vấn biển số và tỉnh theo lô (`findAllById`) thay cho `computeIfAbsent(... findById ...)` trong vòng lặp.
3. `participantCount` lấy từ truy vấn đếm. Thêm vào `AuctionRegistrationRepository`:

```java
@Query("select r.sessionId, count(r) from AuctionRegistration r " +
       "where r.status = com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum.ACTIVE " +
       "and r.sessionId in :ids group by r.sessionId")
List<Object[]> countActiveBySessionIds(@Param("ids") Collection<Long> ids);
```

4. `rttMs`: bỏ giá trị 32 (trả 0 hoặc bỏ trường theo quyết định ở mục 4). Admin hiển thị "—" khi 0.

*Kiểm tra:* khi `auction_session` trống, `GET /rooms` trả `[]`. Khi có phiên, từng dòng khớp câu SQL C.3. Số truy vấn mỗi lần gọi còn khoảng 4 (sessions, plates, provinces, registrations).

**T1.2 `getParticipants` (M).**
1. Thêm vào `UserInfoRepository`: `List<UserInfo> findByUserNameIn(Collection<String> userNames);` (truy vấn đọc, không đổi schema).
2. Thuật toán: gom `userId` (auth) từ `auction_registration` và `bid_history`, rồi `userRepository.findAllById(ids)` lấy username, rồi `userInfoRepository.findByUserNameIn(usernames)` lấy họ tên, và dựng `Map<authId, fullName>`.
3. `userId` trả về là `String.valueOf(authId)`, bỏ tiền tố `U-`.
4. Giữ `lastPrice` (giá cao nhất của người đó), `bidsInLast5s` (đếm lượt trong 5 giây gần nhất), `role`. Bỏ `rttMs` và `connection` cố định.
5. Không tìm thấy hồ sơ thì hiện `"Người dùng #<id>"` thay vì lỗi.

*Kiểm tra:* với `test` (auth 9, info 7), danh sách hiện `userId = "9"` và họ tên đúng của `test`, không phải của info id 9.

**T1.3 `getMetrics` REST (S).** Lấy từ `MetricsSampler.sample()` (CPU, RAM, online, bps). Bỏ các số cứng và nhánh `if (online == 0) online = 251`. Riêng `pingMs`: không đo được ở core, nên bỏ trường khỏi `AdminServerMetricsVO` (không có consumer ngoài core, xem mục 3 dòng 3).

**T1.4 Báo cáo cho đồng đội (S, không code).** Lỗi lệch ID ở `AuctionHistoryServiceImpl:155`, `PriceSeriesServiceImpl:56`, `AuctionSessionServiceImplement:198`, `ShillDetectionServiceImpl:307-308`. Gửi kèm cách sửa ở T1.2 để họ tự áp dụng.

### Phase 2: Lệnh điều khiển có tác dụng thật

Cả ba lệnh HALT, RESUME, CANCEL dùng `@Transactional` và `auctionSessionRepository.findBySessionCodeForUpdate(code)`, cùng cơ chế khóa dòng với `BidServiceImpl`, để không ghi đè nhau khi có người đang đặt giá.

**T2.1 HALT (M).**
- Chỉ nhận phiên `LIVE`; ngược lại trả `FAIL` kèm lý do.
- Đặt `status = PAUSED`, `save`, phát sự kiện `HALT` tới `/topic/room/{code}`. Bỏ `pausedRooms`.
- Trước khi làm: kiểm tra constraint (T0.3). **Nếu thiếu `PAUSED` cần `ALTER` (xem cảnh báo DB mục 6).**
- Cần xác minh: `AutoBidScheduler` có cố đặt giá khi phiên PAUSED không (kỳ vọng bị `AUCTION_NOT_LIVE` chặn và chỉ ghi log).

**T2.2 RESUME (S).**
- Chỉ nhận phiên `PAUSED`; đặt `status = LIVE`; `endTime`: nếu đã quá hạn thì `now + 30 giây`, ngược lại `endTime + 30 giây` (logic hiện có); phát `RESUME`.
- `AuctionBackgroundService` chỉ tự chốt phiên `LIVE` và `SOON`, nên phiên `PAUSED` không bị tự kết thúc.

**T2.3 CANCEL (M).**
- Cho phép với `SOON`, `LIVE`, `PAUSED`; đặt `status = END`.
- Gọi `walletService.handleSessionCancelled(session.getId())` (hoàn cọc cho các đăng ký `ACTIVE`, ghi giao dịch `RELEASE`, đổi đăng ký sang `CANCELLED`).
- Gọi `autoBidScheduler.cancelSessionTasks(session.getId())` như `AuctionBackgroundService.handleEndSession`.
- Thông báo kết quả nêu số người được hoàn cọc thật, không hứa suông "100%".

**T2.4 KICK (M).**
- Kiểm tra `userId` là số hợp lệ.
- Phương án B: thêm tập `kicked` (khóa `roomId:userId`) trong core và một dòng kiểm tra ở `BidServiceImpl.placeBid` (từ chối với `FORBIDDEN`). **Phải thống nhất với đồng đội vì sửa file của họ.** Phát sự kiện `KICK`.
- Khóa vĩnh viễn tài khoản là việc của REST `POST /users/{userId}/ban` (có sẵn), không thuộc KICK.

**T2.5 Xác thực cổng TCP 9090 `[core]` `[admin]` (M).**
- Core: biến môi trường `TCP_CONTROL_SECRET`. Dòng đầu mỗi kết nối phải là `AUTH <secret>`, sai thì `FAIL Unauthorized` và đóng. Vẫn mặc định lắng nghe `127.0.0.1`.
- Admin: `CoreTcpClient` mở một kết nối cho mỗi lệnh (kết nối, ghi một dòng, đọc một dòng, đóng), nên cần ghi `AUTH ...` rồi mới ghi lệnh và đọc hai phản hồi.
- Kiểm tra: gửi lệnh không có `AUTH` bằng `nc 127.0.0.1 9090` thì bị từ chối.

### Phase 3: Admin Console `[admin]`

**T3.1 Parse chịu lỗi (S).** Trong `CoreAdminGateway`, thay `RoomStatus.valueOf` và `ConnectionState.valueOf` bằng hàm an toàn: giá trị lạ thì ghi log và dùng mặc định, không làm hỏng cả bảng.

**T3.2 Hiển thị dữ liệu thật (S).** `rttMs` bằng 0 thì hiện "—". Thêm cột "Vai trò" nếu muốn (`ParticipantInfo` thêm `role`; core đã trả trường này).

**T3.3 Email biên bản thật (L).**
1. `[core]` Thêm `GET /api/v1/admin/auction/rooms/{code}/result` trả `{ sessionCode, plate, status, finalPrice, depositAmount, winnerUserId, winnerName, winnerEmail, endTime }`. Người thắng lấy từ `session.userInfoId` (là `auth_user.id`), rồi qua `username` tới `main_user_info.email`. Chỉ trả khi phiên đã `END` và có người thắng.
2. `[admin]` Thêm `fetchResult(roomId)` vào gateway. Thêm nút "Gửi email biên bản", chỉ bật khi phòng đã đóng. Hộp thoại xác nhận cho phép đổi địa chỉ nhận để demo bằng email của bạn.
3. `[admin]` `MailTemplates.winnerNotice` dùng dữ liệu thật, bỏ dòng "email mẫu".
4. Mã QR (báo cáo có mô tả, code chưa có): tùy chọn. `SmtpMailClient` hiện gửi văn bản thuần, nên gắn QR cần MIME multipart và một thư viện sinh QR (ví dụ ZXing). **Chỉ làm nếu thời gian còn.**

**T3.4 Tên người vận hành (S).** Hiển thị tên tài khoản đăng nhập (`CORE_ADMIN_USER`), bỏ hằng số `OPERATOR_NAME` và ca trực cố định.

**T3.5 Thông báo phòng (S).** Ô nhập nội dung và nút "Phát thông báo" gọi TCP `ANNOUNCE <roomId> <nội dung>` (core đã hỗ trợ).

**T3.6 Cảnh báo thổi giá (M, tùy chọn có giá trị demo).** Tab mới: bảng từ `GET /api/v1/admin/shill-alerts`, nút Xác nhận / Bỏ qua (`PUT /shill-alerts/{id}`), nút Khóa tài khoản (`POST /users/{userId}/ban`, có hộp thoại xác nhận). Làm mới bằng polling 5 giây; Swing chưa có STOMP client nên không nghe `/topic/admin/alerts`.

**T3.7 Nhãn nguồn dữ liệu (S).** Khi `ADMIN_DATA_SOURCE=mock` hiện dải cảnh báo "DỮ LIỆU MẪU" để không ai nhầm với dữ liệu thật.

### Phase 4: Giám sát ổn định

Làm sau khi có số liệu đo ở T4.1.

**T4.1 Đo trước khi sửa (S).** Đo độ trễ truy vấn: `curl -m 60 -w "%{time_total}s" .../rooms`. Xem log core tìm `HikariPool` hoặc `timeout`.

**T4.2 `[admin]` Dùng chung một lần gọi `getRooms` (S).** Hai tab cùng gọi mỗi giây. Thêm bộ nhớ đệm khoảng 800 ms trong `CoreAdminGateway.fetchRooms`, hoặc nới chu kỳ poll lên 2 giây.

**T4.3 `[core]` Đo RAM đúng theo hệ điều hành (M).** `getFreeMemorySize()` của JDK trên macOS chỉ tính trang trống nên báo khoảng 99%. Dùng "bộ nhớ khả dụng":
- Linux: `MemAvailable` trong `/proc/meminfo`.
- macOS: công thức giống Activity Monitor, `App (anonymous − purgeable) + Wired + Compressed` từ `vm_stat`, đọc ở luồng nền, cache 5 giây.
- Hệ khác: giữ cách của JDK.
- Chấp nhận khi sai lệch dưới khoảng 5% so với Activity Monitor (cần xác minh trên máy thật).

**T4.4 `[udp]` Cảnh báo chỉ khi vượt ngưỡng liên tục (S).** Chỉ báo khi `ram` hoặc `cpu` vượt ngưỡng liên tục ít nhất N giây (ví dụ 30), và nhắc lại thưa hơn 10 giây hiện nay. Biến môi trường đã có: `RAM_WARN`, `RAM_CRIT`, `CORE_STALE_MS`.

**T4.5 Nới ngưỡng khi chạy máy yếu (S).** Nếu máy chỉ có 8 GB, đóng bớt ứng dụng nặng hoặc dùng `JAVA_TOOL_OPTIONS=-Xmx512m` cho core. `CORE_STALE_MS` và `DATA_STALE_MS` có thể nâng lên 5000 chỉ như giải pháp tạm.

### Phase 5: Kiểm thử đầu cuối, tài liệu, demo

**T5.1 Kiểm thử tự động `[core]` (M).** Thêm `AdminAuctionServiceTest` (Mockito) với các ca: DB trống thì `getRooms` trả `[]`; `getParticipants` ánh xạ đúng `auth_user.id` sang họ tên; `halt` từ chối phiên không `LIVE`; `halt` đặt `PAUSED`; `cancel` gọi `handleSessionCancelled`.

**T5.2 Kịch bản kiểm thử tay:** xem phụ lục B.

**T5.3 Tài liệu (S).** Cập nhật `README.md` gốc: cách chạy 4 thành phần, bảng biến môi trường (phụ lục D), kịch bản demo; cập nhật `API_LIST.md` sau khi sửa API; thêm ảnh demo vào `statics/` (mục 6, việc số 4 trong `BAO_CAO_TIEN_DO.md`).

---

## 6. Tác động lên database

| Task | Loại tác động | Chi tiết | Hoàn tác |
|---|---|---|---|
| T0.3, T1.x, T3.3 | **Chỉ đọc** | Thêm truy vấn mới, không đổi schema | Không cần |
| T2.1 | **Có thể cần `ALTER`** | Constraint `status` của `auction_session` có thể thiếu `PAUSED` (bản `schema.sql` cũ ghi `SOON, LIVE, END`) | Đưa constraint về như cũ |
| T2.1, T2.2 | **Ghi dữ liệu** | Đổi `auction_session.status`, `end_time` | Chạy lại `UPDATE` để mở phiên |
| T2.3 | **Ghi dữ liệu** | `status = END`; `auction_registration.status = CANCELLED`; `wallet.held_amount` giảm; thêm dòng giao dịch `RELEASE` | Khó hoàn tác, chỉ test trên phiên và tài khoản demo |
| T2.4 (B) | Không | Trạng thái bị kick giữ trong bộ nhớ, mất khi khởi động lại | Khởi động lại core |
| Phương án B của RESUME | **Đổi schema** | Thêm cột `paused_at` (Hibernate `ddl-auto: update` tự thêm) | Chỉ làm khi đã duyệt |

**Quy tắc làm việc:** mỗi câu `UPDATE`, `ALTER` được gửi trước để bạn duyệt, ghi rõ "CHƯA CHẠY"; luôn ghi lại giá trị cũ trước khi sửa dữ liệu test. Mật khẩu Neon chỉ nằm trong `application.yml` (đã ra khỏi git); bản zip từng gửi có chứa nó nên **cần đổi mật khẩu**.

---

## 7. Thứ tự, phụ thuộc và cột mốc

```
T0.1 → T0.2 → T0.3 → T0.4          (M1: hệ thống chạy lại được)
        ↓
T1.1 → T1.2 → T1.3                  (M2: dữ liệu đọc 100% thật)
        ↓
T2.1 → T2.2 → T2.3 → T2.4 → T2.5    (M3: lệnh có tác dụng thật)
        ↓
T3.1 → T3.2 → T3.3 → T3.4 → T3.5    (M4: Admin Console hoàn chỉnh) ; T3.6, T3.7 tùy chọn
        ↓
T4.1 → T4.2 → T4.3 → T4.4           (M5: giám sát ổn định)
        ↓
T5.1 → T5.2 → T5.3                  (M6: sẵn sàng demo)
```

Đường găng: T0.1 chặn mọi bước khác. T2.1 phụ thuộc kết quả T0.3. T3.3 phụ thuộc T1.2 (cách tra người dùng). T4.2 và T4.3 độc lập, có thể làm song song với Phase 3.

| Cột mốc | Điều kiện đạt |
|---|---|
| M1 | Core và admin chạy, test cũ của đồng đội vẫn xanh, kết quả baseline khớp |
| M2 | Mục 1, 2, 3 của Definition of Done; mục 3 hiện đúng khi dùng tài khoản `test` |
| M3 | Mục 4 của Definition of Done, kèm kiểm chứng SQL cho E4 đến E7 |
| M4 | Mục 5 của Definition of Done |
| M5 | Mục 6 của Definition of Done |
| M6 | Chạy hết kịch bản phụ lục B không lỗi, README và demo xong |

---

## 8. Rủi ro và giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Sửa `BidServiceImpl` (KICK) xung đột với đồng đội | Trao đổi trước; thay đổi chỉ một dòng kiểm tra; nếu không đồng ý thì dùng phương án A |
| Constraint `status` không cho `PAUSED` | Kiểm tra ở T0.3 trước khi code T2.1 |
| CANCEL hoàn tiền trên dữ liệu thật | Chỉ test trên phiên demo, ghi lại số dư ví trước |
| Neon có độ trễ cao làm bảng chậm | T1.1 giảm số truy vấn; T4.2 giảm tần suất gọi |
| Tên bảng ví khác với giả định trong SQL phụ lục | Tra bằng câu C.2 trước |
| Máy 8 GB thiếu RAM làm trễ METRICS | T4.3, T4.5; đóng bớt ứng dụng khi demo |
| Hệ thống đồng đội đổi tiếp trên `origin/main` | Merge thường xuyên; mỗi patch nhỏ để dễ xử lý xung đột |

---

## Phụ lục A. Biến môi trường

| Biến | Thuộc | Mặc định | Ý nghĩa |
|---|---|---|---|
| `ADMIN_DATA_SOURCE` | admin | `core` | `core` hoặc `mock` |
| `CORE_BASE_URL` | admin | `http://localhost:8080` | Địa chỉ REST của core |
| `CORE_TCP_HOST`, `CORE_TCP_PORT` | admin | `localhost`, `9090` | Kênh lệnh |
| `CORE_ADMIN_USER`, `CORE_ADMIN_PASSWORD` | admin | rỗng | Tài khoản **ADMIN** để đăng nhập REST. Bắt buộc |
| `RTT_WARN_MS`, `RTT_CRIT_MS` | admin | 150, 300 | Ngưỡng cảnh báo RTT |
| `RAM_WARN`, `RAM_CRIT`, `CORE_STALE_MS` | udp-server | 85, 95, 3000 (cần xác minh giá trị `RAM_WARN`) | Ngưỡng cảnh báo |
| `tcp.control.host`, `tcp.control.port` | core | `127.0.0.1`, `9090` | Cổng TCP |
| `TCP_CONTROL_SECRET` | core, admin | (mới, T2.5) | Khóa xác thực TCP |
| Cấu hình SMTP | admin | | Xem `MailConfig.fromEnv()` |

## Phụ lục B. Kịch bản kiểm thử đầu cuối

Chuẩn bị: core chạy (phiên demo LIVE), admin chạy với tài khoản ADMIN, hai tài khoản USER `test` và `test2`.

| ID | Bước | Kết quả mong đợi | Kiểm chứng |
|---|---|---|---|
| E1 | Mở Admin Console | Bảng phòng khớp `auction_session`; DB trống thì bảng trống | SQL C.3 |
| E2 | `test` và `test2` đăng ký tham gia một phiên | `participantCount` của phòng tăng đúng 2 | SQL C.4 |
| E3 | `test` đặt giá | Tab Điều khiển hiện `userId = <auth id>` và họ tên đúng | SQL C.5 |
| E4 | HALT phiên | Trạng thái "Tạm dừng"; `test` đặt giá bị từ chối (`AUCTION_NOT_LIVE`) | `status = PAUSED` |
| E5 | RESUME | Về "Đang đấu giá"; `end_time` tăng; đặt giá lại được | SQL C.3 |
| E6 | KICK `test` | `test` không đặt giá được nữa trong phòng; `test2` vẫn đặt được | Phản hồi lỗi của `test` |
| E7 | CANCEL một phiên có đăng ký | `status = END`; đăng ký thành `CANCELLED`; ví hoàn cọc | SQL C.4 và C.6 |
| E8 | Phiên kết thúc có người thắng, gửi email | Email đến đúng người, đúng biển, giá, phiên | Hộp thư |
| E9 | Tắt core 1 phút rồi bật lại | Console báo mất kết nối, không treo, tự khôi phục | Nhật ký |
| E10 | Chạy liên tục 30 phút | Không còn cảnh báo METRICS và RAM giả | Nhật ký |

## Phụ lục C. SQL kiểm tra (tất cả chỉ đọc)

```sql
-- C.1 Constraint của auction_session (kiểm tra PAUSED)
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint WHERE conrelid = 'auction_session'::regclass;

-- C.2 Danh sách bảng (tra tên bảng ví)
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1;

-- C.3 Tổng quan phiên
SELECT session_code, status, start_time, end_time, current_price, participant_count
FROM auction_session ORDER BY id;

-- C.4 Số đăng ký theo phiên và trạng thái
SELECT s.session_code, r.status, count(*)
FROM auction_registration r JOIN auction_session s ON s.id = r.session_id
GROUP BY s.session_code, r.status ORDER BY 1, 2;

-- C.5 Người đặt giá: đối chiếu hai không gian ID
SELECT b.id, s.session_code, b.userid AS auth_id, a.username, m.id AS info_id, m.full_name, b.bid_amount, b.bid_time
FROM bid_history b
JOIN auction_session s ON s.id = b.auction_session_id
LEFT JOIN auth_user a ON a.id = b.userid
LEFT JOIN main_user_info m ON m.username = a.username
ORDER BY b.bid_time DESC LIMIT 20;

-- C.6 Giao dịch ví (thay tên bảng theo kết quả C.2)
SELECT * FROM wallet_transaction ORDER BY id DESC LIMIT 20;
```

## Phụ lục D. Lệnh chạy

```bash
# 1. UDP Server
cd source/server/udp-server && mvn exec:java -Dexec.mainClass=com.auction.udp.UdpMetricsServerApp

# 2. Core
cd source/server/auction-core-service && ./mvnw spring-boot:run

# 3. Admin Console
cd source/server/admin-console && mvn clean package
export CORE_ADMIN_USER=<tài khoản ADMIN>
read -s "CORE_ADMIN_PASSWORD?Mật khẩu admin: "; export CORE_ADMIN_PASSWORD
java -jar target/admin-console-1.0.0-jar-with-dependencies.jar

# 4. Client web (để tạo lượt đặt giá khi test)
cd source/client/jnp.fe && npm run dev
```
