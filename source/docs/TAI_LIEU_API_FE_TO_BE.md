# DANH SÁCH TOÀN BỘ CÁC API & KÊNH GIAO TIẾP TỪ FE GỬI VỀ BE
> **Dự án:** Hệ thống Đấu giá Biển số Xe Trực tuyến (PTIT - Nhóm 5)  
> **Backend Service:** `auction-core-service` (Spring Boot 3 - Java 21)  
> **Frontend Client:** `jnp.fe` (ReactJS / Vite / TypeScript)  
> **Địa chỉ dịch vụ:** `http://localhost:8080` (HTTP REST & WebSocket STOMP)  
> **Cơ chế xác thực:** Header `Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 1. Nhóm Xác thực & Tài khoản (`/api/auth`)
📂 **Controller phụ trách:** [`AuthenticationController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/core/auth/controller/AuthenticationController.java)  
* `POST /api/auth/register` — Đăng ký tài khoản mới *(Public)*
* `POST /api/auth/login` — Đăng nhập hệ thống, nhận JWT Access Token *(Public)*
* `POST /api/auth/google` — Xác thực tài khoản Google OAuth 2.0 bằng `idToken` *(Public)*
* `POST /api/auth/google/complete-registration` — Bổ sung CCCD, SĐT, ngày sinh cho tài khoản Google mới *(Public)*
* `POST /api/auth/logout` — Đăng xuất, thu hồi JWT Token *(Cần Token)*
* `POST /api/auth/set-admin/{userName}` — Cấp quyền ADMIN cho tài khoản *(Public / Dev)*

---

## 2. Nhóm Sảnh & Phòng đấu giá (`/api/v1/auction`)
📂 **Controller phụ trách:** [`AuctionSessionController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/AuctionSessionController.java)  
* `GET /api/v1/auction/time` — Lấy timestamp chuẩn máy chủ (`serverTimeMs`) để đồng bộ đồng hồ đếm ngược *(Public)*
* `GET /api/v1/auction/get?status={LIVE|SOON|END}&page=0&size=20` — Lấy danh sách phiên đấu giá theo trạng thái *(Public)*
* `GET /api/v1/auction/room/{roomId}` — Lấy dữ liệu chi tiết toàn diện của phòng đấu giá *(Tùy chọn Token)*
* `GET /api/v1/auction/{code}/price-series` — Lấy chuỗi lịch sử giá để vẽ biểu đồ biến động giá *(Public)*
* `GET /api/v1/auction/{code}/bids?page=0&size=20` — Lấy lịch sử tất cả các lượt trả giá trong phiên *(Public)*
* `GET /api/v1/auction/{code}/chats?limit=100` — Lấy lịch sử các tin nhắn chat trong phòng *(Public)*
* `POST /api/v1/auction/{code}/chats` — Gửi tin nhắn chat vào phòng qua HTTP *(Cần Token)*
* `GET /api/v1/auction/{code}/announcements` — Lấy các thông báo chính thức từ Ban tổ chức *(Public)*

---

## 3. Nhóm Đặt cọc & Đặt giá (Deposit & Bid)
📂 **Controller phụ trách:** [`AuctionSessionController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/AuctionSessionController.java)  
* `POST /api/v1/auction/{code}/register` — Nộp tiền đặt trước (40.000.000 VNĐ) để vào phòng đấu giá *(Cần Token)*
* `DELETE /api/v1/auction/{code}/register` — Hủy đăng ký nộp cọc và nhận lại tiền (khi phiên chưa diễn ra) *(Cần Token)*
* `GET /api/v1/auction/{code}/registration` — Kiểm tra trạng thái nộp cọc và vai trò của người dùng *(Cần Token)*
* `POST /api/v1/auction/{code}/bid` — Đặt giá qua REST API (dự phòng khi không dùng WebSocket) *(Cần Token)*

---

## 4. Nhóm Tự động đặt giá (Auto-Bid)
📂 **Controller phụ trách:** [`AutoBidController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/AutoBidController.java)  
* `GET /api/v1/auction/{code}/auto-bid` — Xem mức giá trần tự động đặt giá đã cài đặt *(Cần Token)*
* `PUT /api/v1/auction/{code}/auto-bid` — Cài đặt hoặc cập nhật mức giá tối đa cho bot Auto-Bid *(Cần Token)*
* `DELETE /api/v1/auction/{code}/auto-bid` — Tắt tính năng tự động trả giá cho phiên *(Cần Token)*

---

## 5. Nhóm Ví tiền cá nhân (`/api/v1/wallet`)
📂 **Controller phụ trách:** [`WalletController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/WalletController.java)  
* `GET /api/v1/wallet` — Xem số dư ví: Tổng số dư, Tiền đang cọc, Tiền khả dụng *(Cần Token)*
* `POST /api/v1/wallet/topup` — Nạp thêm tiền vào ví giả lập *(Cần Token)*
* `GET /api/v1/wallet/transactions?page=0&size=10&type={...}` — Xem lịch sử biến động số dư ví *(Cần Token)*

---

