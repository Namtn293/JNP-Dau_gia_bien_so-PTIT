# PHÂN CÔNG CÔNG VIỆC THEO GIAO THỨC MẠNG

Nguyên tắc: **mỗi giao thức do một người phụ trách từ đầu đến cuối** (cả phía gửi lẫn phía nhận), để khi vấn đáp ai cũng giải thích được trọn vẹn luồng gói tin của mình.

## Tổng quan

| Thành viên | Giao thức phụ trách | Cổng |
|:---|:---|:---:|
| **Nam** | HTTP/REST (server), WebSocket/STOMP Broker (server), JDBC over TLS | 8080, 8080/ws, 5432 |
| **An** | WebSocket/STOMP Client, HTTP Client, đồng bộ đồng hồ (kiểu NTP) + Exponential Backoff, **SMTP/STARTTLS** | 8080, 587 |
| **Bảo** | Raw TCP Socket (Admin ↔ Core), UDP Datagram (Core → UDP Server → Admin, Ping/Pong) | 9090, 9001, 9002, 8888 |

```
Web Client ──HTTP/REST──────────────► Core (:8080)            [Nam: server | An: client]
Web Client ◄─WebSocket/STOMP────────► Core (:8080/ws)         [Nam: broker | An: client]
Core       ◄─JDBC/TLS───────────────► PostgreSQL (:5432)      [Nam]
Core       ──UDP METRICS────────────► UDP Server (:9001)      [Bảo]
UDP Server ──UDP forward/alert──────► Admin (:8888)           [Bảo]
Admin      ◄─UDP PING/PONG──────────► UDP Server (:9002)      [Bảo]
Admin      ──Raw TCP (HALT/RESUME…)─► Core (:9090)            [Bảo]
Admin      ──SMTP + STARTTLS────────► Mail Server (:587)      [An]
```

---

## 1. Nam: HTTP/REST + WebSocket/STOMP (Server) + JDBC

**Thư mục:** `source/server/auction-core-service/`

| Mảng | File chính |
|:---|:---|
| Cấu hình broker STOMP, endpoint `/ws`, handshake | `configuration/WebSocketConfig.java`, `configuration/ClientIpHandshakeInterceptor.java` |
| Xác thực frame STOMP (CONNECT có JWT) | `configuration/security/WebSocketAuthChannelInterceptor.java`, `WebSocketStompErrorHandler.java`, `AuctionUserPrincipal.java` |
| Nhận bid/chat qua `@MessageMapping` | `controller/AuctionWebSocketController.java` |
| Broadcast realtime tới các topic/queue | `event/listener/BidBroadcastListener.java`, `OutbidAlertListener.java`, `WatchNotificationListener.java` |
| REST API + JWT stateless | `controller/*`, `core/auth/*`, `configuration/SecurityConfig.java`, `configuration/AuthenticationFilter.java`, `OpenApiConfig.java` |
| Nghiệp vụ, scheduler chốt phiên 2s, quyết toán/hoàn cọc | `service/*`, `service/AuctionBackgroundService.java`, `repository/*`, `entity/*` |

**Câu hỏi vấn đáp nên chuẩn bị**
- HTTP stateless khác WebSocket stateful thế nào? Quá trình HTTP Upgrade (`101 Switching Protocols`) diễn ra ra sao?
- STOMP `/topic` (broadcast) khác `/queue` / `/user` (gửi riêng một người) thế nào?
- JWT được kiểm tra ở đâu: lúc gọi REST (filter) và lúc gửi frame STOMP CONNECT (channel interceptor)?
- Hai người đặt giá cùng lúc thì xử lý tranh chấp (race condition) ra sao?
- HikariCP connection pool có tác dụng gì? JDBC đi qua TLS như thế nào?

> Lưu ý: bảng cũ trong `BAO_CAO_TIEN_DO.md` có ghi **gRPC/RMI (:50051)**, nhưng **trong code chưa có**. Cần làm thêm hoặc bỏ khỏi báo cáo.

---

## 2. An: WebSocket/STOMP Client + HTTP Client + thuật toán mạng + SMTP

**Thư mục:** `source/client/jnp.fe/` và `source/server/admin-console/src/main/java/com/auction/mail/`

