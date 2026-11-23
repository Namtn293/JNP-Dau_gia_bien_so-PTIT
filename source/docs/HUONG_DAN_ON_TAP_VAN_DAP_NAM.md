# TÀI LIỆU ÔN TẬP VÀ VẤN ĐÁP BẢO VỆ DỰ ÁN — LẬP TRÌNH MẠNG (JNP)
## DÀNH RIÊNG CHO: TRẦN NHẬT NAM (MSSV: B23DCCN592 — TRƯỞNG NHÓM 05)

---

## 📌 PHẦN 1: THÔNG TIN CHUNG & PHẠM VI NHIỆM VỤ

- **Họ và tên:** Trần Nhật Nam
- **Mã sinh viên:** B23DCCN592
- **Vai trò trong nhóm:** Trưởng nhóm (Nhóm 05)
- **Đề tài bài tập lớn:** Sàn đấu giá trực tuyến biển số xe ô tô theo thời gian thực (Mô phỏng Nghị định 39/2023/NĐ-CP)
- **Giảng viên hướng dẫn & chấm thi:** TS. Đặng Ngọc Hùng — Khoa CNTT 1, PTIT
- **Các phân hệ & giao thức mạng do Nam trực tiếp thiết kế và làm chủ:**
  1. **HTTP/1.1 REST Server (Cổng 8080):** Spring Boot 3 MVC, Spring Security 6, JWT Filter, Stateless API, Phân quyền người dùng & Quản trị.
  2. **WebSocket / STOMP Broker Server (Cổng 8080/ws):** RFC 6455 Handshake, STOMP 1.2 Protocol, Channel Interceptor xác thực Token trên Socket, Topics Broadcast & Queues cá nhân.
  3. **JDBC over TLS (Cổng 5432):** Kết nối mã hóa tới Cloud PostgreSQL (Neon), cấu hình HikariCP Connection Pool, xử lý tranh chấp đặt giá đồng thời bằng **Pessimistic Write Lock (`SELECT ... FOR UPDATE`)**.
  4. **Background Scheduler (Quét định kỳ 2s):** Quản lý vòng đời phiên đấu giá (`SOON` $\rightarrow$ `LIVE` $\rightarrow$ `END`), chống Race Condition giữa DB Transaction và WebSocket Broadcast.
  5. **Nghiệp vụ Quyết toán & Ký quỹ ví (Escrow Engine):** Cơ chế Phong tỏa cọc (`HOLD`), Khấu trừ (`CAPTURE`), Hoàn trả 100% (`RELEASE`), chống tự đè giá và thuật toán gia hạn phút chót (Anti-Sniping).
  6. **Cầu nối phối hợp liên giao thức:** Kích hoạt gửi mail SMTP (:587), tiếp nhận lệnh điều hành khẩn cấp từ Raw TCP (:9090), cung cấp dữ liệu cho UDP Telemetry (:9001).

---

## 🌐 PHẦN 2: KIẾN THỨC BẢN CHẤT CÁC GIAO THỨC MẠNG TRONG DỰ ÁN

### 1. Giao thức HTTP/1.1 REST API (Cổng 8080)
- **Bản chất tầng mạng:** Chạy trên tầng Application của mô hình TCP/IP, sử dụng giao vận TCP tin cậy ở tầng Transport. Mỗi request đều tuân theo mô hình Client-Server dạng Request / Response.
- **Tính phi trạng thái (Stateless):** Server không lưu phiên (Session) của người dùng trong RAM (`SessionCreationPolicy.STATELESS`). Thay vào đó, sau khi đăng nhập thành công (`/api/auth/login`), Server ký số và cấp cho Client một chuỗi **JWT (JSON Web Token)**. Mỗi request tiếp theo của Client bắt buộc phải đính kèm Header:
  ```http
  Authorization: Bearer <token_jwt>
  ```
