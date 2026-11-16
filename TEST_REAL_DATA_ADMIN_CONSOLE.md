# Quy trình kiểm thử toàn project với dữ liệu thật

> Tài liệu dành cho Admin Console dùng dữ liệu Neon thật qua `auction-core-service`. Các bước nghiệm thu không dùng `MockAdminGateway`.

## 1. Phạm vi và nguyên tắc

```text
Web client ──REST/WebSocket──> Auction Core ──JPA──> Neon PostgreSQL
                                      ├──REST/TCP 9090──> Admin Console
                                      └──UDP 9001──> UDP Server ──UDP 8888──> Admin Console
```

Admin Console không kết nối JDBC trực tiếp tới Neon. Danh sách phiên/người tham gia và lệnh điều khiển đi qua Core; metrics/cảnh báo đi qua UDP.

**Chạy các kịch bản có ghi dữ liệu trên Neon branch/database dùng riêng để test.** Đặt giá, đăng ký, HALT/RESUME, KICK và đặc biệt CANCEL có thể cập nhật dữ liệu thật. CANCEL kết thúc phiên và hoàn cọc cho registration ACTIVE; không dùng với phiên phục vụ người dùng thật. Không chạy `UPDATE`, `DELETE`, `ALTER` thủ công để làm sạch dữ liệu.

Core có `AuctionDemoDataInitializer`: khi khởi động mà không có phiên LIVE còn hạn, nó có thể cập nhật các phiên mẫu (`SES-HN-30K88888`, `SES-HN-30K56789`, `SES-HCM-51K99999`, `SES-BN-99A99999`, `SES-QN-14A88888`). Ghi nhận trạng thái trước khi chạy và chỉ dùng các phiên này trên database test.

## 2. Chuẩn bị cấu hình

### 2.1 Công cụ

- JDK 21 trở lên; Maven hoặc Maven Wrapper `./mvnw`.
- Node.js/npm để chạy web client.
- Neon branch có schema project và dữ liệu đấu giá.
- Các service chạy trên cùng máy trong quy trình này.

### 2.2 Cấu hình Core cục bộ

Mở `source/server/auction-core-service/src/main/resources/application.yml` và kiểm tra:

- `spring.datasource.url`, `username`, `password` trỏ đúng Neon branch test.
- `tcp.control.secret` có giá trị bí mật dùng chung với Admin Console.
- `admin-console.core-admin-user` là `bao` và `admin-console.core-admin-password` khớp mật khẩu hiện tại của tài khoản Admin `bao` trong Core.
- Không đặt `ADMIN_DATA_SOURCE=mock`; mặc định của Admin Console là `core`.

Ví dụ cấu trúc YAML (thay phần giữ chỗ bằng cấu hình local; không commit password/secret):

```yaml
tcp:
  control:
    secret: "<TCP_CONTROL_SECRET>"

admin-console:
  core-admin-user: "bao"
  core-admin-password: "<mật khẩu của tài khoản bao>"
```

Admin Console ưu tiên biến môi trường nếu `CORE_ADMIN_USER`, `CORE_ADMIN_PASSWORD` hoặc `TCP_CONTROL_SECRET` được đặt. Xóa các biến cũ/không đúng trong terminal trước khi test để chúng không ghi đè YAML. Không đưa `application.yml`, mật khẩu Neon, JWT, SMTP password hoặc TCP secret vào Git/log/ảnh chụp màn hình.

### 2.3 Tài khoản test

- Dùng `bao` để đăng nhập Admin Console; tài khoản phải có role `ADMIN`.
- Cần ít nhất hai tài khoản `USER` khác để kiểm tra đăng ký/đặt giá. Core chặn ADMIN đặt giá.
- Tạo USER qua chức năng đăng ký của web client hoặc `POST /api/auth/register`, với `fullName`, `email`, `userName`, `password` duy nhất. Không tự chèn user bằng SQL.
- USER cần số dư khả dụng ít nhất bằng tiền cọc của phiên (mặc định 40.000.000 VND). Nạp tiền qua chức năng ví/client nếu cần; mức top-up tối đa cấu hình là 500.000.000 VND mỗi lần.

## 3. Build

Chạy từ thư mục gốc repository trên macOS/Linux:

```bash
cd source/server/auction-core-service
./mvnw -q -DskipTests package

cd ../admin-console
mvn -q -DskipTests package

cd ../udp-server
mvn -q -DskipTests package

cd ../../client/jnp.fe
npm install   # lần đầu hoặc khi dependency thay đổi
npm run build
```

