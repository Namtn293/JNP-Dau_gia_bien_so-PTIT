# CẨM NANG ÔN TẬP VẤN ĐÁP GIAO THỨC MẠNG — NHÓM 05
## DÀNH RIÊNG CHO: TRẦN NHẬT NAM (MSSV: B23DCCN592 — TRƯỞNG NHÓM)
### BÁM SÁT 100% PHÂN CÔNG GIAO THỨC (`PHAN_CONG_GIAO_THUC.md`)

---

## 🎯 PHẦN 1: ĐỊNH HƯỚNG VÀ RANH GIỚI VẤN ĐÁP CỦA NAM

Nguyên tắc vàng của môn Lập trình mạng: **"Mỗi giao thức do một người phụ trách từ đầu đến cuối (cả phía gửi lẫn phía nhận), để khi vấn đáp ai cũng giải thích được trọn vẹn luồng gói tin của mình."**

Khi thầy TS. Đặng Ngọc Hùng hỏi: *"Nam phụ trách những giao thức nào trong dự án?"*, Nam trả lời rành mạch:
> *"Dạ thưa thầy, trong Nhóm 05 em phụ trách **3 giao thức mạng cốt lõi phía Server**:*
> 1. **HTTP/1.1 REST Server (Cổng 8080):** Thiết kế API Stateless, Spring Security 6 Filter Chain, xác thực người dùng qua JWT Bearer.
> 2. **WebSocket / STOMP Broker Server (Cổng 8080/ws):** Quản lý bắt tay HTTP Upgrade (`101 Switching Protocols`), xây dựng Message Broker định tuyến `/topic` và `/queue`, xác thực JWT trên socket và chống bypass controller qua Channel Interceptor.
> 3. **JDBC over TLS (Cổng 5432):** Quản lý kết nối mã hóa tới Cloud PostgreSQL (Neon), cấu hình HikariCP Connection Pool, xử lý tranh chấp đặt giá đồng thời bằng Khóa bi quan (`SELECT ... FOR UPDATE`).
> 
> *Còn giao thức **SMTP (:587)** và **STOMP Client** do bạn **Nguyễn Văn An** phụ trách; giao thức **Raw TCP Socket (:9090)** và **UDP Datagram (:9001, :9002, :8888)** do bạn **Nguyễn Gia Bảo** phụ trách ạ."*

---

## 🌐 PHẦN 2: CHI TIẾT 3 GIAO THỨC CHỈ ĐỊNH CỦA NAM

---

### GIAO THỨC 1: HTTP/1.1 REST SERVER (CỔNG 8080)

#### 1. Luồng gói tin mạng (Packet Flow)
```text
[Client]                                                [Server Spring Boot :8080]
   │                                                               │
   ├── 1. TCP 3-Way Handshake (SYN -> SYN-ACK -> ACK) ────────────►│ (Thiết lập kết nối TCP)
   ├── 2. HTTP Request (POST /api/auth/login, Headers, Body JSON) ─►│ (Gửi request)
   │                                                               ├── Nhận gói tin tại DispatcherServlet
   │                                                               ├── Chạy qua AuthenticationFilter
   │                                                               ├── Gọi Controller & Service xử lý
   │◄─ 3. HTTP Response (Status 200 OK, Body: {accessToken}) ──────┤ (Trả response)
   │                                                               │
```

#### 2. Tính chất Stateless & Cơ chế xác thực JWT
- **Bản chất Stateless:** Server không lưu trữ phiên đăng nhập (`HttpSession`) trong bộ nhớ RAM. Nếu có 1 triệu người dùng kết nối, Server không bị tốn RAM để giữ session.
- **Cơ chế:** Khi đăng nhập thành công, Server dùng thuật toán ký số **HMAC-SHA256** với khóa bí mật `secret-key` (trong `application.yaml`) tạo ra chuỗi **JSON Web Token (JWT)** gồm 3 phần:
  $$\text{JWT} = \text{Header (Base64)} \;.\; \text{Payload (Base64)} \;.\; \text{Signature}$$