- **Cơ chế hoạt động trong code (`SecurityConfig.java` & `AuthenticationFilter.java`):**
  - Khi có request gửi đến cổng 8080, request đi qua `SecurityFilterChain`.
  - Filter `AuthenticationFilter` bóc tách header `Authorization`, dùng khóa bí mật `secret-key` giải mã HMAC-SHA256 để lấy `username` và danh sách quyền (`RoleEnum.USER` hoặc `RoleEnum.ADMIN`).
  - Nạp thông tin định danh vào `SecurityContextHolder.getContext().setAuthentication(auth)`.
  - Phân quyền endpoint:
    - `/api/auth/**`: `permitAll()` (Ai cũng gọi được để đăng ký/đăng nhập).
    - `/api/v1/admin/**`: Bắt buộc `hasRole('ADMIN')`.
    - `/api/v1/auction/get`, `/api/v1/auction/room/**`: `permitAll()` (Khách chưa đăng nhập vẫn tra cứu và xem phòng được).
    - `/api/v1/auction/register` (nộp cọc), `/api/v1/wallet/**` (nạp tiền): Bắt buộc `.authenticated()`.

---

### 2. Giao thức WebSocket & STOMP Protocol (Cổng 8080/ws) — Trọng tâm số 1 của môn học

#### A. Tại sao dự án không dùng HTTP mà phải dùng WebSocket?
| Tiêu chí so sánh | HTTP / HTTP Polling | WebSocket (RFC 6455) |
| :--- | :--- | :--- |
| **Kiểu truyền tin** | Half-Duplex (Client hỏi, Server mới trả lời) | **Full-Duplex** (Cả 2 bên gửi nhận độc lập cùng lúc) |
| **Số kết nối TCP** | Tạo mới liên tục hoặc tái sử dụng Keep-Alive | **Duy trì duy nhất 1 kết nối TCP lâu dài** |
| **Overhead gói tin** | Rất nặng: Mỗi request gửi lại 500B – 1KB headers | **Siêu nhẹ:** Frame header chỉ từ **2 đến 10 bytes** |
| **Độ trễ (Latency)** | 200ms – 1000ms (Phụ thuộc chu kỳ Polling) | **Cực thấp: < 15ms** (Server đẩy ngay khi có giá mới) |

#### B. Cơ chế bắt tay nâng cấp kết nối (WebSocket Handshake Upgrade)
1. Ban đầu, Client gửi một HTTP GET Request bình thường lên endpoint `http://localhost:8080/ws` với các header đặc biệt:
   ```http
   GET /ws HTTP/1.1
   Host: localhost:8080
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
   Sec-WebSocket-Version: 13
   ```
2. Trong mã nguồn, `ClientIpHandshakeInterceptor.java` chặn bước này để lấy địa chỉ IP thực của người dùng (`X-Forwarded-For` hoặc `RemoteAddr`) và lưu vào thuộc tính phiên WebSocket (`CLIENT_IP_ATTR`).
3. Server chấp nhận nâng cấp và phản hồi mã trạng thái **HTTP 101 (Switching Protocols)**:
   ```http
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
   ```
4. Kể từ thời điểm này, kết nối TCP không đóng lại mà chuyển hoàn toàn sang truyền nhận các Frame nhị phân của giao thức WebSocket.

#### C. Tại sao phải dùng giao thức STOMP chạy trên WebSocket?
- **Vấn đề:** Bản thân WebSocket thuần chỉ định nghĩa cách truyền chuỗi byte/text thô (Raw stream). Nó không quy định format tin nhắn, không có khái niệm "gửi cho phòng nào", "ai đang lắng nghe kênh nào". Nếu dùng WebSocket thuần, lập trình viên phải tự chế giao thức phân tuyến tin nhắn.
- **Giải pháp:** Sử dụng **STOMP (Simple Text Oriented Messaging Protocol 1.2)**. STOMP hoạt động như một lớp khung (Frame) định dạng chuẩn chạy trên tầng WebSocket:
  ```text
  COMMAND
  header1:value1
  header2:value2

  Body Content^@
  ```
- **Các Frame STOMP thực tế luân chuyển trong hệ thống:**
  1. `CONNECT`: Client gửi token xác thực qua header `Authorization`.
  2. `CONNECTED`: Server xác thực thành công và báo phiên làm việc sẵn sàng.
  3. `SUBSCRIBE`: Client đăng ký kênh, ví dụ: `destination: /topic/auction/SES-HN-30K99999`.
  4. `SEND`: Client bắn gói tin đặt giá lên `destination: /app/bid/SES-HN-30K99999`.
  5. `MESSAGE`: Server broadcast thông tin bước giá mới về cho toàn bộ Client trong phòng.

