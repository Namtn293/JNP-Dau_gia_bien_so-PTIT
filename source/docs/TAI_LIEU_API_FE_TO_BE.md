# TÀI LIỆU TOÀN DIỆN CÁC GIAO THỨC & API FRONTEND GỬI VỀ BACKEND
> **Dự án:** Hệ thống Đấu giá Biển số Xe Trực tuyến (PTIT - Nhóm 5)  
> **Backend Service:** `auction-core-service` (Spring Boot 3 - Java 21)  
> **Frontend Client:** `jnp.fe` (ReactJS / Vite / TypeScript)  
> **Cổng dịch vụ mặc định:** HTTP & WebSocket Port `:8080` (Base URL: `http://localhost:8080`)  
> **Định dạng dữ liệu:** `application/json` (REST) & STOMP Text Protocol (WebSocket)  
> **Cơ chế xác thực:** Header `Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## MỤC LỤC
1. [Chuẩn định dạng phản hồi chung (Common Response Schema)](#1-chuẩn-định-dạng-phản-hồi-chung)
2. [Nhóm 1: Xác thực & Quản lý Tài khoản (Authentication)](#2-nhóm-1-xác-thực--quản-lý-tài-khoản)
3. [Nhóm 2: Sảnh đấu giá & Chi tiết Phiên (Auction Sessions)](#3-nhóm-2-sảnh-đấu-giá--chi-tiết-phiên)
4. [Nhóm 3: Đặt giá, Đặt cọc & Phòng đấu giá (Bidding & Deposit)](#4-nhóm-3-đặt-giá-đặt-cọc--phòng-đấu-giá)
5. [Nhóm 4: Tự động Đặt giá (Auto-Bid Engine)](#5-nhóm-4-tự-động-đặt-giá-auto-bid-engine)
6. [Nhóm 5: Quản lý Ví tiền & Giao dịch (Wallet & Transactions)](#6-nhóm-5-quản-lý-ví-tiền--giao-dịch)
7. [Nhóm 6: Theo dõi Biển số Yêu thích (Watchlist)](#7-nhóm-6-theo-dõi-biển-số-yêu-thích)
8. [Nhóm 7: Lịch sử Đấu giá Cá nhân (My Bid History)](#8-nhóm-7-lịch-sử-đấu-giá-cá-nhân)
9. [Nhóm 8: Chuông Thông báo Hệ thống (Notifications)](#9-nhóm-8-chuông-thông-báo-hệ-thống)
10. [Nhóm 9: Giao thức WebSocket / STOMP Thời gian thực (Realtime Channels)](#10-nhóm-9-giao-thức-websocket--stomp-thời-gian-thực)
11. [Nhóm 10: API Dành cho Quản trị viên (Admin Management)](#11-nhóm-10-api-dành-cho-quản-trị-viên)

---

## 1. CHUẨN ĐỊNH DẠNG PHẢN HỒI CHUNG

Hầu hết các REST API của hệ thống đều được bọc trong lớp vỏ `SuccessResponse<T>`:
```json
{
  "code": 200,
  "message": null,
  "success": true,
  "data": { ... },
  "metaData": null
}
```
* **Khi thành công:** `code: 200`, `success: true`, dữ liệu nằm trong trường `data`.
* **Khi có lỗi nghiệp vụ:** `code` chứa mã lỗi HTTP (400, 401, 403, 404, 500), `success: false`, `message` chứa thông báo lỗi chi tiết.

---

## 2. NHÓM 1: XÁC THỰC & QUẢN LÝ TÀI KHOẢN
**Base Path:** `/api/auth`

### 2.1. Đăng ký tài khoản (Local Register)
* **Method:** `POST`
* **Endpoint:** `/api/auth/register`
* **Quyền hạn:** Công khai (Không cần Token)
* **Request Body:**
```json
{
  "userName": "nguyenvana",
  "password": "Password@123",
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com"
}
```
* **Response (200 OK):**
```json
{
  "code": 200,
  "message": null,
  "success": true,
  "data": null
}
```

### 2.2. Đăng nhập hệ thống (Local Login)
* **Method:** `POST`
* **Endpoint:** `/api/auth/login`
* **Quyền hạn:** Công khai
* **Request Body:**
```json
{
  "userName": "nguyenvana",
  "password": "Password@123"
}
```
*(Ghi chú: Trường `userName` có thể nhập username hoặc địa chỉ email).*
* **Response (200 OK):**
```json
{
  "code": 200,
  "message": null,
  "success": true,
  "data": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX1VTRVIiXSwidXNlcklkIjoxLCJzdWIiOiJuZ3V5ZW52YW5hIn0..."
}
```
*(Trường `data` là chuỗi JWT Access Token dùng cho các request tiếp theo).*

### 2.3. Đăng nhập bằng Google OAuth 2.0 (Google Login)
* **Method:** `POST`
* **Endpoint:** `/api/auth/google`
* **Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```
* **Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "isNewUser": false,
    "email": "nguyenvana@gmail.com",
    "fullName": "Nguyễn Văn A",
    "token": "eyJhbGciOi...",
    "tempToken": null
  }
}
```
*(Nếu `isNewUser: true`, FE chuyển sang form hoàn tất đăng ký với `tempToken`).*

### 2.4. Hoàn tất đăng ký Google (Complete Google Registration)
* **Method:** `POST`
* **Endpoint:** `/api/auth/google/complete-registration`
* **Request Body:**
```json
{
  "tempToken": "uuid-temp-token",
  "userName": "nguyenvana",
  "password": "Password@123",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0987654321",
  "dob": "2000-01-01",
  "address": "Hà Nội"
}
```
* **Response (200 OK):** Trả về chuỗi JWT Access Token trong `data`.

### 2.5. Đăng xuất (Logout)
* **Method:** `POST`
* **Endpoint:** `/api/auth/logout`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response (200 OK):** Thu hồi hiệu lực của Access Token.

---

## 3. NHÓM 2: SẢNH ĐẤU GIÁ & CHI TIẾT PHIÊN
**Base Path:** `/api/v1/auction`

### 3.1. Đồng bộ thời gian máy chủ (Server Clock Sync)
* **Method:** `GET`
* **Endpoint:** `/api/v1/auction/time`
* **Mục đích:** FE dùng timestamp trả về để tính offset chênh lệch mili-giây giữa máy tính client và máy chủ, đảm bảo đồng hồ đếm ngược tuyệt đối chính xác.
* **Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "serverTimeMs": 1795445200123
  }
}
```

