# MODULE SERVER

> 📘 *Module cụm máy chủ phía Server bao gồm: Máy chủ trung tâm (Auction Core Service), Máy chủ viễn trắc (UDP Telemetry Server) và Ứng dụng điều hành quản trị Desktop (Admin Console).*

---

## 🎯 MỤC TIÊU

Cụm Server chịu trách nhiệm toàn bộ xử lý mạng và nghiệp vụ:
- **Tiếp nhận & Broadcast thời gian thực:** Quản lý hàng trăm phiên đấu giá đồng thời, điều phối WebSocket Broker phát sóng bước giá và đếm ngược từng giây đến toàn bộ client.
- **Vòng đời & Quyết toán tự động:** Background Scheduler (2 giây/lần) tự động chuyển phiên `SOON` $\rightarrow$ `LIVE` $\rightarrow$ `END`, chốt người thắng cuộc, trừ tiền ví và hoàn cọc 100% cho người không trúng thầu.
- **Kênh điều hành khẩn cấp độc lập:** Lập trình ServerSocket TCP thuần trên cổng `9090` xử lý byte stream các lệnh can thiệp tức thời (`HALT`, `RESUME`, `KICK`, `UNKICK`, `CANCEL`).
- **Viễn trắc hiệu năng hạ tầng:** Máy chủ UDP nhận gói tin đo đạc tài nguyên CPU/RAM định kỳ 1s (cổng `9001`), phản hồi gói tin Echo Ping/Pong đo độ trễ RTT (cổng `9002`), chuyển tiếp cảnh báo quá tải cho Admin (cổng `8888`).
- **Gửi biên bản trúng đấu giá qua SMTP:** Tự động kết nối SMTP Server cổng `587` (bắt tay `STARTTLS`, xác thực `AUTH LOGIN/PLAIN`) gửi email xác nhận cho người thắng cuộc.

---

## ⚙️ CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ | Chi tiết sử dụng |
|------------|-----------|------------------|
| **Ngôn ngữ** | Java 21 LTS | Chạy toàn bộ 3 module server |
| **Framework chính** | Spring Boot 3.x | Xây dựng REST API, WebSocket/STOMP Broker, JPA |
| **Giao thức Mạng** | TCP Sockets, UDP DatagramSocket, SMTP STARTTLS, WebSocket STOMP | Tự lập trình socket thuần trên các cổng mạng |
| **Giao diện Quản trị** | Java Swing, FlatLaf Theme | Ứng dụng Desktop Admin Console độc lập |
| **Cơ sở dữ liệu** | PostgreSQL 16 (Neon Cloud) | Kết nối an toàn qua TLS với HikariCP Pool |

---

## 🚀 HƯỚNG DẪN CHẠY

### 1. Khởi động UDP Telemetry Server (Ports 9001/9002/8888)
```bash
cd source/server/udp-server
mvn compile exec:java -Dexec.mainClass="com.auction.udp.UdpMetricsServerApp"
```

### 2. Khởi động Auction Core Service (HTTP 8080 / TCP 9090)
```bash
cd source/server/auction-core-service
./mvnw spring-boot:run
```
*Ghi chú: Cơ sở dữ liệu đám mây PostgreSQL (Neon) đã được tích hợp sẵn trong `application.yaml`, server sẽ tự động kết nối và nạp schema.*

### 3. Khởi động Admin Console Desktop (Java Swing)
```bash
cd source/server/admin-console
mvn compile exec:java -Dexec.mainClass="com.auction.AdminConsoleApp"
```

---

## 🔗 API & GIAO THỨC MẠNG

### A. HTTP / REST API (Cổng 8080)
| Endpoint | Method | Input | Output / Mục đích |
|----------|:------:|-------|-------------------|
| `/api/auth/login` | POST | `{userName, password}` | Trả về Access Token & Refresh Token (JWT) |
| `/api/auth/register` | POST | `{userName, email, password, fullName}` | Đăng ký tài khoản người dùng mới |
| `/api/auction/sessions` | GET | `?status=LIVE&page=0` | Lấy danh sách biển số đang mở sàn hoặc sắp mở |
| `/api/auction/sessions/{code}` | GET | Path: `sessionCode` | Lấy chi tiết thông tin và giá hiện tại của phiên |
| `/api/wallet/my-wallet` | GET | Header: `Bearer <token>` | Lấy số dư khả dụng và số tiền đang tạm giữ cọc |
| `/api/wallet/topup` | POST | `{amount: 50000000}` | Nạp thêm tiền demo vào ví đấu giá |
| `/api/auction/sessions/{id}/register` | POST | Path: `id` | Nộp tiền đặt trước (40.000.000 VNĐ) để vào phòng |