#### D. Kiến trúc Broker trong Spring (`WebSocketConfig.java`):
- `config.enableSimpleBroker("/topic", "/queue")`: Khởi tạo Simple In-Memory Message Broker:
  - `/topic`: Kênh truyền thông tin phát thanh (Publish-Subscribe) tới nhiều người (Broadcast).
  - `/queue`: Kênh truyền điểm-điểm (Point-to-Point) gửi riêng cho từng cá nhân.
- `config.setApplicationDestinationPrefixes("/app")`: Mọi gói tin Client gửi lên có tiền tố `/app` sẽ được chuyển vào các hàm xử lý `@MessageMapping` trong `AuctionWebSocketController.java`.
- `config.setUserDestinationPrefix("/user")`: Định tuyến các thông báo riêng của người dùng (ví dụ: `/user/queue/notifications`).

#### E. Bảo mật tầng Socket (`WebSocketAuthChannelInterceptor.java`):
- **Chống gian lận bypass Controller:** Nếu Client cố tình gửi lệnh `SEND` trực tiếp vào `/topic/**` hoặc `/queue/**`, Interceptor sẽ ném lỗi `FORBIDDEN_DESTINATION` ngay lập tức. Mọi lệnh bắt buộc phải qua `/app/**` để Controller kiểm tra logic nghiệp vụ.
- **Xác thực Frame `CONNECT`:** Bóc tách Token JWT. Nếu hợp lệ $\rightarrow$ gắn `AuctionUserPrincipal` vào Socket Session. Nếu không có token $\rightarrow$ gắn quyền `ROLE_ANONYMOUS` (cho phép khách vãng lai chỉ xem thông tin phiên, không được đặt giá hay chat).

---

### 3. Giao thức JDBC over TLS (Cổng 5432) & Xử lý Tranh chấp Đặt giá

#### A. Mã hóa đường truyền cơ sở dữ liệu (TLS/SSL):
- URL kết nối trong `application.yaml`:
  ```yaml
  url: jdbc:postgresql://ep-little-snow-a13y3z11-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
  ```
- Toàn bộ câu lệnh SQL, dữ liệu đặt giá, thông tin ví tiền gửi từ Server lên Cloud Neon PostgreSQL đều được mã hóa bằng TLS 1.3, ngăn chặn nghe lén (Sniffing) hoặc tấn công Man-in-the-Middle trên hạ tầng mạng công cộng.

#### B. Cơ chế Connection Pool (HikariCP):
- Thay vì mỗi lần truy vấn lại phải thực hiện bắt tay 3 bước TCP + Bắt tay TLS với PostgreSQL (mất 100-300ms), HikariCP duy trì sẵn một nhóm kết nối socket mở sẵn. Các Thread chỉ việc mượn kết nối có sẵn để thực thi câu lệnh SQL và trả lại pool ngay sau khi commit transaction.

#### C. Giải quyết bài toán Concurrency (Đặt giá đồng thời cùng một mili-giây):
- **Kịch bản thực tế:** Giả sử biển số đang có giá `100.000.000 VNĐ`. Đúng giây thứ 59, có 50 người cùng bấm nút đặt giá `105.000.000 VNĐ` tại cùng một thời điểm.
- **Nếu không khóa:** Cả 50 thread đều đọc được giá hiện tại là 100 triệu, kiểm tra 105 triệu là hợp lệ và cùng ghi đè vào DB $\rightarrow$ Xảy ra lỗi **Lost Update**, dữ liệu phiên bị sai lệch nghiêm trọng.
- **Giải pháp trong dự án (`AuctionSessionRepository.java`):**
  ```java
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select a from AuctionSession a where a.sessionCode = :code")
  Optional<AuctionSession> findBySessionCodeForUpdate(@Param("code") String code);
  ```
  Câu lệnh SQL sinh ra là:
  ```sql
  SELECT * FROM auction_session WHERE session_code = ? FOR UPDATE;
  ```
- **Nguyên lý hoạt động:**
  1. Thread đầu tiên vào Database sẽ giành được khóa độc quyền (**Pessimistic Exclusive Lock**) trên hàng (row) của phiên đấu giá đó.
  2. 49 thread còn lại bị hệ quản trị cơ sở dữ liệu tạm dừng (block) ở tầng socket TCP.
  3. Thread 1 kiểm tra điều kiện, ghi nhận giá mới `105.000.000 VNĐ`, cập nhật `userInfoId`, commit transaction và nhả khóa.
  4. Lúc này Thread 2 mới được vào đọc dữ liệu, nhưng giá hiện tại trong DB đã là 105 triệu $\rightarrow$ Thread 2 thấy giá 105 triệu không còn lớn hơn giá hiện tại $\rightarrow$ Ném ngoại lệ `BusinessException(ErrorCode.BID_TOO_LOW)` và từ chối đặt giá.
  $\rightarrow$ **Kết quả:** Hệ thống an toàn tuyệt đối, duy nhất 1 người thành công, 49 người còn lại nhận thông báo giá sàn đã thay đổi.