### 3.2. Lấy danh sách phiên đấu giá (Get Auction Sessions)
* **Method:** `GET`
* **Endpoint:** `/api/v1/auction/get`
* **Query Parameters:**
  * `status`: Trạng thái lọc (`LIVE`, `SOON`, `END`)
  * `page`: Trang hiện tại (bắt đầu từ 0)
  * `size`: Số phần tử trên 1 trang (mặc định 20)
* **Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "sessionCode": "SES-HN-30K88888",
        "title": "Đấu giá biển số xe ô tô 30K-888.88 (Hà Nội)",
        "plateNumber": "30K-888.88",
        "provinceName": "Hà Nội",
        "plateType": "NGU_QUY",
        "vehicleType": "Ô tô con",
        "startPrice": 40000000,
        "currentPrice": 850000000,
        "stepPrice": 20000000,
        "depositAmount": 40000000,
        "startTime": "2026-11-23T19:00:00",
        "endTime": "2026-11-23T23:30:00",
        "status": "LIVE",
        "participantCount": 45,
        "bidCount": 28
      }
    ],
    "totalElements": 31,
    "totalPages": 2,
    "size": 20,
    "number": 0
  }
}
```

### 3.3. Lấy chi tiết toàn diện phòng đấu giá (Get Room Detail)
* **Method:** `GET`
* **Endpoint:** `/api/v1/auction/room/{roomId}`
* **Path Variable:** `roomId`: Mã phiên (ví dụ: `SES-HN-30K88888`) hoặc biển số xe (`30K-888.88`).
* **Headers:** `Authorization: Bearer <TOKEN>` (Tùy chọn, để nhận diện vai trò).
* **Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "sessionCode": "SES-HN-30K88888",
    "plateNumber": "30K-888.88",
    "title": "Đấu giá biển số xe ô tô 30K-888.88 (Hà Nội)",
    "provinceName": "Hà Nội",
    "plateType": "NGU_QUY",
    "vehicleType": "Ô tô con",
    "startPrice": 40000000,
    "currentPrice": 850000000,
    "stepPrice": 20000000,
    "depositAmount": 40000000,
    "status": "LIVE",
    "startTime": "2026-11-23T19:00:00",
    "endTime": "2026-11-23T23:30:00",
    "remainingSeconds": 9850,
    "participantCount": 45,
    "bidCount": 28,
    "leader": "N***er",
    "myRole": "BIDDER",
    "registered": true,
    "lots": [ ... ]
  }
}
```

---

## 4. NHÓM 3: ĐẶT GIÁ, ĐẶT CỌC & PHÒNG ĐẤU GIÁ