Để chạy web client thay vì build production, dùng `npm run dev`. Không dùng `MockAdminGateway` hoặc `ADMIN_DATA_SOURCE=mock` trong các bước nghiệm thu real data.

## 4. Khởi động

Mở bốn terminal tại thư mục gốc repository và giữ tiến trình chạy.

### Terminal 1 — UDP Server

```bash
cd source/server/udp-server
mvn exec:java -Dexec.mainClass=com.auction.udp.UdpMetricsServerApp
```

### Terminal 2 — Auction Core

```bash
cd source/server/auction-core-service
./mvnw spring-boot:run
```

Chờ log xác nhận Core đã start, kết nối datasource thành công và lắng nghe HTTP `8080`, TCP `9090`. Nếu kết nối Neon lỗi, dừng tại đây; không sửa dữ liệu để né lỗi kết nối.

### Terminal 3 — Admin Console

```bash
cd source/server/admin-console
mvn -q -DskipTests package
ADMIN_DATA_SOURCE=core java -jar target/admin-console-1.0.0-jar-with-dependencies.jar
```

Đăng nhập bằng tài khoản Admin `bao` và mật khẩu cấu hình hiện tại. Các script `run-*.ps1` là PowerShell và có đường dẫn JDK dành riêng cho môi trường Windows; trên macOS dùng lệnh terminal ở đây.

### Terminal 4 — Web Client

```bash
cd source/client/jnp.fe
npm run dev
```

Mở URL Vite in ra (thường `http://localhost:5173`). Client development gọi Core tại `http://localhost:8080` theo cấu hình môi trường local.

## 5. Kịch bản test

### 5.1 Xác thực và quyền Admin

1. Đăng nhập Admin Console với `bao`; kiểm tra log không báo lỗi xác thực Core.
2. Xác nhận danh sách phiên/người tham gia tải được.
3. Đăng nhập bằng một USER thường rồi thử gọi API admin: yêu cầu phải bị từ chối `401`/`403`.
4. Nếu cấu hình báo thiếu hoặc đăng nhập sai, kiểm tra biến môi trường có ghi đè YAML không trước khi đổi code.

### 5.2 Phòng và người tham gia

1. Chọn một phiên `LIVE` có thật trong Neon.
2. So sánh mã phiên, trạng thái, giá, giờ kết thúc và số người tham gia với truy vấn chỉ đọc ở mục 7.
3. Kiểm tra ID người tham gia là `auth_user.id`, tên lấy từ hồ sơ cùng username, và chỉ registration `ACTIVE` được tính.
4. Tạo USER qua web/API, đăng nhập và đăng ký vào phiên còn nhận đăng ký. Refresh Admin Console; danh sách/số lượng phải cập nhật sau polling.
5. Hủy đăng ký từ USER nếu cần xác nhận số đếm giảm và registration đổi trạng thái. Ghi lại số dư/tiền cọc trước và sau.
6. RTT/kết nối cá nhân không phải presence được đọc từ database; kiểm tra metrics mạng tổng thể riêng ở 5.6.

### 5.3 Đặt giá và HALT/RESUME

Dùng phiên `LIVE` trên database test và USER có đủ tiền cọc. Ghi nhận giá, `bid_count`, `end_time`, số dư và held amount trước khi chạy.

1. USER đặt giá hợp lệ; xác nhận giá hiện tại và lịch sử bid thay đổi.
2. Admin chọn phiên và chạy **HALT**. Lệnh thành công, trạng thái chuyển `PAUSED`.
3. USER thử đặt giá khi paused. Core phải từ chối; không thêm bid và giá không đổi.
4. Chạy **RESUME**. Trạng thái trở lại `LIVE`; giá hợp lệ tiếp theo phải được ghi.
5. HALT một phiên không LIVE và RESUME phiên không paused: Core trả lỗi nghiệp vụ rõ ràng, UI không treo.

### 5.4 KICK

1. Đăng ký USER vào phiên test để lấy `auth_user.id` chính xác.
2. Từ Admin Console chọn phiên, nhập ID số của USER và chạy **KICK**.
3. USER đó đặt giá trong phiên vừa chọn: Core phải từ chối, không ghi bid mới. USER khác vẫn đặt giá được nếu phiên LIVE.
4. KICK được giữ trong bộ nhớ Core và mất khi Core khởi động lại; đây không phải khóa tài khoản toàn hệ thống.

### 5.5 CANCEL và hoàn cọc — thao tác ghi dữ liệu mạnh

Chỉ chạy trên Neon branch test với phiên test có registration ACTIVE.

