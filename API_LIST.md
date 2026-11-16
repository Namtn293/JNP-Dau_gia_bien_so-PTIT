# Danh sách API hiện có trong dự án JNP – Đấu giá biển số

> Lập theo mã nguồn tại commit `a469e56` (15/11/2026). Danh sách này được đọc từ code (controller, `SecurityConfig`,
> `WebSocketConfig`, `TcpControlServer`, `udp-server`), chưa chạy thử từng endpoint.
> Bản "sống" luôn có sẵn khi core chạy: `http://localhost:8080/swagger-ui.html` và `/v3/api-docs`.

## 0. Tổng quan các kênh giao tiếp

| Kênh | Cổng | Ai gọi ai | Dùng cho |
|---|---|---|---|
| HTTP REST | 8080 | Client web, Admin Console → Core | Đăng nhập, dữ liệu phiên, ví, quản trị (đọc dữ liệu) |
| WebSocket / STOMP | 8080 (`/ws`) | Client web ↔ Core | Đặt giá realtime, phòng đấu giá, thông báo |
| Raw TCP | 9090 | Admin Console → Core | Lệnh điều hành khẩn cấp (HALT, RESUME, KICK, CANCEL, ANNOUNCE) |
| UDP | 9001 | Core → UDP Server | Gửi METRICS (CPU, RAM, online, bid/s) |
| UDP | 9002 | Admin Console ↔ UDP Server | PING/PONG đo RTT |
| UDP | 8888 | UDP Server → Admin Console | METRICS và ALERT |
| SMTP | 587 | Admin Console → Mail server | Gửi email biên bản |

## 1. Quy ước chung

**Xác thực:** gửi header `Authorization: Bearer <JWT>`. JWT lấy từ `POST /api/auth/login` (trường `data` của phản hồi).
Claim `sub` là username, claim `userId` là `auth_user.id`.

**Phản hồi thành công** (hầu hết endpoint) bọc trong:

```json
{ "code": 200, "message": null, "success": true, "data": { }, "metaData": null }
```

**Lỗi nghiệp vụ** (`BusinessException`) trả **HTTP 200** kèm `{ "code": ..., "message": "...", "success": false }`.
Chỉ lỗi validate (`@Valid`) trả HTTP 400. Vì vậy client phải kiểm tra `success`, không chỉ mã HTTP.

**Ngoại lệ về định dạng:** 3 endpoint `GET /api/v1/admin/auction/rooms`, `.../rooms/{roomId}/participants` và
`GET /api/v1/admin/metrics/overview` trả JSON thô (không bọc `success/data`).

**Quyền (theo `SecurityConfig`):**
- **Public:** `/api/auth/**` (trừ `set-admin`), Swagger, `/ws/**`, `/error`, và một số `GET` ở mục 3.
- **ADMIN:** `/api/v1/admin/**`, `/api/admin/**`, `POST /api/auth/set-admin/**`.
- **User (cần JWT):** mọi đường dẫn còn lại.

## 2. Xác thực – `/api/auth`

| Method | Đường dẫn | Quyền | Body / tham số | Ghi chú |
|---|---|---|---|---|
| GET | `/api/auth/google/redirect` | Public | `state` (query, tùy chọn) | Chuyển hướng sang Google OAuth |
| GET | `/api/auth/google/callback` | Public | `code`, `state`, `error` (query) | Google gọi lại sau khi đăng nhập |
| POST | `/api/auth/register` | Public | `{ fullName, email, userName, password }` | Tạo bản ghi `auth_user` và `main_user_info` |
| POST | `/api/auth/login` | Public | `{ userName, password }` | `data` là chuỗi JWT |
| POST | `/api/auth/google` | Public | `GoogleLoginDTO` | Đăng nhập bằng Google |
| POST | `/api/auth/google/complete-registration` | Public | `CompleteRegistrationDTO` | Hoàn tất đăng ký tài khoản Google |
| POST | `/api/auth/logout` | User | Header `Authorization` | Thu hồi token |
| POST | `/api/auth/set-admin/{userName}` | **ADMIN** | – | Nâng một tài khoản lên ADMIN |

## 3. Phiên đấu giá – `/api/v1/auction` (alias `/v1/auction`)

| Method | Đường dẫn | Quyền | Body / tham số | Trả về |
|---|---|---|---|---|
| GET | `/get` | Public | `page=0`, `size=20`, `status=SOON` | `Page<AuctionSessionVO>` |
| GET | `/room/{roomId}` và `/detail/{roomId}` | Public | – | `AuctionRoomDetailVO` |
| GET | `/{code}/price-series` | Public | – | `PriceSeriesVO` |
| GET | `/{code}/bids` | Public | `page`, `size` | `Page<BidHistoryItemVO>` |
| GET | `/{code}/announcements` | Public | `page`, `size` | `Page<RoomAnnouncementVO>` |
| GET | `/{code}/registration` | Public (theo rule) | – | `RegistrationDetailVO`; đọc userId từ token nên cần gửi JWT |
| POST | `/{code}/register` | User | – | `RegistrationDetailVO` (đăng ký và đặt cọc) |
| DELETE | `/{code}/register` | User | – | `RegistrationDetailVO` (hủy đăng ký) |
| POST | `/{code}/bid` | User | `{ bidAmount }` | `BidResultVO` |
| GET | `/{code}/auto-bid` | Public (theo rule) | – | `AutoBidConfigVO` |
| PUT | `/{code}/auto-bid` | User | `{ maxAmount }` | `AutoBidConfigVO` |
| DELETE | `/{code}/auto-bid` | User | – | Tắt auto-bid |