### 4.1. Nộp tiền đặt trước / Nộp cọc (Register Deposit)
* **Method:** `POST`
* **Endpoint:** `/api/v1/auction/{code}/register`
* **Headers:** `Authorization: Bearer <TOKEN>` (Bắt buộc)
* **Cơ chế:** Trừ 40.000.000 VNĐ từ số dư ví khả dụng, chuyển sang trạng thái đóng băng tạm giữ (HELD). Chuyển vai trò người dùng trong phòng thành `BIDDER` (Đấu giá viên).
* **Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "sessionCode": "SES-HN-30K88888",
    "registered": true,
    "myRole": "BIDDER",
    "depositAmount": 40000000,
    "registrationTime": "2026-11-23T20:00:00"
  }
}
```

### 4.2. Hủy đăng ký / Hoàn cọc (Cancel Registration)
* **Method:** `DELETE`
* **Endpoint:** `/api/v1/auction/{code}/register`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Điều kiện:** Phiên chưa diễn ra (`SOON`). Hoàn trả 100% tiền cọc về ví khả dụng.

### 4.3. Kiểm tra trạng thái nộp cọc (Get Registration Status)
* **Method:** `GET`
* **Endpoint:** `/api/v1/auction/{code}/registration`
* **Headers:** `Authorization: Bearer <TOKEN>`

### 4.4. Đặt giá qua REST API (Place Bid Fallback)
* **Method:** `POST`
* **Endpoint:** `/api/v1/auction/{code}/bid`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Request Body:**
```json
{
  "bidAmount": 870000000
}
```
* **Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "sessionCode": "SES-HN-30K88888",
    "bidAmount": 870000000,
    "bidTime": "2026-11-23T21:05:12",
    "status": "ACCEPTED",
    "message": "Đặt giá thành công!"
  }
}
```

### 4.5. Lấy lịch sử biến động giá vẽ biểu đồ (Price Series)
* **Method:** `GET`
* **Endpoint:** `/api/v1/auction/{code}/price-series`
* **Response (200 OK):** Trả về mảng các điểm `{ time: "20:15:00", price: 850000000 }` để vẽ biểu đồ đường (Line Chart).

### 4.6. Lấy lịch sử đặt giá trong phiên (Session Bid History)
* **Method:** `GET`
* **Endpoint:** `/api/v1/auction/{code}/bids`
* **Query Parameters:** `page=0&size=20`

### 4.7. Chat trong phòng đấu giá qua REST (Room Chat Fallback)
* **Method:** `GET` & `POST`
* **Endpoint:** `/api/v1/auction/{code}/chats`
  * `GET`: Lấy danh sách tin nhắn cũ (`limit=100`).
  * `POST`: Gửi tin nhắn mới `{ "content": "Biển này số đẹp quá!" }`.

### 4.8. Lấy thông báo chính thức của phòng (Room Announcements)
* **Method:** `GET`
* **Endpoint:** `/api/v1/auction/{code}/announcements`

---

## 5. NHÓM 4: TỰ ĐỘNG ĐẶT GIÁ (AUTO-BID ENGINE)
**Base Path:** `/api/v1/auction/{code}/auto-bid`