1. Ghi lại trạng thái phiên, registrations, `wallet.balance`, `wallet.held_amount` và giao dịch ví trước thao tác.
2. Admin chạy **CANCEL** và xác nhận hộp thoại.
3. Kiểm tra phiên thành `END`; registration ACTIVE thành `CANCELLED`; tiền giữ được giải phóng và có giao dịch `RELEASE` tương ứng.
4. Refresh Admin Console để xác nhận phiên không còn ở trạng thái chạy/nhận giá.
5. Không CANCEL nếu chưa xác định đúng mã phiên và chưa ghi số liệu trước/sau. Dữ liệu đã hủy không tự khôi phục khi đóng app.

### 5.6 Metrics, cảnh báo và ổn định

1. Mở tab giám sát; kiểm tra CPU/RAM/online/bid-rate khi Core và UDP Server đang chạy.
2. UDP Server cần nhận `METRICS` từ Core; log Core cần thể hiện gửi metrics tới UDP `9001`.
3. Admin nhận metrics/cảnh báo ở UDP `8888`; Admin ping UDP Server ở `9002`. Xác nhận RTT cập nhật.
4. Dừng UDP Server có kiểm soát: Admin phải báo stale/mất kết nối sau ngưỡng, không xem số liệu cũ là mới. Khởi động lại UDP và xác nhận metrics tiếp tục.
5. Để kiểm tra độ ổn định, chạy 30 phút với tab giám sát mở; theo dõi log Core/UDP/Admin về polling, bind cổng, packet parse và cảnh báo stale.

### 5.7 ANNOUNCE và WebSocket (nếu demo thông báo)

1. Đăng nhập USER và mở một phòng trên web client.
2. Admin chọn phòng, gửi ANNOUNCE với nội dung test ngắn.
3. Kiểm tra lệnh thành công và client nhận thông báo đúng phòng; thử nội dung tiếng Việt/dấu cách.

### 5.8 Email biên bản