---

## ⚙️ PHẦN 3: NGHIỆP VỤ ĐẤU GIÁ CỐT LÕI (DO NAM LÀM CHỦ)

### 1. Vòng đời Phiên đấu giá và Background Scheduler (`AuctionBackgroundService.java`)
- **Lập lịch ngầm định kỳ:** Sử dụng annotation `@Scheduled(initialDelay = 5000, fixedDelay = 2000)`:
  - *Tại sao chọn `fixedDelay = 2000` mà không chọn `fixedRate`?*
    - `fixedRate`: Cứ đúng 2s lại bắn luồng mới bất kể vòng trước chạy xong chưa. Nếu DB bị chậm, các luồng quét sẽ dồn ứ gây cạn kiệt tài nguyên.
    - `fixedDelay`: Chỉ bắt đầu đếm 2 giây **sau khi vòng quét trước đó đã hoàn tất 100%**. Đây là lựa chọn chuẩn mực kỹ thuật giúp chống quá tải hệ thống.
- **Máy trạng thái vòng đời phiên:**
  ```text
  [SOON]  (Chờ mở)  ─── Đến giờ startTime ───►  [LIVE]  (Đang diễn ra)
                                                  │
                                                  ├── Lệnh HALT từ Admin (TCP :9090) ──► [PAUSED]
                                                  ├── Lệnh RESUME từ Admin (TCP :9090) ◄──┘
                                                  │
                                          Hết giờ endTime
                                                  │
                                                  ▼
                                               [END]   (Chốt kết quả, quyết toán ví)
  ```
- **Xử lý Race Condition giữa DB Transaction và WebSocket:**
  - Trong `handleEndSession()`, Nam sử dụng `transactionTemplate.execute(...)` để commit toàn bộ thao tác chốt trạng thái `END`, xác định người thắng và xử lý hoàn cọc xong xuôi trong DB trước.
  - Sau khi Transaction commit thành công $\rightarrow$ mới gọi `messagingTemplate.convertAndSend(...)` để bắn sự kiện `END` ra WebSocket.
  - *Ý nghĩa:* Ngăn chặn triệt để lỗi Client nhận tin báo phiên kết thúc nhưng khi gọi API lấy chi tiết lại đọc phải dữ liệu cũ chưa kịp commit.

---

### 2. Nghiệp vụ Quản lý Ký quỹ (Escrow), Trừ tiền & Hoàn cọc (`WalletServiceImpl.java`)
Hệ thống sử dụng mô hình ví điện toán bảo toàn số dư (Balanced Ledger):
$$\text{available (Khả dụng)} = \text{balance (Tổng số dư)} - \text{heldAmount (Tiền tạm giữ cọc)}$$

1. **Khi nộp cọc (`registerAuction`):**
   - Tiền đặt trước: `40.000.000 VNĐ` (Quy định tại Nghị định 39/2023/NĐ-CP).
   - Kiểm tra `available >= 40.000.000 VNĐ`. Nếu đủ, tăng `heldAmount += 40.000.000`, tạo bản ghi giao dịch `WalletTxTypeEnum.HOLD`.
   - Cấp quyền phòng: Đổi role của user từ `VIEWER` thành `BIDDER`.