### 5.1. Thiết lập mức giá trần tự động đặt giá (Configure Auto-Bid)
* **Method:** `PUT`
* **Endpoint:** `/api/v1/auction/{code}/auto-bid`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Request Body:**
```json
{
  "maxAmount": 1500000000
}
```
* **Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "sessionCode": "SES-HN-30K88888",
    "enabled": true,
    "maxAmount": 1500000000,
    "updatedAt": "2026-11-23T21:10:00"
  }
}
```

### 5.2. Tắt tự động đặt giá (Disable Auto-Bid)
* **Method:** `DELETE`
* **Endpoint:** `/api/v1/auction/{code}/auto-bid`
* **Headers:** `Authorization: Bearer <TOKEN>`

### 5.3. Xem cấu hình tự động đặt giá hiện tại (Get Auto-Bid Config)
* **Method:** `GET`
* **Endpoint:** `/api/v1/auction/{code}/auto-bid`
* **Headers:** `Authorization: Bearer <TOKEN>`

---

## 6. NHÓM 5: QUẢN LÝ VÍ TIỀN & GIAO DỊCH (WALLET)
**Base Path:** `/api/v1/wallet`

### 6.1. Xem số dư ví (Get Wallet Balance)
* **Method:** `GET`
* **Endpoint:** `/api/v1/wallet`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response (200 OK):**
```json
{
  "code": 200,
  "success": true,
  "data": {
    "balance": 1500000000,
    "heldBalance": 40000000,
    "availableBalance": 1460000000
  }
}
```

### 6.2. Nạp tiền vào ví giả lập (Top-up Balance)
* **Method:** `POST`
* **Endpoint:** `/api/v1/wallet/topup`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Request Body:**
```json
{
  "amount": 200000000
}
```
* **Response (200 OK):** Trả về thông tin ví với số dư mới đã được cộng.

### 6.3. Lịch sử giao dịch ví (Wallet Transaction History)
* **Method:** `GET`
* **Endpoint:** `/api/v1/wallet/transactions`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Query Parameters:** `page=0&size=10&type=DEPOSIT` (Các loại: `TOPUP`, `DEPOSIT_HOLD`, `DEPOSIT_REFUND`, `WIN_PAYMENT`).

---

## 7. NHÓM 6: THEO DÕI BIỂN SỐ YÊU THÍCH (WATCHLIST)
**Base Path:** `/api/v1/watch`

### 7.1. Bật theo dõi phiên (Watch Session)
* **Method:** `POST`
* **Endpoint:** `/api/v1/watch/{sessionCode}`
* **Headers:** `Authorization: Bearer <TOKEN>`

### 7.2. Hủy theo dõi phiên (Unwatch Session)
* **Method:** `DELETE`
* **Endpoint:** `/api/v1/watch/{sessionCode}`
* **Headers:** `Authorization: Bearer <TOKEN>`

### 7.3. Kiểm tra trạng thái đã theo dõi chưa (Check Watch Status)
* **Method:** `GET`
* **Endpoint:** `/api/v1/watch/{sessionCode}/status`
* **Response (200 OK):** Trả về `true` hoặc `false`.

### 7.4. Danh sách các phiên đang theo dõi (Get Watched List)
* **Method:** `GET`
* **Endpoint:** `/api/v1/watch`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Query Parameters:** `page=0&size=20`

---

## 8. NHÓM 7: LỊCH SỬ ĐẤU GIÁ CÁ NHÂN (MY BID HISTORY)
**Base Path:** `/api/v1/me/bids`

### 8.1. Danh sách các phiên đã tham gia (My Auction Sessions)
* **Method:** `GET`
* **Endpoint:** `/api/v1/me/bids`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Query Parameters:** `page=0&size=10&result=WIN` (Các giá trị `result`: `WIN`, `LOST`, `JOINING`).

### 8.2. Chi tiết các lượt trả giá của tôi trong một phiên (My Bids in Session)
* **Method:** `GET`
* **Endpoint:** `/api/v1/me/bids/{sessionCode}`
* **Headers:** `Authorization: Bearer <TOKEN>`

---

## 9. NHÓM 8: CHUÔNG THÔNG BÁO HỆ THỐNG (NOTIFICATIONS)
**Base Path:** `/api/v1/notifications`

### 9.1. Lấy danh sách thông báo (Get Notifications)
* **Method:** `GET`
* **Endpoint:** `/api/v1/notifications`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Query Parameters:** `page=0&size=10&unreadOnly=false`

### 9.2. Đếm số lượng thông báo chưa đọc (Unread Count)
* **Method:** `GET`
* **Endpoint:** `/api/v1/notifications/unread-count`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response (200 OK):** Trả về số nguyên (ví dụ: `3`).

### 9.3. Đánh dấu một thông báo đã đọc (Mark Read)
* **Method:** `PUT`
* **Endpoint:** `/api/v1/notifications/{id}/read`
* **Headers:** `Authorization: Bearer <TOKEN>`

### 9.4. Đánh dấu tất cả thông báo đã đọc (Mark All Read)
* **Method:** `PUT`
* **Endpoint:** `/api/v1/notifications/read-all`
* **Headers:** `Authorization: Bearer <TOKEN>`

---

## 10. NHÓM 9: GIAO THỨC WEBSOCKET / STOMP THỜI GIAN THỰC
* **Endpoint kết nối WebSocket:** `ws://localhost:8080/ws` (hoặc qua SockJS `/ws`)
* **Thủ tục bắt tay (Handshake CONNECT Headers):**
```stomp
CONNECT
accept-version:1.1,1.2
heart-beat:10000,10000
Authorization:Bearer <JWT_ACCESS_TOKEN>
```

### 10.1. Các kênh FE GỬI LÊN BE (SEND - `@MessageMapping`)