| Mảng | File chính |
|:---|:---|
| STOMP client: CONNECT / SUBSCRIBE / SEND / HEARTBEAT, auto-reconnect | `src/shared/realtime/StompProvider.tsx`, `src/shared/realtime/UserChannels.tsx` |
| Socket theo từng màn hình | `src/apps/auction-room/hooks/useAuctionRoomSocket.ts`, `src/apps/dashboard/hooks/useAuctionSocket.ts` |
| Đồng bộ đồng hồ với server (RTT, offset) | `src/shared/utils/serverClock.ts` |
| HTTP client, interceptor, refresh token | `src/configs/axios.ts`, `src/shared/utils/refreshToken.ts`, `src/apps/*/services/api.ts` |
| **SMTP client tự viết trên TCP socket** | `admin-console/.../mail/SmtpMailClient.java`, `MailService.java`, `MailTemplates.java`, `MailConfig.java`, `MailMessage.java` |
| Giao diện Web | `src/apps/*` (dashboard, auction-room, profile, auth, admin) |

**Câu hỏi vấn đáp nên chuẩn bị**
- Công thức đồng bộ đồng hồ: `RTT = (t3 − t0) − (t2 − t1)`, `offset = ((t1 − t0) + (t2 − t3)) / 2`.
- Exponential backoff: 1s → 2s → 4s → 8s… (có trần). Tại sao cần thêm jitter (tránh tất cả client cùng kết nối lại một lúc)?
- Heartbeat phát hiện kết nối "chết im" (half-open) bằng cách nào?
- Các bước của hội thoại SMTP: `220` → `EHLO` → `STARTTLS` → bắt tay TLS → `EHLO` lại (RFC 3207) → `AUTH PLAIN/LOGIN` (Base64) → `MAIL FROM` → `RCPT TO` → `DATA` → `.` → `QUIT`.
- Vì sao phải gửi lại EHLO sau STARTTLS? Cổng 587 (STARTTLS) khác cổng 465 (SMTPS) thế nào?

---

## 3. Bảo: Raw TCP Socket + UDP Datagram

**Thư mục:** `source/server/udp-server/`, `source/server/admin-console/` (trừ `mail/`), và 2 file mạng trong Core

| Mảng | File chính |
|:---|:---|
| TCP server nhận lệnh khẩn `HALT` / `RESUME` / `KICK` / `CANCEL` | `auction-core-service/.../network/TcpControlServer.java` |
| TCP client phía Admin | `admin-console/.../net/tcp/TcpControlClient.java` |
| Core gửi gói METRICS qua UDP | `auction-core-service/.../service/UdpMetricsPublisher.java`, `MetricsSampler.java`, `configuration/MetricsConfig.java` |
| UDP Server: giao thức tự định nghĩa | `udp-server/.../protocol/` (Message, MessageParser, MessageFormatter, ProtocolException) |
| UDP Server: nhận, trả ping, chuyển tiếp, cảnh báo ngưỡng | `udp-server/.../receiver/`, `sender/`, `monitor/` |
| Admin nhận metrics, đo RTT | `admin-console/.../net/udp/` (UdpMetricsListener, PingProbe, RttMonitor, UdpAdminGateway) |
| Admin Console (Java Swing) | `admin-console/.../ui/*` |

**Việc còn dở (ưu tiên):** lệnh điều khiển từ Admin **chưa được nối với raw TCP :9090 của Core** (xem `run.txt`). Cần thay `MockAdminGateway` bằng gateway gọi `TcpControlClient` thật.

**Câu hỏi vấn đáp nên chuẩn bị**
- TCP là luồng byte, không có ranh giới message. Mình đóng khung message thế nào (theo dòng `\n` hay tiền tố độ dài)?
- UDP mất gói hoặc đến sai thứ tự thì phát hiện bằng gì (số `seq`)? Tại sao metrics bị mất vài gói vẫn chấp nhận được?
- Vì sao lệnh khẩn dùng TCP (cần tin cậy) còn telemetry dùng UDP (cần nhẹ, nhanh)?
- Ping/Pong đo RTT trên UDP thế nào? Gói không quay về (timeout) thì xử lý ra sao?
- Kích thước datagram tối đa bao nhiêu? Vì sao payload nên nhỏ hơn MTU?

---

## Quy ước chung

- **Định dạng message:** payload STOMP (`BidMessageVO`, `RoomEventVO`, `ChatMessageVO`…) do **Nam và An** cùng chốt. Định dạng lệnh TCP/UDP do **Bảo** viết thành tài liệu.
- **Cổng:** theo bảng ở mục 4.2 của `BAO_CAO_TIEN_DO.md`.
- **Git:** mỗi người làm trên nhánh `feat/<giao-thuc>` riêng (ví dụ `feat/stomp-client`, `feat/tcp-control`). Thư mục `admin-console/mail/` thuộc An, phần còn lại của `admin-console` thuộc Bảo, tránh sửa chéo.
- **Kiểm thử liên giao thức:** chạy theo `run.txt` (UDP → Core → Admin) và `KICH_BAN_TEST.md`.