## 6. Nhóm Theo dõi biển số (`/api/v1/watch`)
📂 **Controller phụ trách:** [`WatchController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/WatchController.java)  
* `GET /api/v1/watch` — Lấy danh sách tất cả các phiên người dùng đang theo dõi *(Cần Token)*
* `GET /api/v1/watch/{sessionCode}/status` — Kiểm tra xem phiên này đã được bấm theo dõi chưa *(Cần Token)*
* `POST /api/v1/watch/{sessionCode}` — Thêm phiên vào danh sách theo dõi *(Cần Token)*
* `DELETE /api/v1/watch/{sessionCode}` — Bỏ theo dõi phiên *(Cần Token)*

---

## 7. Nhóm Lịch sử đấu giá cá nhân (`/api/v1/me/bids`)
📂 **Controller phụ trách:** [`MyBidHistoryController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/MyBidHistoryController.java)  
* `GET /api/v1/me/bids?page=0&size=10&result={WIN|LOST|JOINING}` — Danh sách các phiên bản thân từng tham gia *(Cần Token)*
* `GET /api/v1/me/bids/{sessionCode}` — Chi tiết tất cả các lượt trả giá của riêng bản thân trong phiên đó *(Cần Token)*

---

## 8. Nhóm Chuông thông báo (`/api/v1/notifications`)
📂 **Controller phụ trách:** [`NotificationController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/NotificationController.java)  
* `GET /api/v1/notifications?page=0&size=10` — Lấy danh sách thông báo gửi cho tài khoản *(Cần Token)*
* `GET /api/v1/notifications/unread-count` — Đếm số thông báo chưa đọc (hiển thị chấm đỏ trên chuông) *(Cần Token)*
* `PUT /api/v1/notifications/{id}/read` — Đánh dấu 1 thông báo là đã đọc *(Cần Token)*
* `PUT /api/v1/notifications/read-all` — Đánh dấu toàn bộ thông báo là đã đọc *(Cần Token)*

---

## 9. Nhóm WebSocket / STOMP Thời gian thực (`ws://localhost:8080/ws`)
📂 **Controller phụ trách:** [`AuctionWebSocketController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/AuctionWebSocketController.java)  

### A. Kênh FE Gửi lên BE (SEND - `@MessageMapping`):
* `/app/room/{roomId}/join` — Báo danh vào phòng trực tuyến (tăng người online, nhận snapshot người tham gia)
* `/app/room/{roomId}/leave` — Báo danh rời khỏi phòng
* `/app/bid/{roomId}` — Gửi lệnh đặt giá thời gian thực trong phòng đấu giá
* `/app/chat/{roomId}` — Gửi tin nhắn trò chuyện vào phòng
* `/app/auction/bid` — Đặt giá nhanh từ màn hình ngoài danh sách biển số

### B. Kênh FE Lắng nghe từ BE (SUBSCRIBE):
* `/topic/auction/{roomId}` — Nhận diễn biến giá nhảy tức thì, người dẫn đầu mới, gia hạn +30 giây
* `/topic/room/{roomId}` — Nhận sự kiện phòng: Người vào/ra, `HALT` (tạm dừng), `RESUME` (tiếp tục), `KICK` (bị đuổi), `CANCEL` (hủy phiên)
* `/topic/chat/{roomId}` — Nhận tin nhắn chat mới từ các đấu giá viên khác
* `/topic/auctions` — Nhận cập nhật trạng thái chung các phiên ngoài trang chủ
* `/user/queue/errors` — Nhận thông báo lỗi riêng tư (không đủ tiền, sai bước giá, bị phạt)

---

## 10. Nhóm API Quản trị viên (`/api/v1/admin`) *(Yêu cầu `ROLE_ADMIN`)*

### A. Quản lý Phiên & Phòng đấu giá
📂 **Controller phụ trách:** [`AdminAuctionController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/AdminAuctionController.java)  
* `GET /api/v1/admin/auction/rooms` — Lấy danh sách trạng thái tất cả các phòng để giám sát
* `GET /api/v1/admin/auction/rooms/{roomId}/participants` — Xem danh sách tài khoản đang có mặt trong phòng
* `POST /api/v1/admin/auction/rooms/{roomId}/halt` — Tạm dừng phiên đấu giá khẩn cấp
* `POST /api/v1/admin/auction/rooms/{roomId}/resume` — Mở lại phiên và cộng thêm 30 giây
* `POST /api/v1/admin/auction/rooms/{roomId}/cancel` — Hủy phiên đấu giá và hoàn tiền cọc tự động
* `POST /api/v1/admin/auction/rooms/{roomId}/kick/{userId}` — Cưỡng chế ngắt kết nối một tài khoản ra khỏi phòng
* `POST /api/v1/admin/auction/sessions` — Tạo mới một phiên đấu giá biển số
* `GET /api/v1/admin/auction/available-plates` — Lấy danh sách biển số xe chưa mở phiên để tạo phiên mới

### B. Phát loa Thông báo Ban tổ chức
📂 **Controller phụ trách:** [`AdminAnnouncementController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/AdminAnnouncementController.java)  
* `POST /api/v1/admin/auction/{code}/announcements` — Đăng thông báo khẩn cấp từ BTC xuống phòng
* `DELETE /api/v1/admin/auction/{code}/announcements/{id}` — Gỡ bỏ thông báo của phòng

### C. Giám sát Gian lận Thổi giá (Shill Bidding)
📂 **Controller phụ trách:** [`AdminShillAlertController.java`](file:///d:/Important-Project/JNP-Dau_gia_bien_so-PTIT/source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/controller/AdminShillAlertController.java)  
* `GET /api/v1/admin/shill-alerts` — Danh sách cảnh báo các tài khoản nghi vấn thông đồng đẩy giá
* `GET /api/v1/admin/shill-alerts/{id}` — Xem chi tiết cảnh báo vi phạm
* `PUT /api/v1/admin/shill-alerts/{id}` — Duyệt xử lý cảnh báo
* `POST /api/v1/admin/users/{userId}/ban` — Khóa vĩnh viễn tài khoản vi phạm