2. **Khi phiên kết thúc (`handleSessionEnded`):**
   - **Người trúng giá cao nhất (`winnerUserId`):**
     - Thực hiện `CAPTURE`: Khấu trừ 40.000.000 VNĐ tiền cọc khỏi `balance` và `heldAmount`. Chuyển trạng thái đăng ký thành `CAPTURED`.
     - Kích hoạt gửi email SMTP thông báo nghĩa vụ tài chính:
       $$\text{Số tiền còn phải nộp} = \text{Giá trúng thầu} - 40.000.000 \text{ VNĐ (Tiền cọc)}$$
   - **Tất cả những người không trúng thầu:**
     - Tự động thực hiện `RELEASE`: Giảm 40.000.000 VNĐ khỏi `heldAmount`, số tiền cọc quay trở lại số dư khả dụng (`available`) của người dùng 100%. Không mất bất kỳ chi phí nào. Chuyển trạng thái thành `RELEASED`.
   - **Phiên không có lượt đặt giá nào (`bids.isEmpty()`):**
     - Hệ thống tự động gán `session.setUserInfoId(null)` và giải tỏa toàn bộ tiền cọc cho tất cả người tham gia, đồng thời **không gửi mail chúc mừng nhầm**.
3. **Khi Admin hủy phiên khẩn cấp (`handleSessionCancelled`):**
   - Tự động hoàn lại 100% tiền cọc cho toàn bộ người dùng đã nộp cọc.

---

### 3. Thuật toán Chống bắn tỉa phút chót (Anti-Sniping Engine)
- **Vấn đề thực tế:** Người tham gia thường dùng phần mềm tự động hoặc canh đúng 1-2 giây cuối cùng mới bấm giá để đối phương không kịp trở tay.
- **Cách Nam xử lý trong `BidServiceImpl.java` (Dòng 128 - 139):**
  ```java
  LocalDateTime updatedEndTime = session.getEndTime();
  if (updatedEndTime != null) {
      long secondsLeft = java.time.Duration.between(now, updatedEndTime).getSeconds();
      if (secondsLeft >= 0 && secondsLeft <= 10) {
          updatedEndTime = updatedEndTime.plusSeconds(30);
          session.setEndTime(updatedEndTime);
          extended = true;
      }
  }
  ```
- **Cơ chế đồng bộ:** Nếu lượt đặt giá hợp lệ rơi vào **10 giây cuối cùng**, hệ thống tự động cộng thêm **30 giây** vào thời gian kết thúc phiên (`extended = true`) và broadcast `endTimeEpochMs` mới qua WebSocket. Mọi client đều nhận được thời gian gia hạn cùng một lúc.

---

### 4. Thuật toán Lắng nghe Sự kiện sau Commit (`BidBroadcastListener.java`)
- Nam sử dụng `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`:
  ```java
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onBidPlaced(BidPlacedEvent event) {
      messagingTemplate.convertAndSend("/topic/auction/" + event.sessionCode(), message);
  }
  ```
- *Điểm mấu chốt:* Sự kiện chỉ được bắn lên WebSocket Broker **sau khi Database đã commit xong xuôi**. Nếu quá trình lưu lịch sử đặt giá bị lỗi DB và rollback, sự kiện sẽ tự động bị hủy, đảm bảo không bao giờ phát tán "giá ảo" ra mạng.

---

## 🤝 PHẦN 4: SỰ PHỐI HỢP LIÊN GIAO THỨC VỚI CÁC THÀNH VIÊN TRONG NHÓM

Khi thầy hỏi: *"Hệ thống của em tích hợp với phần của 2 bạn còn lại như thế nào?"*, Nam trả lời như sau:

1. **Phối hợp với Nguyễn Văn An (Web Client & SMTP Mailer):**
   - **Đồng bộ đồng hồ Client - Server (NTP-like Clock Sync):** Nam cung cấp trường `serverTimeMs = System.currentTimeMillis()` trong tất cả các gói tin WebSocket (`BidMessageVO`, `RoomEventVO`). Phía Frontend của An dựa vào mốc thời gian này cùng thời gian gửi nhận gói tin để tính độ lệch đồng hồ máy trạm $\text{offset} = T_{\text{server}} - T_{\text{client}}$, giúp đồng hồ đếm ngược trên web của An luôn chính xác tuyệt đối theo giờ máy chủ của Nam kể cả khi máy trạm chỉnh sai giờ Windows.
   - **Tự động gửi Mail biên bản trúng thầu:** Khi Scheduler của Nam chốt phiên thành công, Nam gọi `auctionMailService.sendWinnerNoticeAsync(...)`. Dịch vụ này gọi sang module `SmtpMailClient` (do An phụ trách giao thức) để mở kết nối TCP cổng 587, bắt tay `STARTTLS` và gửi email cho người thắng.