1. Cấu hình SMTP local (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`, `MAIL_FROM_NAME`) bằng biến môi trường của Admin hoặc `mail.properties` cục bộ.
2. Chỉ gửi sau khi phiên `END` và có người thắng; phiên CANCEL không có biên bản người thắng.
3. Chọn **Gửi email biên bản**, nhập mã phiên kết thúc, soát người thắng/biển số/giá/địa chỉ nhận rồi xác nhận.
4. Dùng mailbox test hoặc địa chỉ người nhận cho phép. Kiểm tra email nhận được khớp kết quả trong Neon.
5. Nếu chưa cấu hình SMTP, ghi nhận bước này là chưa kiểm thử SMTP; preview không chứng minh email gửi thành công.

## 6. Kiểm tra API bằng curl (tùy chọn)

Token giữ tạm trong biến shell; không `echo` token hoặc lưu token vào tài liệu/log:

```bash
TOKEN=$(curl -sS -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"userName":"bao","password":"<mật-khẩu-admin>"}' | jq -r '.data')

curl -i http://localhost:8080/api/v1/admin/auction/rooms \
  -H "Authorization: Bearer $TOKEN"

unset TOKEN
```

Kết quả dự kiến HTTP `200` và JSON khớp dữ liệu Neon. API chính:

| Mục | API |
|---|---|
| Đăng nhập | `POST /api/auth/login` |
| Danh sách phiên Admin | `GET /api/v1/admin/auction/rooms` |
| Người tham gia | `GET /api/v1/admin/auction/rooms/{sessionCode}/participants` |
| Metrics overview | `GET /api/v1/admin/metrics/overview` |
| Kết quả phiên | `GET /api/v1/admin/auction/rooms/{sessionCode}/result` |

HALT/RESUME/KICK/CANCEL/ANNOUNCE đi qua TCP `9090` và yêu cầu `AUTH` với `tcp.control.secret` dùng chung; không gửi lệnh không xác thực trên môi trường dùng chung.

## 7. Đối chiếu bằng SQL chỉ đọc trong Neon Console

Chạy trong Neon SQL Editor với đúng branch test. Các truy vấn dưới đây chỉ `SELECT`.

### 7.1 Phiên và số registration ACTIVE

```sql
SELECT s.id, s.session_code, s.status, s.current_price,
       s.start_time, s.end_time,
       COUNT(r.id) FILTER (WHERE r.status = 'ACTIVE') AS active_registrations
FROM auction_session s
LEFT JOIN auction_registration r ON r.session_id = s.id
GROUP BY s.id
ORDER BY s.start_time DESC;
```

### 7.2 Người tham gia và ánh xạ ID/tên

Đổi session code thành phiên đang kiểm tra:

```sql
SELECT u.id AS auth_user_id, u.username, i.full_name,
       r.status AS registration_status, r.deposit_amount
FROM auction_session s
JOIN auction_registration r ON r.session_id = s.id
JOIN auth_user u ON u.id = r.user_id
LEFT JOIN main_user_info i ON i.username = u.username
WHERE s.session_code = 'SES-HN-30K56789'
ORDER BY u.id;
```

### 7.3 Giá và bid history

```sql
SELECT s.session_code, s.status, s.current_price, s.bid_count, s.end_time,
       b.userid AS auth_user_id, b.bid_amount, b.bid_time, b.source
FROM auction_session s
LEFT JOIN bid_history b ON b.auction_session_id = s.id
WHERE s.session_code = 'SES-HN-30K56789'
ORDER BY b.bid_time DESC NULLS LAST
LIMIT 30;
```

### 7.4 Hoàn cọc

```sql
SELECT u.username, w.balance, w.held_amount,
       r.status AS registration_status, r.deposit_amount,
       tx.type, tx.amount, tx.balance_after, tx.held_after, tx.created_at
FROM auction_session s
JOIN auction_registration r ON r.session_id = s.id
JOIN auth_user u ON u.id = r.user_id
LEFT JOIN wallet w ON w.user_id = u.id
LEFT JOIN wallet_transaction tx ON tx.wallet_id = w.id
                              AND tx.session_code = s.session_code
WHERE s.session_code = 'SES-HN-30K56789'
ORDER BY tx.created_at DESC NULLS LAST;
```

Đối chiếu user bằng `auth_user.id`; `main_user_info.id` là dãy ID riêng và không được dùng thay cho ID tài khoản trong registration/bid.

## 8. Tiêu chí nghiệm thu

- [ ] Admin đăng nhập bằng user role ADMIN; user thường không gọi được API admin.
- [ ] Admin chạy `ADMIN_DATA_SOURCE=core`, không hiển thị dữ liệu mock.
- [ ] Danh sách phiên và số registration ACTIVE khớp Neon; DB không có phiên thì bảng không tự sinh phòng giả.
- [ ] Participant ID là `auth_user.id`; tên được nối qua username tới `main_user_info`.
- [ ] Đặt giá thành công làm thay đổi `bid_history`/`auction_session`.
- [ ] HALT chặn giá; RESUME mở lại đặt giá.
- [ ] KICK chặn đúng USER trong đúng phiên; trạng thái mất khi Core restart.
- [ ] CANCEL chỉ chạy ở branch test; session/registration/wallet transactions thể hiện hoàn cọc chính xác.
- [ ] UDP metrics và RTT cập nhật; mất UDP được thể hiện stale/mất kết nối.
- [ ] ANNOUNCE tới đúng client (nếu test luồng này).
- [ ] Email tới mailbox test và nội dung khớp kết quả thật (nếu SMTP đã cấu hình).
- [ ] Có log/ảnh và câu SELECT đối chiếu cho các mục đã kiểm thử; che email/token/secret khi chia sẻ.

## 9. Ghi nhận và xử lý lỗi

Ghi cho mỗi lượt test: ngày giờ, Neon branch, mã phiên, user thử nghiệm, giá trị trước/sau, kết quả mong đợi/thực tế, log liên quan, PASS/FAIL. Không ghi password, JWT, connection string hoặc SMTP secret.

| Triệu chứng | Kiểm tra đầu tiên |
|---|---|
| Core không start/lỗi datasource | Neon URL/user/password local, quyền branch, SSL và log Core; không dán credential vào issue/chat |
| Admin login thất bại / HTTP 401 | `bao` tồn tại và role ADMIN; password YAML đúng; kiểm tra env `CORE_ADMIN_*` có ghi đè không |
| Admin không tải danh sách (403) | Đăng nhập lại, role ADMIN và URL Core `http://localhost:8080` |
| Lệnh TCP thất bại | Core đang nghe 9090; secret Admin/Core trùng nhau; không có process khác chiếm cổng |
| Không có metrics | UDP Server chạy; Core gửi 9001; Admin nhận 8888; kiểm tra firewall/port conflict |
| Người tham gia/giá không khớp | So sánh `session_code`, `session_id`, `auth_user.id`; chỉ đếm registration ACTIVE; xác nhận đúng Neon branch |
| Email thất bại | Kiểm tra cấu hình SMTP và quyền gửi; không ghi SMTP password vào log |