### B. Raw TCP Control Socket (Cổng 9090)
| Lệnh (Byte Stream) | Cú pháp | Mục đích điều hành |
|--------------------|---------|-------------------|
| `HALT` | `HALT <roomCode>` | Đóng băng phiên đấu giá khẩn cấp, khóa toàn bộ nút đặt giá |
| `RESUME` | `RESUME <roomCode>` | Mở lại phiên đấu giá và tự động bù thêm 30 giây gia hạn |
| `KICK` | `KICK <userId> [roomCode]` | Cưỡng chế ngắt kết nối WebSocket, đuổi tài khoản ra khỏi phòng |
| `UNKICK` | `UNKICK <userId> [roomCode]`| Gỡ chặn, cho phép tài khoản được kết nối lại phòng |
| `CANCEL` | `CANCEL <roomCode>` | Hủy phiên đấu giá và kích hoạt quy trình hoàn cọc 100% |

### C. UDP Telemetry & Ping (Cổng 9001 / 9002 / 8888)
- Cổng `9001`: Core gửi datagram chứa tải CPU/RAM định kỳ mỗi giây.
- Cổng `9002`: Admin gửi datagram `PING` và UDP Server phản hồi `PONG` để tính RTT mạng.
- Cổng `8888`: Admin Console lắng nghe datagram telemetry chuyển tiếp từ UDP Server.

### D. SMTP Mailer (Cổng 587)
- Kết nối tới `sandbox.smtp.mailtrap.io:587` (hoặc Gmail).
- Tự động kích hoạt bắt tay `STARTTLS`, xác thực tài khoản và gửi email biên bản trúng đấu giá cho người thắng cuộc.

---

## 📦 CẤU TRÚC

```text
source/server/
├── README.md                 # Tài liệu hướng dẫn module Server (file này)
├── auction-core-service/     # Máy chủ nghiệp vụ trung tâm (Spring Boot 3)
│   ├── src/main/java/com/ptit/bigdata/coreservice/
│   │   ├── configuration/    # Cấu hình Security JWT, WebSocket STOMP
│   │   ├── controller/       # REST API Controllers & WebSocket Handler
│   │   ├── entity/           # JPA Entities (Session, Plate, Bid, Wallet)
│   │   ├── mail/             # Client SMTP Socket thuần, MailTemplates, MailService
│   │   ├── network/          # Raw TCP Control Server (Port 9090) & UDP Client
│   │   ├── repository/       # Tầng truy xuất dữ liệu Spring Data JPA
│   │   └── service/          # Nghiệp vụ đấu giá, ví tiền, scheduler 2s
│   └── pom.xml
├── admin-console/            # Ứng dụng điều hành Desktop (Java Swing)
│   ├── src/main/java/com/auction/
│   │   ├── gateway/          # Cổng giao tiếp TCP 9090 và UDP 8888
│   │   ├── mail/             # Client gửi email mẫu thử nghiệm
│   │   └── ui/               # Giao diện giám sát hạ tầng & can thiệp phiên
│   └── pom.xml
└── udp-server/               # Máy chủ viễn trắc mạng hiệu năng cao
    ├── src/main/java/com/auction/udp/
    │   └── UdpMetricsServerApp.java # Lập trình DatagramSocket cổng 9001/9002/8888
    └── pom.xml
```

---

## 🧪 TEST

Dự án bao gồm bộ kiểm thử tự động toàn diện:
```bash
# Chạy toàn bộ 53 ca kiểm thử của Core Service
cd source/server/auction-core-service
mvn test

# Kết quả:
# Tests run: 53, Failures: 0, Errors: 0, Skipped: 0
# BUILD SUCCESS
```

---

## 📝 GHI CHÚ

- Cổng mặc định: HTTP REST & WebSocket: `8080`, Raw TCP Control: `9090`, UDP: `9001/9002/8888`.
- Có thể điều chỉnh tham số cấu hình trong file `application.yaml` hoặc biến môi trường.