2. **Phối hợp với Nguyễn Gia Bảo (Admin Console & UDP Telemetry):**
   - **Kênh điều khiển khẩn cấp TCP Socket (Port 9090):** Bảo viết giao diện Desktop Java Swing phát lệnh TCP byte stream. Phía Core của Nam có lớp `TcpControlServer.java` lắng nghe trên cổng 9090, nhận các lệnh `HALT`, `RESUME`, `KICK`, `UNKICK`, `CANCEL`, gọi vào `AdminAuctionService` của Nam để cập nhật DB và đồng thời broadcast sự kiện qua WebSocket báo cho toàn bộ Web Client đóng băng hoặc tiếp tục phiên.
   - **Kênh viễn trắc UDP (Port 9001):** Nam cung cấp lớp `UdpMetricsPublisher` thu thập chỉ số CPU, RAM thực tế của máy chủ Spring Boot và số lượng người dùng online trong DB, đóng gói thành bản tin UDP gửi định kỳ sang `UdpMetricsServerApp` của Bảo trên cổng 9001.

---

## 🎯 PHẦN 5: BỘ CÂU HỎI VẤN ĐÁP THỰC TẾ & CÂU TRẢ LỜI MẪU CHO NAM

### Câu 1: Tại sao em lại dùng giao thức STOMP chạy trên WebSocket mà không dùng WebSocket thuần?
> **Trả lời:**  
> "Thưa thầy, bản thân WebSocket (RFC 6455) chỉ cung cấp một đường ống truyền nhận dữ liệu nhị phân hoặc chuỗi văn bản thuần (Raw byte/text stream) ở tầng thấp, không có cấu trúc định tuyến cụ thể. Nếu dùng WebSocket thuần, em sẽ phải tự quy định cú pháp gói tin, tự phân tích JSON để biết tin nhắn này gửi cho ai, phòng nào.  
> Do đó, em tích hợp giao thức STOMP 1.2 chạy trên WebSocket. STOMP đóng vai trò tương tự như HTTP trên tầng TCP: nó định nghĩa sẵn các Frame chuẩn (`CONNECT`, `SUBSCRIBE`, `SEND`, `MESSAGE`), có Header và Body, và hỗ trợ cơ chế Broker phân phối tin nhắn theo các Destination (như `/topic` để phát thanh đa điểm và `/queue` để gửi riêng cá nhân). Điều này giúp mã nguồn rõ ràng, chuẩn hóa và tối ưu hiệu năng phát sóng đa điểm của sàn đấu giá."

---

### Câu 2: Giả sử cùng một lúc có 100 người bấm đặt giá tại cùng một mili-giây, hệ thống của em giải quyết bài toán tranh chấp (Concurrency) như thế nào?
> **Trả lời:**  
> "Thưa thầy, em sử dụng cơ chế **Pessimistic Locking (Khóa bi quan)** ở tầng cơ sở dữ liệu.  
> Trong repository `AuctionSessionRepository`, em định nghĩa phương thức `findBySessionCodeForUpdate` đi kèm chú thích `@Lock(LockModeType.PESSIMISTIC_WRITE)`. Khi thực thi, Spring Data JPA sẽ phát sinh câu lệnh SQL `SELECT * FROM auction_session WHERE session_code = ? FOR UPDATE`.  
> Khi 100 request gửi lên đồng thời, Thread đầu tiên tiếp cận DB sẽ giữ khóa độc quyền trên dòng của phiên đấu giá đó, 99 Thread còn lại buộc phải xếp hàng chờ ở tầng socket. Thread đầu tiên ghi nhận giá mới (ví dụ từ 100 lên 105 triệu), cập nhật người dẫn đầu và commit transaction rồi nhả khóa. Khi Thread thứ hai bước vào, giá sàn lúc này đã là 105 triệu, mức giá 105 triệu của Thread 2 không còn đáp ứng điều kiện `bidAmount >= currentPrice + step` $\rightarrow$ hệ thống ném ngoại lệ `BID_TOO_LOW` và từ chối. Nhờ vậy, hệ thống loại bỏ hoàn toàn hiện tượng Lost Update và không bao giờ bị ghi đè dữ liệu sai lệch."

---

