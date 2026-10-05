# CẤU TRÚC DỰ ÁN (PROJECT STRUCTURE)

> Dự án: **Hệ thống Đấu giá Biển số Xe Ô tô Trực tuyến (PTIT - Lập trình Mạng)**

---

## 🌳 Sơ đồ Cây Thư Mục (Tree View)

```text
JNP-Dau_gia_bien_so-PTIT/
├── .ai/                                # Thư mục tài liệu thiết kế, kế hoạch và ngữ cảnh AI
│   ├── tasks/                          # Theo dõi tiến độ và nhiệm vụ theo tuần của nhóm
│   │   └── week-01.md                  # Kế hoạch và phân công công việc Tuần 1
│   ├── project-overview.md             # Đặc tả chi tiết kiến trúc hệ thống, giao thức mạng & nghiệp vụ
│   └── project-structure.md            # Sơ đồ và mô tả cấu trúc thư mục của dự án
├── source/                             # Thư mục chứa toàn bộ mã nguồn của hệ thống
│   ├── .gitignore                      # Cấu hình loại trừ file build/rác riêng cho thư mục source
│   ├── client/                         # Module ứng dụng phía máy khách (Client Application)
│   │   └── README.md                   # Tài liệu hướng dẫn cài đặt và khởi chạy Client
│   └── server/                         # Module ứng dụng phía máy chủ (Server Application & Network Services)
│       └── README.md                   # Tài liệu hướng dẫn cài đặt, cấu hình và khởi chạy Server
├── .gitignore                          # Cấu hình danh sách file/thư mục loại trừ khỏi Git tracking ở cấp root
├── INSTRUCTION.md                      # Hướng dẫn thực hiện bài tập lớn từ Giảng viên (Giữ nguyên)
└── README.md                           # Báo cáo tổng quan chính của dự án và hướng dẫn chạy hệ thống
```

---

## 📂 Mô Tả Chi Tiết Vai Trò Các Thư Mục & Tệp Tin Chính

### 1. Thư mục `.ai/`
Chứa các tài liệu thiết kế kiến trúc, đặc tả yêu cầu, kế hoạch tiến độ và context phục vụ phát triển phần mềm và cộng tác cùng trợ lý AI:
- **`tasks/`**: Thư mục quản lý nhiệm vụ và kế hoạch thực hiện của từng thành viên theo từng tuần:
  - **`week-01.md`**: Kế hoạch tuần 1 (An: UI Đăng ký/Đăng nhập & Danh sách sản phẩm; Bảo: UI Admin & Mẫu email SMTP; Nam: REST API & Thiết kế CSDL).
- **`project-overview.md`**: Bản đặc tả toàn diện về đề tài (Bối cảnh, nghiệp vụ đấu giá, quy chuẩn đặt cọc, 4 phân hệ cốt lõi, kiến trúc đa giao thức: HTTP REST, WebSocket/STOMP, Raw TCP Socket, UDP Datagram, Java RMI, SMTP và bảng phân công công việc).
- **`project-structure.md`**: File tài liệu mô tả chi tiết sơ đồ tổ chức cây thư mục và vai trò của từng module trong dự án.

### 2. Thư mục `source/`
Thư mục gốc chứa toàn bộ mã nguồn triển khai dự án, được phân tách thành các module độc lập theo mô hình Client - Server:

- **`.gitignore`**: File cấu hình loại trừ các thư viện phụ thuộc và tệp build cục bộ phát sinh trong `source/`.
- **`source/client/`**: Phân hệ giao diện người dùng và bảng điều khiển:
  - Phụ trách giao diện Web cho người đấu giá (đăng ký, nạp ví, nộp cọc, phòng đấu giá nhảy giá thời gian thực, live chat) và ứng dụng quản trị Admin Console.
  - Xử lý các kết nối HTTP REST API, WebSocket/STOMP client (bù trừ độ trễ NTP, cơ chế Auto-Reconnect) và giao tiếp Socket.
  - **`source/client/README.md`**: Hướng dẫn môi trường, cài đặt dependencies và các bước khởi chạy client.

- **`source/server/`**: Phân hệ xử lý máy chủ trung tâm và dịch vụ mạng phân tán:
  - **Core Backend (Spring Boot)**: Quản lý phiên đấu giá, REST API, đồng bộ Countdown, xử lý kiểm soát tương tranh & đặt giá (Concurrency / Optimistic Lock).
  - **WebSocket Hub**: Broadcast bước giá nhảy và cập nhật phòng đấu giá tức thời.
  - **TCP Control Server (Port 9090)**: Tiếp nhận lệnh điều hành khẩn cấp từ Admin Console (`HALT`, `RESUME`, `KICK`, `CANCEL`).
  - **RMI Settlement Service (Port 1099)**: Dịch vụ tài chính phân tán (khóa cọc, hoàn tiền cọc, trừ tiền người thắng cuộc).
  - **UDP Telemetry Server (Port 8888)**: Đo độ trễ mạng Ping RTT và giám sát tải phần cứng (CPU/RAM).
  - **SMTP Mailer**: Gửi email biên bản trúng đấu giá và cảnh báo tự động.
  - **`source/server/README.md`**: Hướng dẫn cài đặt, cấu hình port/cơ sở dữ liệu và khởi động server.

### 3. Các tệp tin cấu hình & tài liệu ở thư mục gốc (Root)
- **`.gitignore`**: Khai báo loại trừ các file tạm thời, file build (`target/`, `node_modules/`, `.idea/`, `.DS_Store`, v.v.) khỏi kho mã nguồn Git.
- **`INSTRUCTION.md`**: Tài liệu hướng dẫn chính thức từ giảng viên bộ môn Lập trình mạng (PTIT) về tiêu chí chấm điểm, quy định cấu trúc và quy trình báo cáo (không chỉnh sửa).
- **`README.md`**: Báo cáo tổng quan của nhóm, bao gồm thông tin thành viên, tóm tắt đề tài, hướng dẫn cài đặt/chạy hệ thống hoàn chỉnh và sơ đồ kiến trúc.