| Kênh đích (Destination) | Payload dữ liệu | Mô tả & Tác dụng |
| :--- | :--- | :--- |
| `/app/room/{roomId}/join` | `{ "roomId": "SES-HN-30K88888", "event": "JOIN" }` | **Báo danh vào phòng:** Đăng ký presence trực tuyến, tăng `participant_count` và nhận danh sách người trong phòng. |
| `/app/room/{roomId}/leave` | `{ "roomId": "SES-HN-30K88888", "event": "LEAVE" }` | **Báo danh rời phòng:** Giảm số người trực tuyến khi thoát hoặc unmount component. |
| `/app/bid/{roomId}` | `{ "roomId": "SES-HN-30K88888", "bidAmount": 870000000 }` | **Đặt giá thời gian thực:** Gửi giá mới trong phòng đấu giá, kích hoạt kiểm tra tiền cọc, bước giá và broadcast kết quả. |
| `/app/chat/{roomId}` | `{ "roomId": "SES-HN-30K88888", "content": "Xin chào!" }` | **Chat trực tiếp:** Gửi tin nhắn văn bản vào phòng (chỉ `BIDDER` hoặc `ADMIN` được gửi). |
| `/app/auction/bid` | `{ "plateNumber": "30K-888.88", "bidAmount": 870000000 }` | **Đặt giá nhanh từ Dashboard:** Đặt giá trực tiếp ngoài danh sách biển số mà không cần vào phòng chi tiết. |

---

### 10.2. Các kênh FE LẮNG NGHE TỪ BE (SUBSCRIBE - `@SendTo` / Topic)

| Kênh đăng ký (Subscription Topic) | Định dạng Payload nhận được | Mô tả ý nghĩa sự kiện |
| :--- | :--- | :--- |
| `/topic/auction/{roomId}` | `BidMessageVO` `{ roomId, currentPrice, leader, status, remainingSeconds, endTimeEpochMs, serverTimeMs }` | **Cập nhật diễn biến giá:** Nhận giá nhảy mới, người dẫn đầu mới, đồng hồ gia hạn +30 giây, hoặc đổi trạng thái. |
| `/topic/room/{roomId}` | `RoomEventVO` `{ event, userId, userName, message, participantCount, participants }` | **Sự kiện phòng & Điều hành:** Nhận sự kiện `JOIN`, `LEAVE`, `HALT` (tạm dừng), `RESUME` (tiếp tục), `KICK` (bị đá), `CANCEL` (hủy phiên). |
| `/topic/chat/{roomId}` | `ChatMessageVO` `{ id, roomId, senderName, content, timestamp }` | **Dòng tin nhắn chat mới** xuất hiện trong phòng. |
| `/topic/auctions` | `BidMessageVO` | **Cập nhật tổng quát:** Dành cho Sảnh dashboard nhảy giá biển số ngoài trang chủ. |
| `/user/queue/errors` | `ErrorVO` `{ code, message }` | **Kênh lỗi riêng biệt:** Nhận thông báo lỗi khi đặt giá thất bại (ví dụ: số dư không đủ, bước giá không hợp lệ, bị kick). |

---

## 11. NHÓM 10: API DÀNH CHO QUẢN TRỊ VIÊN (ADMIN REST API)
**Base Path:** `/api/v1/admin`  
**Yêu cầu quyền hạn:** Token mang Role `ROLE_ADMIN`

* `GET /api/v1/admin/auction/rooms`: Lấy danh sách trạng thái tất cả các phòng để giám sát.
* `GET /api/v1/admin/auction/rooms/{roomId}/participants`: Xem danh sách tất cả tài khoản đang ở trong phòng.
* `POST /api/v1/admin/auction/rooms/{roomId}/halt`: Tạm dừng phiên đấu giá khẩn cấp qua HTTP.
* `POST /api/v1/admin/auction/rooms/{roomId}/resume`: Mở lại phiên và cộng thêm 30 giây.
* `POST /api/v1/admin/auction/rooms/{roomId}/cancel`: Hủy phiên đấu giá và hoàn tiền cọc tự động.
* `POST /api/v1/admin/auction/rooms/{roomId}/kick/{userId}`: Đuổi một tài khoản ra khỏi phòng đấu giá.
* `POST /api/v1/admin/auction/sessions`: Tạo mới một phiên đấu giá biển số.
* `GET /api/v1/admin/auction/available-plates`: Lấy danh sách biển số xe chưa mở phiên để tạo phiên mới.
* `POST /api/v1/admin/auction/{code}/announcements`: Đăng thông báo khẩn cấp từ BTC xuống phòng.
* `GET /api/v1/admin/shill-alerts`: Danh sách cảnh báo các tài khoản nghi vấn thông đồng đẩy giá (Shill Bidding).
* `POST /api/v1/admin/users/{userId}/ban`: Khóa vĩnh viễn tài khoản gian lận.