### Câu 3: Làm thế nào em đảm bảo rằng Client không nhận được thông báo nhảy giá ảo nếu Database bị lỗi trong quá trình đặt giá?
> **Trả lời:**  
> "Thưa thầy, em giải quyết bài toán này bằng kiến trúc **Event-Driven kết hợp `@TransactionalEventListener`**.  
> Cụ thể, trong `BidServiceImpl`, sau khi xử lý nghiệp vụ, em không gọi WebSocket broadcast ngay mà phát ra một sự kiện `BidPlacedEvent` qua `ApplicationEventPublisher`.  
> Listener nhận sự kiện là `BidBroadcastListener` được em cấu hình với chú thích `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`. Điều này đảm bảo rằng chỉ khi nào toàn bộ Transaction ghi dữ liệu vào PostgreSQL hoàn tất và commit thành công 100%, tin nhắn mới được đóng gói và gửi qua WebSocket Broker. Nếu DB xảy ra lỗi (ví dụ ngắt kết nối hoặc vi phạm ràng buộc) và bị rollback, sự kiện sẽ tự động bị hủy bỏ, tuyệt đối không bao giờ phát tán thông tin đặt giá ảo ra mạng."

---

### Câu 4: Trong dịch vụ chạy ngầm `AuctionBackgroundService`, tại sao em lại dùng `fixedDelay = 2000` thay vì `fixedRate` hay biểu thức `cron`?
> **Trả lời:**  
> "Thưa thầy, `fixedRate` sẽ kích hoạt luồng quét mới theo chu kỳ cố định bất kể luồng quét trước đó đã hoàn thành hay chưa. Nếu vào thời điểm cao điểm, Database phản hồi chậm hơn 2 giây, các luồng `fixedRate` sẽ kích hoạt chồng chéo nhau, cùng lao vào quét các phiên hết hạn, dẫn đến nguy cơ xung đột khóa hoặc cạn kiệt tài nguyên hệ thống.  
> Do đó, em sử dụng `fixedDelay = 2000`. Cơ chế của `fixedDelay` là chỉ bắt đầu đếm 2000 mili-giây sau khi vòng lặp xử lý trước đó đã kết thúc hoàn toàn. Điều này đảm bảo tính tuần tự, an toàn tuyệt đối cho cơ sở dữ liệu và giúp hệ thống vận hành ổn định."

---

### Câu 5: Hệ thống của em xác thực người dùng trên kênh WebSocket như thế nào? Khách vãng lai chưa đăng nhập có xem được phiên đấu giá không?
> **Trả lời:**  
> "Thưa thầy, em triển khai bộ lọc `WebSocketAuthChannelInterceptor` chặn trước kênh tiếp nhận tin nhắn (`preSend`).  
> 1. Khi Client kết nối, nó gửi gói tin STOMP `CONNECT` kèm header `Authorization: Bearer <jwt>`.  
> 2. Nếu có token hợp lệ, Interceptor giải mã, lấy ra thông tin người dùng và gắn quyền `ROLE_USER` vào `StompHeaderAccessor`.  
> 3. Nếu Client không gửi token (khách vãng lai), hệ thống không ngắt kết nối mà gán định danh ẩn danh `ROLE_ANONYMOUS`. Khách vãng lai vẫn được phép `SUBSCRIBE` vào `/topic/auction/{code}` để theo dõi trực tiếp giá nhảy và đồng hồ đếm ngược.  
> 4. Tuy nhiên, khi gửi lệnh `SEND` để đặt giá hoặc chat, hệ thống sẽ kiểm tra quyền: nếu là tài khoản ẩn danh, hệ thống lập tức từ chối và gửi thông báo lỗi yêu cầu đăng nhập."

---

### Câu 6: Cơ chế hoàn cọc tự động hoạt động ra sao để đảm bảo không bị thất thoát tiền của người tham gia?
> **Trả lời:**  
> "Thưa thầy, hệ thống áp dụng cơ chế ví ký quỹ (Escrow).  
> - Khi người dùng bấm nộp cọc 40 triệu để vào phòng, số tiền này được chuyển từ cột khả dụng sang cột tạm giữ `heldAmount` (giao dịch `HOLD`), người dùng không thể rút hoặc tiêu số tiền này.  
> - Khi phiên kết thúc, dịch vụ `WalletServiceImpl.handleSessionEnded()` quét toàn bộ danh sách người đã đăng ký:  
>   + Với người trả giá cao nhất: Hệ thống trừ 40 triệu cọc (`CAPTURE`) và chuyển trạng thái thành công.  
>   + Với toàn bộ những người không trúng: Hệ thống tự động giải tỏa 40 triệu trong `heldAmount` về lại số dư khả dụng (`RELEASE`) 100%.  
>   + Trong trường hợp phiên hết giờ mà không có ai đặt giá, hoặc khi Admin phát lệnh hủy phiên khẩn cấp (`CANCEL`), hệ thống tự động hoàn lại 100% tiền cọc cho tất cả những người đã nộp. Mọi biến động đều lưu vết giao dịch trong bảng `WalletTransaction` để đối soát."

