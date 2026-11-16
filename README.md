# JNP – Đấu giá biển số

## Chạy Core và Admin Console với dữ liệu thật

Admin Console đọc dữ liệu qua Auction Core; chỉ Core kết nối Neon. Không cấu hình Neon trực tiếp trong Admin Console.

1. Cấu hình datasource Neon riêng trong `source/server/auction-core-service/src/main/resources/application.yml`.
2. Cấu hình `tcp.control.secret` trong `application.yml`; Admin Console đọc khóa này từ file local khi biến môi trường `TCP_CONTROL_SECRET` chưa có.
3. Cấu hình `admin-console.core-admin-user` và `admin-console.core-admin-password` cho tài khoản ADMIN trong file local. Biến môi trường cùng tên vẫn được ưu tiên.
4. Khởi động Core, UDP Server và Admin Console bằng hướng dẫn trong `run-core.ps1`, `run-udp.ps1`, `run-admin.ps1` hoặc `run.txt`.
5. Để dùng dữ liệu thật, giữ `ADMIN_DATA_SOURCE=core` (mặc định). `ADMIN_DATA_SOURCE=mock` chỉ dùng để demo giao diện và sẽ hiện nhãn DỮ LIỆU MẪU.

Admin Console lấy danh sách phiên và người tham gia qua REST có JWT ADMIN, metrics qua UDP, và gửi lệnh điều khiển qua TCP 9090 sau bước `AUTH`. KICK chặn đặt giá trong bộ nhớ Core đến khi khởi động lại; CANCEL cập nhật phiên và xử lý hoàn cọc cho đăng ký đang ACTIVE.

SMTP chỉ cần cấu hình nếu gửi biên bản: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`, `MAIL_FROM_NAME`. Có thể đặt chúng trong môi trường tiến trình Admin Console hoặc trong `mail.properties` cục bộ; không commit mật khẩu.

Đăng nhập Google cần cấu hình `GOOGLE_CLIENT_ID` giống `VITE_GOOGLE_CLIENT_ID` của web client. Core xác minh audience và `email_verified`; token `mock:` bị tắt mặc định (`auth.google.allow-mock=false`) và chỉ bật tường minh trong test cô lập.

Kịch bản demo: đăng nhập Admin bằng tài khoản ADMIN, đăng ký một tài khoản USER vào phiên, kiểm tra số đăng ký và người tham gia, thử HALT rồi RESUME, và chỉ gửi biên bản sau khi phiên đã kết thúc và có người thắng. CANCEL thay đổi dữ liệu ví/đăng ký thật nên chỉ thử với phiên demo.

Quy trình build/kiểm thử chi tiết theo dữ liệu Neon thật: [TEST_REAL_DATA_ADMIN_CONSOLE.md](TEST_REAL_DATA_ADMIN_CONSOLE.md).