`{code}` là `session_code` (ví dụ `SES-HCM-51K88888`).

## 4. Người dùng

| Method | Đường dẫn | Quyền | Body / tham số | Trả về |
|---|---|---|---|---|
| GET | `/api/v1/wallet` | User | – | `WalletVO` |
| POST | `/api/v1/wallet/topup` | User | `{ amount }` | `WalletVO` |
| GET | `/api/v1/wallet/transactions` | User | `page`, `size`, `type` (`WalletTxTypeEnum`) | `Page<WalletTransactionVO>` |
| GET | `/api/v1/me/bids` | User | `page`, `size`, `result` (ví dụ `LEADING`, `OUTBID`) | `Page<MyAuctionHistoryVO>` |
| GET | `/api/v1/me/bids/{sessionCode}` | User | – | `List<BidHistoryItemVO>` |
| GET | `/api/v1/notifications` | User | `page`, `size`, `unreadOnly=false` | `Page<NotificationVO>` |
| GET | `/api/v1/notifications/unread-count` | User | – | `Long` |
| PUT | `/api/v1/notifications/{id}/read` | User | – | – |
| PUT | `/api/v1/notifications/read-all` | User | – | – |
| GET | `/api/v1/watch` | User | `page`, `size` | `Page<WatchVO>` |
| POST | `/api/v1/watch/{sessionCode}` | User | – | Theo dõi phiên |
| DELETE | `/api/v1/watch/{sessionCode}` | User | – | Bỏ theo dõi |

## 5. Quản trị (REST) – chỉ ADMIN

| Method | Đường dẫn | Body / tham số | Trả về |
|---|---|---|---|
| GET | `/api/v1/admin/auction/rooms` | – | `List<AdminRoomVO>` (thô) |
| GET | `/api/v1/admin/auction/rooms/{roomId}/participants` | – | `List<AdminParticipantVO>` (thô) |
| GET | `/api/v1/admin/auction/rooms/{roomId}/result` | – | Biên bản phiên END đã có người thắng (thô) |
| GET | `/api/v1/admin/metrics/overview` | – | `AdminServerMetricsVO` (thô) |
| POST | `/api/v1/admin/auction/{code}/announcements` (alias `/api/admin/...`) | `{ content, pinned, level, notifyWatchers }` | `RoomAnnouncementVO` |
| DELETE | `/api/v1/admin/auction/{code}/announcements/{id}` | – | Gỡ thông báo |
| GET | `/api/v1/admin/shill-alerts` (alias `/api/admin/...`) | `status`, `sessionCode`, `page=0`, `size=20` | `Page<ShillAlertVO>` |
| GET | `/api/v1/admin/shill-alerts/{id}` | – | `ShillAlertVO` |
| PUT | `/api/v1/admin/shill-alerts/{id}` | `{ status: CONFIRMED \| DISMISSED, note }` | `ShillAlertVO` |
| POST | `/api/v1/admin/users/{userId}/ban` | `{ reason }` (tùy chọn) | Khóa tài khoản |

Các trường chính:
- `AdminRoomVO`: `id` (session_code), `plate`, `region`, `status` (`ACTIVE`, `EXTENDING`, `PAUSED`, `WAITING`, `SCHEDULED`, `CLOSED`), `participantCount` (số đăng ký ACTIVE), `currentPrice`, `remainingLabel`, `rttMs` (0 nếu chưa đo).
- `AdminParticipantVO`: `userId` là ID thô từ `auth_user`, `fullName` nối qua username đến `main_user_info`, `connection` là `UNKNOWN` nếu core chưa theo dõi kết nối thật, `bidsInLast5s`, `lastPrice`, `rttMs` (0 nếu chưa đo), `role`.
- Biên bản trả `sessionCode`, `plate`, `status`, `finalPrice`, `depositAmount`, `winnerUserId`, `winnerName`, `winnerEmail`, `endTime`.
- `AdminServerMetricsVO`: `cpuPercent`, `cpuCores`, `ramUsedGb`, `ramTotalGb`, `onlineUsers`, `bidsPerSecond`.

## 6. WebSocket / STOMP

**Kết nối:** `/ws` (WebSocket thuần) hoặc `/ws-sockjs` (SockJS). Frame `CONNECT` gửi header `Authorization: Bearer <JWT>`;
không có token thì vào với tư cách khách.