---

### Câu 7: Thuật toán Chống bắn tỉa (Anti-Sniping) hoạt động ở đâu và đồng bộ tới Client bằng cách nào?
> **Trả lời:**  
> "Thưa thầy, thuật toán Anti-Sniping được cài đặt trực tiếp trong `BidServiceImpl`.  
> Mỗi khi có lượt đặt giá hợp lệ, hệ thống lấy thời gian hiện tại so sánh với `endTime` của phiên. Nếu thời gian còn lại nhỏ hơn hoặc bằng 10 giây cuối cùng, hệ thống tự động cộng thêm 30 giây vào `endTime` của phiên trong Database và bật cờ `extended = true`.  
> Ngay sau đó, thông tin `endTimeEpochMs` mới được broadcast qua kênh WebSocket `/topic/auction/{code}`. Tại máy trạm của người dùng, giao diện Web sẽ nhận mốc thời gian kết thúc mới và tự động cập nhật lại đồng hồ đếm ngược mà không cần reload trang."

---

## 📝 BẢNG TỔNG HỢP CÁC FILE MÃ NGUỒN CỐT LÕI NAM PHẢI NẮM RÕ

| STT | File mã nguồn | Đường dẫn tương đối | Vai trò kỹ thuật chính |
|:---:|---------------|---------------------|------------------------|
| 1 | `WebSocketConfig.java` | `source/server/auction-core-service/.../configuration/` | Đăng ký endpoint `/ws`, cấu hình Message Broker `/topic`, `/queue`, `/app` |
| 2 | `WebSocketAuthChannelInterceptor.java` | `source/server/auction-core-service/.../configuration/security/` | Xác thực JWT trên Frame `CONNECT`, chặn gửi tin nhắn trái phép vào Broker |
| 3 | `AuctionWebSocketController.java` | `source/server/auction-core-service/.../controller/` | Tiếp nhận tin nhắn Chat, Báo danh vào phòng, Điều phối đặt giá |
| 4 | `BidServiceImpl.java` | `source/server/auction-core-service/.../service/implement/` | Nghiệp vụ đặt giá, Khóa bi quan, Anti-Sniping, Bắn sự kiện `BidPlacedEvent` |
| 5 | `AuctionBackgroundService.java` | `source/server/auction-core-service/.../service/` | Lập lịch ngầm 2s (`@Scheduled`), Quản lý vòng đời phiên, Chốt người thắng |
| 6 | `WalletServiceImpl.java` | `source/server/auction-core-service/.../service/implement/` | Quản lý ví ký quỹ, Nộp cọc (`HOLD`), Hoàn cọc (`RELEASE`), Trừ cọc (`CAPTURE`) |
| 7 | `BidBroadcastListener.java` | `source/server/auction-core-service/.../event/listener/` | Lắng nghe sự kiện sau commit (`AFTER_COMMIT`), Broadcast giá nhảy qua WebSocket |
| 8 | `AuctionSessionRepository.java` | `source/server/auction-core-service/.../repository/` | Chứa query khóa bi quan `@Lock(LockModeType.PESSIMISTIC_WRITE)` |
| 9 | `SecurityConfig.java` | `source/server/auction-core-service/.../configuration/` | Cấu hình bảo mật Spring Security 6, CORS, Stateless API và Filter Chain |
| 10 | `ClientIpHandshakeInterceptor.java` | `source/server/auction-core-service/.../configuration/` | Trích xuất IP Client (`X-Forwarded-For`) ngay tại bước bắt tay HTTP Upgrade |

---
*Tài liệu này được biên soạn bám sát 100% mã nguồn thực tế của dự án Nhóm 05. Nam hãy đọc kỹ các đoạn mã nguồn và học thuộc các câu trả lời mẫu ở Phần 5 để tự tin đạt điểm tối đa khi vấn đáp trước Thầy Đặng Ngọc Hùng!*
