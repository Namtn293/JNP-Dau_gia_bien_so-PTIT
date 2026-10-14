# CẤU TRÚC DỰ ÁN (PROJECT STRUCTURE)

> Dự án: **Hệ thống Đấu giá Biển số Xe Ô tô Trực tuyến (PTIT - Lập trình Mạng)**
>
> Tài liệu này phản ánh mã nguồn hiện có trong repository. Các giao thức và dịch vụ được mô tả trong `project-overview.md` là kiến trúc mục tiêu; không đồng nghĩa chúng đã được triển khai.

---

## 🌳 Sơ đồ cây thư mục hiện tại

```text
JNP-Dau_gia_bien_so-PTIT/
├── .ai/
│   ├── tasks/
│   │   └── week-01.md                 # Kế hoạch và phân công công việc tuần 1
│   ├── project-overview.md            # Đặc tả nghiệp vụ và kiến trúc mục tiêu
│   └── project-structure.md           # Cấu trúc repository và trạng thái triển khai
├── source/
│   ├── .gitignore
│   ├── client/
│   │   └── README.md                  # Khung hướng dẫn client, chưa có mã nguồn
│   └── server/
│       ├── README.md                  # Khung hướng dẫn server, chưa cập nhật theo triển khai
│       └── admin-console/
│           ├── .gitignore
│           ├── pom.xml                # Maven; Java 21; cấu hình ứng dụng chạy được
│           └── src/main/java/com/auction/
│               ├── AdminConsoleApp.java
│               └── ui/
│                   ├── AdminConsoleUI.java
│                   ├── Theme.java
│                   └── panels/
│                       ├── LogPanel.java
│                       └── monitoring/
│                           ├── MetricCardsPanel.java
│                           ├── MonitoringPanel.java
│                           ├── QuickControlPanel.java
│                           └── RoomTablePanel.java
├── .gitignore
├── INSTRUCTION.md                     # Hướng dẫn bài tập từ giảng viên
└── README.md                          # README tổng quan hiện còn ở dạng khung
```

> Các thư mục sinh ra khi build như `target/` không liệt kê trong cây mã nguồn.

---

## 📌 Trạng thái theo module

### 1. Tài liệu `.ai/`

- **`project-overview.md`**: Đặc tả yêu cầu, nghiệp vụ và kiến trúc dự kiến, gồm HTTP/REST, WebSocket/STOMP, TCP, UDP, RMI, JDBC/MySQL và SMTP.
- **`tasks/week-01.md`**: Kế hoạch và phân công công việc tuần 1.
- **`project-structure.md`**: Tài liệu này; cập nhật theo mã nguồn đang có.

Các giao thức/dịch vụ trong đặc tả chưa có module triển khai tương ứng trong cây mã nguồn hiện tại.

### 2. Client

`source/client/` hiện chỉ có `README.md` dạng hướng dẫn mẫu. Chưa có mã nguồn ứng dụng đấu giá phía người dùng, cấu hình client hay kết nối tới server.

### 3. Server và Admin Console

- `source/server/README.md` vẫn là tài liệu mẫu, chưa phản ánh cách chạy hệ thống thực tế.
- `source/server/admin-console/` là module mã nguồn triển khai hiện có. Đây là ứng dụng desktop Java Swing, build bằng Maven, yêu cầu Java 21; điểm bắt đầu là `AdminConsoleApp`.
- `ui/AdminConsoleUI.java` tạo cửa sổ quản trị với tab giám sát và tab điều khiển phiên. Tab điều khiển phiên hiện là placeholder.
- `ui/Theme.java` tập trung màu sắc và kiểu chữ dùng chung.
- `ui/panels/monitoring/MonitoringPanel.java` ghép các phần giám sát và liên kết hàng phòng được chọn với bảng điều khiển nhanh.
- `MetricCardsPanel.java` hiển thị thẻ CPU, RAM, RTT và hoạt động hệ thống; các chỉ số hiện là dữ liệu mẫu.
- `RoomTablePanel.java` hiển thị bảng phòng đấu giá với dữ liệu mẫu.
- `QuickControlPanel.java` cung cấp giao diện HALT, RESUME, KICK, CANCEL. Các nút hiện ghi lệnh vào nhật ký; chưa gửi lệnh qua TCP hay gọi dịch vụ server.
- `LogPanel.java` hiển thị nhật ký mẫu, hỗ trợ tự cuộn, sao chép và xóa nội dung đang hiển thị.

Do đó, các nhãn trạng thái kết nối và cổng UDP `8888`/TCP `9090` trên giao diện hiện chỉ là nội dung demo, không xác nhận có kết nối mạng đang hoạt động. Chưa thấy mã nguồn backend Spring Boot, WebSocket hub, TCP/UDP server, RMI settlement, truy cập cơ sở dữ liệu hoặc SMTP.

### 4. Cấu hình và tài liệu cấp repository

- **`.gitignore`**: Quy tắc loại trừ ở cấp repository, gồm IDE và file hệ điều hành.
- **`source/.gitignore`**, **`source/server/admin-console/.gitignore`**: Quy tắc loại trừ riêng theo module.
- **`INSTRUCTION.md`**: Hướng dẫn chính thức từ giảng viên.
- **`README.md`**, **`source/client/README.md`**, **`source/server/README.md`**: Hiện vẫn chứa nội dung khung/mẫu; cần cập nhật khi các module tương ứng được triển khai.

---

## 🔭 Kiến trúc mục tiêu

Các thành phần như ứng dụng web client, backend/API, WebSocket/STOMP, TCP điều khiển, UDP giám sát, RMI quyết toán, cơ sở dữ liệu và gửi email được nêu trong `.ai/project-overview.md` là mục tiêu thiết kế/phân công. Khi mã nguồn cho các thành phần này được thêm vào, cần cập nhật lại sơ đồ cây và trạng thái module trong tài liệu này.