**Tiền tố:** gửi lên `/app/...`; broker `/topic`, `/queue`; kênh riêng `/user/queue/...`.

### Client gửi lên (`SEND`)

| Destination | Quyền | Nội dung |
|---|---|---|
| `/app/auction/bid` và `/app/bid` | User | `BidMessageVO` (đặt giá theo biển số) |
| `/app/bid/{roomId}` | User | `BidMessageVO` |
| `/app/chat/{roomId}` | User | Tin nhắn chat phòng |
| `/app/room/{roomId}/join` | User | Vào phòng; trả về qua `/topic/room/{roomId}` |
| `/app/room/{roomId}/leave` | User | Rời phòng |
| `/app/auction/status` | **ADMIN** | Cập nhật trạng thái, phát tới `/topic/auctions` |

### Server phát xuống (`SUBSCRIBE`)

Khách chỉ được subscribe `/topic/auctions`; các kênh còn lại cần đăng nhập.

| Destination | Quyền | Nội dung |
|---|---|---|
| `/topic/auctions` | Public | Cập nhật danh sách phiên |
| `/topic/auction/{code}` | User | Giá và trạng thái của một phiên |
| `/topic/room/{roomId}` | User | Sự kiện phòng `RoomEventVO`: `START`, `END`, `HALT`, `RESUME`, `KICK`, `CANCEL`, `ANNOUNCEMENT`, `ANNOUNCEMENT_REMOVED`; cùng với thông điệp vào/rời phòng |
| `/topic/chat/{roomId}` | User | Chat phòng |
| `/topic/admin/alerts` | **ADMIN** | Cảnh báo thổi giá (shill) |
| `/user/queue/outbid` | User | Bị vượt giá |
| `/user/queue/notifications` | User | Thông báo cá nhân |
| `/user/queue/room-role` | User | Thay đổi vai trò trong phòng |
| `/user/queue/errors` | User | Lỗi khi đặt giá qua STOMP |

## 7. Raw TCP – cổng 9090 (Admin Console → Core)

Giao thức văn bản, mỗi lệnh một dòng. Mặc định chỉ lắng nghe `127.0.0.1` (`tcp.control.host`). **Không có xác thực.**

| Lệnh | Cú pháp | Tác dụng |
|---|---|---|
| HALT | `HALT <roomId>` | Tạm dừng phiên (xem mục 9) |
| RESUME | `RESUME <roomId>` | Tiếp tục phiên, cộng 30 giây |
| KICK | `KICK <userId> [roomId]` | Chặn ID tài khoản đặt giá tại phòng đã chọn đến khi Core khởi động lại |
| CANCEL | `CANCEL <roomId>` | Đặt phiên sang `END`, dừng auto-bid và hoàn cọc cho đăng ký `ACTIVE` |
| ANNOUNCE | `ANNOUNCE <roomId> <nội dung>` | Đăng thông báo mức INFO vào phòng |
| PING | `PING` | Kiểm tra kết nối |

Mỗi kết nối phải gửi dòng đầu `AUTH <TCP_CONTROL_SECRET>` và nhận `OK AUTHENTICATED`; sau đó mới gửi lệnh. Phản hồi là `OK <thông điệp>` hoặc `FAIL <lý do>`. `roomId` là `session_code`.

## 8. UDP

| Gói | Hướng | Định dạng |
|---|---|---|
| METRICS | Core → UDP Server (9001); UDP Server → Admin (8888) | `METRICS seq=<n> ts=<ms> cpu=<%> cores=<n> ram_used=<GB> ram_total=<GB> online=<n> bps=<n>` |
| PING | Admin → UDP Server (9002) | `PING seq=<n> ts=<ms>` |
| PONG | UDP Server → Admin | `PONG seq=<n> ts=<ms>` (giữ nguyên `seq`, `ts`) |
| ALERT | UDP Server → Admin (8888) | `ALERT seq=<n> ts=<ms> level=<...> metric=<cpu\|ram\|...> value=<x> threshold=<y>` |

## 9. Lưu ý quan trọng khi dùng cho Admin Console

1. Bảng phòng, số đăng ký ACTIVE, người tham gia và tên người thắng được lấy qua Core từ database; nếu bảng phiên trống, danh sách trả `[]`.
2. Admin Console lấy CPU/RAM/online/bid/s qua UDP từ Core. REST metrics chỉ là endpoint dự phòng.
3. `rttMs = 0` và `connection = UNKNOWN` có nghĩa là Core chưa đo các trường đó.
4. HALT/RESUME cập nhật trạng thái phiên trong database, CANCEL xử lý hoàn cọc ACTIVE, KICK chặn bid trong bộ nhớ đến khi Core khởi động lại.
5. TCP 9090 yêu cầu `AUTH` với `TCP_CONTROL_SECRET`; REST quản trị yêu cầu JWT ADMIN.
6. Lỗi nghiệp vụ trả HTTP 200 trên các endpoint bọc response (xem mục 1).