- **Mã nguồn thực tế ([SecurityConfig.java](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/configuration/SecurityConfig.java)):**
  - Mọi request tiếp theo của người dùng bắt buộc gửi kèm Header:
    ```http
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
  - Lớp `AuthenticationFilter` bóc tách chuỗi Bearer token, gọi `jwtService.extractUsername(token)` và nạp đối tượng `UsernamePasswordAuthenticationToken` vào `SecurityContextHolder`.
  - Phân quyền endpoint:
    - `/api/auth/**`: `permitAll()` (Công khai để đăng ký/đăng nhập).
    - `/api/v1/admin/**`: Bắt buộc `hasRole('ADMIN')`.
    - `/api/v1/auction/get`, `/room/**`: `permitAll()` (Khách chưa đăng nhập vẫn tra cứu và xem phòng được).
    - `/api/v1/auction/register` (nộp cọc), `/api/v1/wallet/**` (nạp tiền): Bắt buộc `.authenticated()`.

---

### GIAO THỨC 2: WEBSOCKET & STOMP BROKER SERVER (CỔNG 8080/ws) — TRỌNG TÂM SỐ 1

#### 1. Quá trình bắt tay nâng cấp kết nối (HTTP 101 Switching Protocols)
- **Vấn đề:** Trình duyệt web ban đầu chỉ nói được giao thức HTTP.
- **Giải pháp:** Để thiết lập kênh WebSocket, Client gửi 1 HTTP GET Request đặc biệt lên `http://localhost:8080/ws`:
  ```http
  GET /ws HTTP/1.1
  Host: localhost:8080
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
  Sec-WebSocket-Version: 13
  ```
- **Xử lý tại Server ([ClientIpHandshakeInterceptor.java](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/configuration/ClientIpHandshakeInterceptor.java)):**
  - Interceptor chặn bước này trước khi nâng cấp, đọc header `X-Forwarded-For` hoặc gọi `request.getRemoteAddress()` để trích xuất địa chỉ IP của Client và lưu vào `attributes.put("CLIENT_IP", ip)`.
- **Server phản hồi mã trạng thái HTTP 101:**
  ```http
  HTTP/1.1 101 Switching Protocols
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
  ```
- **Kết quả:** Kết nối TCP bên dưới được giữ nguyên vẹn, hai bên bắt đầu trao đổi dữ liệu dạng nhị phân/text của giao thức WebSocket mà không cần gửi lại HTTP headers nữa.

#### 2. Tại sao phải dùng giao thức STOMP chạy trên WebSocket?
- **WebSocket thuần:** Chỉ là đường ống byte/text thô (Raw stream), không có định dạng, không biết tin này gửi cho phòng nào, ai đang lắng nghe.
- **STOMP (Simple Text Oriented Messaging Protocol 1.2):** Hoạt động như một tầng giao thức ứng dụng trên WebSocket, định nghĩa các Frame có cấu trúc chuẩn gồm Command, Header và Body:
  ```text
  SEND
  destination:/app/bid/SES-HN-30K99999
  content-type:application/json

  {"bidAmount": 105000000}^@
  ```

#### 3. Cấu hình Message Broker ([WebSocketConfig.java](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/configuration/WebSocketConfig.java))
```java
@Override
public void configureMessageBroker(MessageBrokerRegistry config) {
    // 1. Kênh Client đăng ký nhận dữ liệu (Simple Broker quản lý trong bộ nhớ)
    config.enableSimpleBroker("/topic", "/queue");

    // 2. Tiền tố cho các request Client gửi lên Controller xử lý (@MessageMapping)
    config.setApplicationDestinationPrefixes("/app");

    // 3. Tiền tố cho các thông báo gửi riêng cho 1 user cụ thể
    config.setUserDestinationPrefix("/user");
}
```

- **Sự khác nhau giữa `/topic` và `/queue`:**
  - `/topic`: Mô hình **Publish-Subscribe (Phát thanh đa điểm / 1-to-Many)**. Bất kỳ ai `SUBSCRIBE` vào `/topic/auction/SES-HN-30K99999` đều nhận được gói tin khi có người trả giá mới.
  - `/queue`: Mô hình **Point-to-Point (Điểm - Điểm / 1-to-1)**. Dùng để gửi tin nhắn riêng tới 1 người duy nhất thông qua `convertAndSendToUser()` (ví dụ: `/user/queue/notifications`).

#### 4. Bảo mật tầng Socket ([WebSocketAuthChannelInterceptor.java](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/configuration/security/WebSocketAuthChannelInterceptor.java))
Nam triển khai bộ lọc chặn trước kênh tin nhắn (`preSend`):
1. **Chống gian lận Bypass Controller:**
   - Nếu Client cố tình gửi lệnh STOMP `SEND` trực tiếp vào destination `/topic/**` hoặc `/queue/**`, Interceptor ném ngay ngoại lệ:
     ```java
     if (destination.startsWith("/topic/") || destination.startsWith("/queue/")) {
         throw new WebSocketSecurityException("FORBIDDEN_DESTINATION", "Không được phép gửi tin nhắn trực tiếp vào Broker");
     }
     ```
   - *Mục đích:* Mọi lệnh đặt giá hoặc chat bắt buộc phải đi qua `/app/**` để Controller kiểm tra tiền cọc, số dư và trạng thái phiên trước.
2. **Xác thực Frame `CONNECT`:**
   - Khi Client gửi frame `CONNECT`, đọc header `Authorization: Bearer <jwt>`.
   - Nếu có token hợp lệ $\rightarrow$ giải mã, tạo `AuctionUserPrincipal`, gán vào socket session (`accessor.setUser(auth)`).
   - Nếu không có token $\rightarrow$ gán quyền `ROLE_ANONYMOUS`. Khách vãng lai vẫn được `SUBSCRIBE` xem phòng đấu giá trực tiếp, nhưng nếu gửi lệnh `SEND` đặt giá/chat thì Controller sẽ từ chối ngay.

#### 5. Cơ chế Broadcast sau khi Database Commit ([BidBroadcastListener.java](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/event/listener/BidBroadcastListener.java))
- Sử dụng chú thích:
  ```java
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onBidPlaced(BidPlacedEvent event) {
      messagingTemplate.convertAndSend("/topic/auction/" + event.sessionCode(), message);
  }
  ```
- **Ý nghĩa kỹ thuật cực kỳ quan trọng:** Đảm bảo dữ liệu đặt giá đã được PostgreSQL ghi đĩa và commit thành công 100% thì mới phát sóng STOMP frame ra mạng. Nếu Database bị lỗi rollback, sự kiện tự hủy, tuyệt đối không bao giờ phát tán "giá ảo" ra client.

---

### GIAO THỨC 3: JDBC OVER TLS (CỔNG 5432)

#### 1. Mã hóa đường truyền cơ sở dữ liệu
- File cấu hình `application.yaml`:
  ```yaml
  url: jdbc:postgresql://ep-little-snow-a13y3z11-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
  ```
- **Ý nghĩa:** Kết nối giữa máy chủ Spring Boot và Cloud Database Neon đặt tại Singapore đi qua mạng Internet công cộng. Cấu hình `sslmode=require` buộc driver JDBC phải thực hiện bắt tay mã hóa TLS với PostgreSQL trước khi truyền dữ liệu. Kẻ xấu bắt gói tin trên đường truyền chỉ thấy dữ liệu mã hóa, không thể đọc được mật khẩu, số dư ví hay lịch sử đấu giá.

#### 2. HikariCP Connection Pool
- **Tác dụng:** Mở sẵn một nhóm kết nối socket TCP tới PostgreSQL (mặc định 10-20 connections). Khi một Thread trong Spring Boot cần truy vấn, nó mượn connection có sẵn từ pool để thực thi SQL rồi trả lại ngay.
- **Lợi ích:** Tiết kiệm thời gian bắt tay TCP (3 bước) và TLS Handshake cho mỗi câu lệnh SQL (tiết kiệm 100ms - 300ms mỗi truy vấn).

#### 3. Xử lý Tranh chấp Đặt giá đồng thời (Concurrency / Race Condition)
- **Kịch bản kiểm tra:** Tại giây cuối cùng, 100 người dùng cùng bấm nút đặt giá `105.000.000 VNĐ` tại cùng một mili-giây.
- **Cách giải quyết trong mã nguồn ([AuctionSessionRepository.java](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/repository/AuctionSessionRepository.java#L27-L29)):**
  ```java
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select a from AuctionSession a where a.sessionCode = :code")
  Optional<AuctionSession> findBySessionCodeForUpdate(@Param("code") String code);
  ```
- **Câu lệnh SQL phát sinh:**
  ```sql
  SELECT * FROM auction_session WHERE session_code = ? FOR UPDATE;
  ```
- **Cơ chế hoạt động:**
  1. Thread đầu tiên chạm tới Database sẽ giữ khóa độc quyền (**Pessimistic Exclusive Lock**) trên dòng dữ liệu của phiên đó.
  2. 99 Thread còn lại buộc phải xếp hàng chờ ở tầng socket kết nối DB.
  3. Thread 1 kiểm tra điều kiện, ghi nhận giá mới lên 105 triệu, cập nhật người dẫn đầu, commit transaction và giải phóng lock.
  4. Lúc này Thread 2 mới được vào đọc dữ liệu, nhưng giá hiện tại trong DB đã là 105 triệu $\rightarrow$ mức giá 105 triệu của Thread 2 không còn đáp ứng `bidAmount >= currentPrice + step` $\rightarrow$ ném ngoại lệ `BID_TOO_LOW` và từ chối.
  $\rightarrow$ **Kết quả:** Triệt tiêu hoàn toàn lỗi Lost Update, bảo toàn tính đúng đắn của dữ liệu.

---

## 💡 PHẦN 3: TRẢ LỜI TRỰC TIẾP 5 CÂU HỎI VẤN ĐÁP TRONG `PHAN_CONG_GIAO_THUC.md`

Dưới đây là câu trả lời chuẩn xác, gãy gọn để Nam trả lời trực tiếp khi thầy hỏi đúng 5 câu trong file phân công:

### Câu 1: HTTP stateless khác WebSocket stateful thế nào? Quá trình HTTP Upgrade (`101 Switching Protocols`) diễn ra ra sao?
> **Trả lời:**  
> "Thưa thầy:
> - **HTTP stateless:** Mỗi request là độc lập, Server không lưu trạng thái phiên của Client. Sau khi gửi Response, kết nối có thể đóng hoặc giữ Keep-Alive nhưng Server không thể tự ý đẩy dữ liệu xuống Client khi Client không hỏi. Header HTTP rất nặng (500B-1KB).
> - **WebSocket stateful:** Duy trì duy nhất một kết nối TCP Full-Duplex lâu dài giữa Client và Server. Cả hai bên đều lưu trạng thái kết nối (Socket Session). Server có thể chủ động đẩy dữ liệu xuống Client bất kỳ lúc nào với header siêu nhẹ (chỉ từ 2 đến 10 bytes).
> - **Quá trình HTTP Upgrade:**
>   1. Client gửi request HTTP GET lên cổng 8080 (`/ws`) kèm 2 header bắt buộc: `Upgrade: websocket` và `Connection: Upgrade`, cùng khóa ngẫu nhiên `Sec-WebSocket-Key`.
>   2. Bộ lọc `ClientIpHandshakeInterceptor` của em chặn lại để lấy IP thực của Client.
>   3. Server tính toán `Sec-WebSocket-Accept` và phản hồi mã **HTTP 101 Switching Protocols**. Kể từ giây phút này, kết nối TCP được chuyển hoàn toàn sang giao thức WebSocket."

---

### Câu 2: STOMP `/topic` (broadcast) khác `/queue` / `/user` (gửi riêng một người) thế nào?
> **Trả lời:**  
> "Thưa thầy:
> - **`/topic` (Publish-Subscribe):** Dùng để phát sóng đa điểm (Broadcast / 1-to-Many). Bất kỳ ai `SUBSCRIBE` vào `/topic/auction/{code}` đều nhận được gói tin khi có người đặt giá mới hoặc khi đồng hồ gia hạn.
> - **`/queue` (Point-to-Point):** Dùng để truyền tin nhắn điểm - điểm (1-to-1). Trong dự án, em kết hợp với tiền tố `/user` (`/user/queue/notifications`) qua hàm `messagingTemplate.convertAndSendToUser(username, destination, payload)`. Spring Broker sẽ tự động phân giải username thành Session ID tương ứng để chỉ đẩy thông báo riêng cho tài khoản đó (ví dụ: chuông báo bạn bị vượt giá, hoặc nạp tiền thành công)."

---

### Câu 3: JWT được kiểm tra ở đâu: lúc gọi REST (filter) và lúc gửi frame STOMP CONNECT (channel interceptor)?
> **Trả lời:**  
> "Thưa thầy, JWT được kiểm tra độc lập ở cả 2 chốt chặn:
> 1. **Khi gọi REST API:** Token được kiểm tra tại `AuthenticationFilter` (kế thừa `OncePerRequestFilter`) nằm trong Spring Security Filter Chain. Filter bóc tách header `Authorization: Bearer <jwt>`, giải mã và nạp danh tính vào `SecurityContextHolder`.
> 2. **Khi kết nối WebSocket:** Vì WebSocket sau bước bắt tay không còn gửi HTTP Request nữa, nên Spring Security Filter của REST không kiểm soát được các frame sau đó. Do đó, em cài đặt `WebSocketAuthChannelInterceptor` chặn tại kênh tiếp nhận tin nhắn (`preSend`). Khi Client gửi frame STOMP `CONNECT`, Interceptor đọc header `Authorization`, giải mã JWT và gán `AuctionUserPrincipal` vào Socket Session để quản lý định danh người dùng trên suốt phiên WebSocket."

---

### Câu 4: Hai người đặt giá cùng lúc thì xử lý tranh chấp (race condition) ra sao?
> **Trả lời:**  
> "Thưa thầy, em sử dụng cơ chế **Pessimistic Locking (Khóa bi quan)** tại tầng cơ sở dữ liệu.  
> Trong `AuctionSessionRepository`, em dùng phương thức `findBySessionCodeForUpdate` có chú thích `@Lock(LockModeType.PESSIMISTIC_WRITE)`. Khi chạy, nó phát sinh câu lệnh SQL `SELECT * FROM auction_session WHERE session_code = ? FOR UPDATE`.  
> Khóa này phong tỏa dòng dữ liệu của phiên đấu giá: Thread nào đến trước sẽ khóa dòng đó lại để cập nhật giá mới và commit transaction. Thread thứ hai phải chờ; khi vào được thì giá sàn đã bị nâng lên, dẫn đến điều kiện giá đặt không còn thỏa mãn $\rightarrow$ hệ thống ném ngoại lệ `BID_TOO_LOW` và từ chối. Nhờ vậy không bao giờ xảy ra tình trạng đè giá hay sai lệch dữ liệu."

---

### Câu 5: HikariCP connection pool có tác dụng gì? JDBC đi qua TLS như thế nào?
> **Trả lời:**  
> "Thưa thầy:
> - **Tác dụng của HikariCP:** Việc thiết lập một kết nối mới tới Database trên đám mây rất tốn kém (phải bắt tay 3 bước TCP + bắt tay TLS mất 100-300ms). HikariCP tạo sẵn một nhóm kết nối socket mở sẵn. Khi có truy vấn, Thread chỉ việc mượn kết nối có sẵn để thực thi câu lệnh SQL rồi trả lại, giúp thời gian xử lý truy vấn giảm xuống chỉ còn vài mili-giây.
> - **Cách JDBC đi qua TLS:** Trong URL kết nối, em thêm tham số `sslmode=require&channelBinding=require`. Khi driver PostgreSQL kết nối tới Cloud Neon, nó sẽ khởi tạo phiên bắt tay TLS (Transport Layer Security) trên cổng 5432, trao đổi chứng chỉ số và thiết lập kênh truyền mã hóa đối xứng AES. Mọi câu lệnh SQL và dữ liệu nhạy cảm gửi nhận giữa server và database đều được bảo vệ an toàn."

---

## 🛡️ PHẦN 4: KỊCH BẢN TỪ CHỐI THÔNG MINH KHI BỊ HỎI LẤN SANG PHẦN CỦA BẠN KHÁC

Trong buổi vấn đáp, nếu thầy hỏi Nam về SMTP, Raw TCP 9090, hoặc UDP Datagram, Nam trả lời bình tĩnh và chuyên nghiệp như sau:

1. **Nếu thầy hỏi: "Em gửi mail xác nhận trúng đấu giá qua SMTP bằng cách nào?"**
   > *"Dạ thưa thầy, theo đúng phân công trong nhóm, giao thức **SMTP thuần trên TCP Socket (Cổng 587)** do bạn **Nguyễn Văn An** phụ trách nghiên cứu và cài đặt. Phía em chịu trách nhiệm tầng nghiệp vụ: khi Background Scheduler của em chốt phiên thành công, em gọi qua interface `auctionMailService.sendWinnerNoticeAsync(...)` để kích hoạt module gửi mail của bạn An ạ."*

2. **Nếu thầy hỏi: "Kênh TCP 9090 nhận lệnh HALT/RESUME hoặc UDP 9001 nhận metrics hoạt động ra sao?"**
   > *"Dạ thưa thầy, giao thức **Raw TCP Socket (:9090)** và **UDP Datagram (:9001/:9002/:8888)** do bạn **Nguyễn Gia Bảo** phụ trách từ đầu đến cuối. Phía em chỉ cung cấp dữ liệu số liệu CPU/RAM cho bạn Bảo gửi UDP, và cung cấp service xử lý khi bạn Bảo gửi lệnh TCP khẩn cấp sang thôi ạ."*

---
*Cẩm nang này giúp Nam tập trung 100% sức mạnh vào đúng 3 giao thức của mình: **HTTP/REST Server**, **WebSocket/STOMP Broker**, và **JDBC over TLS**, tự tin bảo vệ xuất sắc trước Giảng viên!*
