# Plan Frontend: tính năng mới (jnp.fe)

Plan này viết dựa trên **code BE thực tế** (commit `352cf0c`), không dựa trên bản plan BE. Mọi tên API, trường dữ liệu và kênh WebSocket bên dưới đều lấy từ controller, VO và listener hiện có trong `auction-core-service`.

Phạm vi (10 chức năng):

| # | Chức năng | Mục |
|---|---|---|
| A | Bước giá động (<100tr: +5tr, 100–500tr: +10tr, >500tr: +20tr) | 2 |
| B | Phân quyền người đấu giá (đã cọc) / khách xem (chưa cọc) | 3 |
| C | Ví tiền ảo | 4 |
| D | Theo dõi phiên (⭐) + thông báo | 5 |
| E | Cảnh báo tức thì khi bị trả giá cao hơn | 6 |
| F | Đấu giá tự động (chạy ở server) | 7 |
| G | Lịch sử đấu giá | 8 |
| H | Biểu đồ giá | 9 |
| I | Cảnh báo thổi giá (trang admin) | 10 |
| J | Admin gửi thông điệp vào phòng | 11 |

Mục 0 và 1 là việc nền, bắt buộc làm trước.

---

## 0. Hiện trạng FE cần biết

| Vấn đề | Vị trí | Hướng xử lý |
|---|---|---|
| Hai STOMP client riêng (dashboard và phòng), mỗi trang tự mở kết nối | `apps/dashboard/hooks/useAuctionSocket.ts`, `apps/auction-room/hooks/useAuctionRoomSocket.ts` | Gộp thành 1 client dùng chung toàn app (mục 1.2), vì các kênh `/user/queue/*` phải nghe ở mọi trang |
| API đặt giá là mock `Promise.resolve` | `placeBidApi` (dashboard), `placeBidRestApi`, `sendChatRestApi` (phòng) | Thay bằng `POST /api/v1/auction/{code}/bid`, chỉ dùng khi socket mất kết nối |
| Dashboard tự cộng giá ở FE (`plate.price + plate.step`) và cập nhật state cục bộ | `apps/dashboard/hooks/useAction.ts` | Bỏ. Giá chỉ đổi khi nhận broadcast từ server |
| Phòng tự thêm tin chat hoặc tự cập nhật giá khi socket ngắt (`local-...`) | `apps/auction-room/hooks/useAction.ts` (~dòng 129, 164) | Bỏ. Báo "mất kết nối" và khóa nút |
| FE tự tính bước giá (`currentPrice + stepPrice * k`) | `useAction.ts` dòng 83–104, `BidModal.tsx` | Dùng `nextStep` / `nextMinBid` của BE (mục 2) |
| Auto-bid chỉ là công tắc state cục bộ; `evaluateAutoBid` không còn được gọi ở đâu | `feature/autoBid.ts`, `useData.ts` (`autoBidEnabled`, `autoBidMax`) | Thay bằng API server (mục 7); xóa `feature/autoBid.ts` |
| Thông báo `ThongBao` là của template cũ, gọi `/admin/api/thong-bao/...`; endpoint này không tồn tại ở BE | `apps/admin/components/header/thong-bao/*` | Không tái dùng service; chỉ có thể chép UI (mục 5) |
| Refresh token gọi `/admin/api/...`, BE không có endpoint này | `shared/utils/refreshToken.ts` | Hết hạn là bị đẩy về trang đăng nhập. Không thuộc phạm vi plan này, chỉ cần biết |
| App đang dùng **`react-query` v3** (`QueryClientProvider` trong `main.tsx`), dù `package.json` có cả `@tanstack/react-query` v5 | `main.tsx`, 19 file dùng v3 | **Code mới dùng `react-query` v3** cho đồng bộ; không trộn v5 |
| Thư viện biểu đồ đang dùng là **recharts** (`shared/components/area-chart`) | | Biểu đồ giá dùng recharts, không thêm thư viện |

### Quy ước dữ liệu từ BE

- **REST** trả `SuccessResponse { code, message, success, data, metaData }`. Interceptor axios trả `response.data`, nên trong service luôn lấy `res.data`.
- **Phân trang** là Spring `Page`: `{ content, totalElements, totalPages, number, size }`, **trang bắt đầu từ 0**. Bảng antd bắt đầu từ 1, nên phải trừ 1 khi gọi API.
- **Ngày giờ:**
  - `LocalDateTime` được serialize thành chuỗi ISO **không có múi giờ** (`2026-11-09T14:03:21`), parse bằng `dayjs(str)` (giờ máy).
  - Một số trường cũ (`timestamp`, `time`) vẫn là `HH:mm:ss`.
  - Biểu đồ và sắp xếp luôn dùng `bidTime` (ISO).
- **Lỗi REST:** `BusinessException` trả HTTP **400** kèm `message` tiếng Việt, và interceptor đã tự hiện `notification.error`. Muốn tự xử lý thì gửi header `skip-global-notification: true`.
- **Lỗi WebSocket** đến qua `/user/queue/errors` dạng `ErrorVO { code, message, timestamp }`. **`code` là số HTTP dạng chuỗi** ("400", "403"), không phải tên lỗi (xem mục 13).
- **API admin cũ** (`/api/v1/admin/auction/rooms`, `/participants`, `/metrics/overview`) trả **mảng hoặc object trần**, không bọc `SuccessResponse`.

---

## 1. Việc nền

### 1.1 Kiểu dữ liệu dùng chung

Tạo `src/shared/types/auction.ts` sao chép đúng VO của BE:

```ts
export type AuctionStatus = "SOON" | "LIVE" | "PAUSED" | "END";
export type RoomRole = "ADMIN" | "BIDDER" | "VIEWER";
export type BidSource = "MANUAL" | "AUTO";
export type RegistrationStatus = "ACTIVE" | "RELEASED" | "CAPTURED" | "CANCELLED";
export type WalletTxType = "INIT_BONUS" | "TOPUP" | "HOLD" | "RELEASE" | "CAPTURE";
export type AutoBidStopReason = "USER_DISABLED" | "MAX_REACHED" | "SESSION_ENDED" | "NOT_REGISTERED";
export type NotificationType =
  | "STARTING_SOON" | "STARTED" | "NEW_BID" | "OUTBID" | "ENDING_SOON"
  | "ENDED_WON" | "ENDED_LOST" | "ENDED" | "ROOM_ANNOUNCEMENT" | "AUTO_BID_STOPPED" | "SHILL_ALERT";
export type ShillSeverity = "MEDIUM" | "HIGH";
export type ShillAlertStatus = "OPEN" | "CONFIRMED" | "DISMISSED";
export type AnnouncementLevel = "INFO" | "WARNING" | "IMPORTANT";
export type HistoryResult = "LEADING" | "OUTBID" | "WON" | "LOST";

export interface SpringPage<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }

export interface BidMessage {           // /topic/auction/{code}, /topic/auctions
  roomId: string; userId: string | null; userName: string; bidAmount: number; currentPrice: number;
  timestamp: string; bidTime: string; plateNumber: string; stepPrice: number; bidCount: number;
  status?: string; nextStep: number; nextMinBid: number; source: BidSource;
  type: "BID" | "EXTEND" | "NEW_HIGHEST" | "STATUS_CHANGE" | string;
}
export interface RoomEvent { roomId: string; event: string; message: string; participantCount?: number; timestamp: string; }
export interface WsError { code: string; message: string; timestamp: string; }
export interface OutbidAlert {
  sessionCode: string; plateNumber: string; newPrice: number; yourLastBid: number; nextMinBid: number;
  nextStep: number; outbidBy: string; remainingSeconds: number; autoBidActive: boolean; bidTime: string;
}
export interface AutoBidStoppedPayload { sessionCode: string; reason: AutoBidStopReason; message: string; }
export interface RoomRoleChanged { sessionCode: string; role: RoomRole; status: RegistrationStatus; }
export interface NotificationItem { id: number; type: NotificationType; title: string; content: string; sessionCode: string | null; isRead: boolean; createdAt: string; }
export interface Wallet { balance: number; heldAmount: number; available: number; }
export interface WalletTransaction { id: number; type: WalletTxType; amount: number; balanceAfter: number; heldAfter: number; sessionCode: string | null; note: string | null; createdAt: string; }
export interface Registration { registered: boolean; depositAmount: number; status: RegistrationStatus | null; myRole: RoomRole; }
export interface AutoBidConfig { sessionCode: string; maxAmount: number; active: boolean; stoppedReason: AutoBidStopReason | null; autoBidCount: number; nextMinBid: number; currentPrice: number; createdAt: string; updatedAt: string; }
export interface BidHistoryItem { userName: string; userId: number | null; bidAmount: number; increment: number; source: BidSource; time: string; bidTime: string; isWinning: boolean; }
export interface MyAuctionHistory { sessionCode: string; plateNumber: string; provinceName: string; status: AuctionStatus; startTime: string; endTime: string; myBidCount: number; myAutoBidCount: number; myHighestBid: number; myLastBidAt: string; finalPrice: number; depositStatus: RegistrationStatus | null; result: HistoryResult; }
export interface PricePoint { time: string; price: number; bidder: string | null; source: BidSource | null; step: number | null; }
export interface StepTier { upTo: number | null; step: number; }
export interface PriceSeries { sessionCode: string; startPrice: number; startTime: string; endTime: string; points: PricePoint[]; stepTiers: StepTier[]; }
export interface WatchItem { sessionCode: string; plateNumber: string; provinceName: string; startPrice: number; currentPrice: number; status: AuctionStatus; startTime: string; endTime: string; watchedAt: string; }
export interface RoomAnnouncement { id: number; sessionCode: string; content: string; pinned: boolean; level: AnnouncementLevel; adminName: string | null; createdAt: string; }
export interface ShillAlert { id: number; sessionId: number; sessionCode: string; userAId: number; userAName: string; userBId: number; userBName: string; bidCount: number; minGapSeconds: number; avgGapSeconds: number; sameIp: boolean; severity: ShillSeverity; status: ShillAlertStatus; firstBidAt: string; lastBidAt: string; reviewedBy: number | null; reviewedAt: string | null; note: string | null; recentBids?: BidHistoryItem[]; }
```

- **Kiểm tra tên field `step-tiers`:** BE khai báo `up-to` trong YAML, còn JSON trả về là tên field Java của `AuctionProperties.StepTier`. Kiểm tra lại trên Swagger, có thể là `upTo`.
- **Sửa kiểu cũ cho khớp:** `AuctionSessionVO` (dashboard) cần thêm `sessionCode`, `isWatched`, `nextStep`, `nextMinBid`. `AuctionRoomDetail` (phòng) cần thêm `myRole`, `isRegistered`, `nextStep`, `nextMinBid`, `announcements`.

### 1.2 Một STOMP client dùng chung toàn app

**File mới:** `src/shared/realtime/`

```
StompProvider.tsx       // tạo 1 Client, đặt trong RootComponent (rootRoute.tsx)
useStomp.ts             // { status, publish(dest, body) }
useStompSubscription.ts // useStompSubscription(dest, handler, enabled)
UserChannels.tsx        // nghe các kênh /user/queue/* khi đã đăng nhập (mục 5, 6, 3)
```

**Cách làm:**

- **Token:** dùng `beforeConnect: () => { client.connectHeaders = token ? { Authorization: 'Bearer ' + token } : {} }`, để mỗi lần kết nối lại đều dùng token mới nhất.
- **Đăng nhập/đăng xuất:** sau khi `setAccessToken` / `removeAccessToken`, phát một event (ví dụ `window.dispatchEvent(new Event('auth-changed'))`). Provider nghe event này rồi `deactivate()` và `activate()` lại, vì principal được gắn lúc CONNECT.
- **Danh sách subscription:** lưu trong `Map<dest, Set<handler>>`. Khi `onConnect` (kể cả kết nối lại) thì subscribe lại toàn bộ. Nhiều component nghe cùng một kênh vẫn chỉ có 1 subscription STOMP.
- **Lỗi xác thực:** khi `onStompError` có `AUTH_REQUIRED` / `TOKEN_*`, xóa token, `deactivate()` (để không thử lại liên tục mỗi 4 giây) và điều hướng tới trang đăng nhập.
- **Chuyển đổi hook cũ:**
  - `useAuctionSocket` (dashboard) chỉ còn `useStompSubscription('/topic/auctions', ...)`.
  - `useAuctionRoomSocket` chỉ còn subscribe 3 kênh phòng, cộng gửi JOIN/LEAVE và bid/chat qua `publish`.

**Lưu ý quyền:** khách vãng lai **chỉ được** subscribe `/topic/auctions`. Subscribe kênh khác sẽ bị BE trả ERROR và đóng kết nối. Vì vậy `UserChannels` và các kênh phòng chỉ chạy khi `isLogin`.

### 1.3 Service + query

- Mỗi app có `services/api.ts` (gọi axios, trả `res.data`), `query.ts` (`useQuery`) và `mutation.ts` (`useMutation`), giống mẫu hiện có.
- **Query key dùng chung:** khai báo trong `src/shared/constants/queryKeys.ts` để invalidate chéo giữa các app.

```ts
export const QK = {
  sessions: (status: string, page: number) => ["auction-sessions", status, page],
  roomDetail: (code: string) => ["auction-room", code],
  registration: (code: string) => ["registration", code],
  autoBid: (code: string) => ["auto-bid", code],
  priceSeries: (code: string) => ["price-series", code],
  sessionBids: (code: string) => ["session-bids", code],
  announcements: (code: string) => ["announcements", code],
  wallet: ["wallet"], walletTx: (page: number, type?: string) => ["wallet-tx", page, type],
  watchList: (page: number) => ["watch-list", page],
  notifications: (page: number, unreadOnly: boolean) => ["notifications", page, unreadOnly],
  unreadCount: ["notifications-unread"],
  myBids: (page: number, result?: string) => ["my-bids", page, result],
  myBidsInSession: (code: string) => ["my-bids", code],
  shillAlerts: (params: object) => ["shill-alerts", params],
};
```

### 1.4 Luồng đặt giá mới

- **Gửi bid:** dùng WebSocket `/app/bid/{code}` với body `{ bidAmount }`. Nếu socket không kết nối thì gọi `POST /api/v1/auction/{code}/bid` với body `{ bidAmount }`.
- **Không cập nhật giá cục bộ.** Chỉ cập nhật khi nhận `BidMessage` trên `/topic/auction/{code}` (trong phòng) hoặc `/topic/auctions` (ở dashboard).
- **Bid bị từ chối:** WS trả lỗi về `/user/queue/errors`, REST trả lỗi HTTP 400. Hiện `message` của BE, mở khóa nút, và **refetch room detail** để đồng bộ lại giá.
- **Chống bấm liên tục:** khi đang gửi thì khóa nút. Mở khóa khi nhận broadcast có `userId` của mình, khi nhận lỗi, hoặc sau tối đa 3 giây.

---

## 2. Bước giá động

- **Không tự tính bước giá ở FE nữa.** Luôn dùng `nextStep` và `nextMinBid` từ:
  - `AuctionSessionVO` (dashboard),
  - `AuctionRoomDetail` (phòng),
  - mỗi `BidMessage` mới (cả hai nơi).
- **`BiddingControlBox`:**
  - Các nút nhanh "+1 / +2 / +5 bước" tính `currentPrice + k * nextStep`. Hợp lệ với BE vì BE kiểm tra `(giá − current) % step(current) == 0`.
  - Ô nhập giá tùy chỉnh: kiểm tra `>= nextMinBid` và `(giá − currentPrice) % nextStep === 0`. Sai thì báo "Giá phải theo bước X".
  - Hiện dòng nhỏ "Bước giá hiện tại: 10.000.000 ₫" và tooltip bảng bậc (<100tr: 5tr · 100–500tr: 10tr · >500tr: 20tr).
  - Khi giá vượt mốc 100tr hoặc 500tr (nhận `BidMessage` có `nextStep` khác trước), hiện `message.info("Bước giá đã tăng lên X")`.
- **`BidModal` (dashboard):** hiển thị và gửi `nextMinBid`; bỏ `selectedPlate.price + selectedPlate.step`.
- **Bảng bậc dùng ở FE** (chỉ để hiển thị tooltip): lấy từ `PriceSeries.stepTiers`, không viết cứng.

---

## 3. Phân quyền người đấu giá / khách xem

**Nguồn vai trò:**

- `AuctionRoomDetail.myRole` và `isRegistered` (khi tải phòng).
- `GET /api/v1/auction/{code}/registration` → `Registration`.
- Realtime `/user/queue/room-role` → `RoomRoleChanged`. Khi nhận thì `setQueryData` registration, invalidate `roomDetail` và `wallet`.

**Hook** `apps/auction-room/hooks/useRoomRole.ts` → `{ role, isBidder, isViewer, isAdmin, registration }`.

**Giao diện theo vai trò:**

| Thành phần | BIDDER | VIEWER | ADMIN |
|---|---|---|---|
| `BiddingControlBox` | hiện | thay bằng **`RegisterBidderCard`** | ẩn (thay bằng `AdminRoomTools`, mục 11) |
| Auto-bid panel | hiện | ẩn | ẩn |
| Ô nhập chat | hiện | khóa, placeholder "Đăng ký đấu giá để trò chuyện" | hiện |
| Badge trên `AuctionRoomHeader` | "Người đấu giá" (xanh) | "Khách xem" (xám) | "Quản trị" (đỏ) |
| Biểu đồ, lịch sử bid, thông điệp | hiện | hiện | hiện |

**`RegisterBidderCard`** (mới):

- Hiển thị: tiền cọc `depositAmount`, số dư khả dụng (`useWallet`), trạng thái phiên.
- Nút "Đăng ký đấu giá – giữ cọc X":
  - Gọi `POST /api/v1/auction/{code}/register`.
  - Thành công thì invalidate `registration`, `roomDetail`, `wallet`.
  - Thiếu tiền (`message` của `WALLET_INSUFFICIENT`) thì có nút "Nạp thêm" mở `TopupModal` (mục 4).
- Phiên `END` thì ẩn nút.
- Nút **"Hủy đăng ký"** chỉ hiện khi `isBidder && status === 'SOON'`; gọi `DELETE .../register` sau `Popconfirm`.

**Khách chưa đăng nhập vào phòng:** WS sẽ từ chối các kênh phòng. Hiện trang phòng ở chế độ chỉ đọc dữ liệu REST (detail, biểu đồ, bid), kèm banner "Đăng nhập để theo dõi realtime", và không subscribe kênh phòng.

**Dashboard:** card phiên mà người dùng chưa đăng ký thì nút "Đặt giá" đổi thành "Đăng ký đấu giá". Bấm vào thì vào phòng để đăng ký, vì `AuctionSessionVO` chưa có `isRegistered` (xem mục 13).

---

## 4. Ví tiền ảo

**Route mới** `/vi-cua-toi` → `apps/wallet/`:

```
apps/wallet/route.ts, index.tsx
apps/wallet/components/WalletSummary.tsx       // 3 thẻ: Tổng số dư · Đang giữ cọc · Khả dụng
apps/wallet/components/TopupModal.tsx          // số tiền + nút nhanh 50tr/100tr/200tr/500tr, tối đa 500tr
apps/wallet/components/TransactionTable.tsx    // phân trang server, lọc theo type
apps/wallet/services/{api,query,mutation}.ts
```

| API | Dùng ở |
|---|---|
| `GET /api/v1/wallet` | `useWallet()`: trang ví, `WalletBadge`, `RegisterBidderCard` |
| `POST /api/v1/wallet/topup` `{amount}` | `TopupModal`. Thành công thì `setQueryData(QK.wallet, res)` và invalidate `walletTx` |
| `GET /api/v1/wallet/transactions?page&size&type` | `TransactionTable` |

- **Nhãn giao dịch:**

  | type | Nhãn | Màu | Dấu |
  |---|---|---|---|
  | INIT_BONUS | Tặng ban đầu | xanh lá | + |
  | TOPUP | Nạp tiền | xanh lá | + |
  | HOLD | Giữ cọc | cam | 🔒 |
  | RELEASE | Hoàn cọc | xanh dương | 🔓 |
  | CAPTURE | Trừ cọc (trúng đấu giá) | đỏ | − |

  Cột `sessionCode` là link tới `/phong-dau-gia/{code}`.

- **`WalletBadge`** trên `TopNavbar` (chỉ khi đã đăng nhập): "💰 {available}". Bấm vào thì tới `/vi-cua-toi`.
- **Khi nào invalidate `wallet`:** sau đăng ký/hủy, khi nhận `/user/queue/room-role`, và khi nhận thông báo `ENDED_WON` / `ENDED_LOST` (cọc vừa bị trừ hoặc được hoàn).
- Ghi rõ trên giao diện: "Tiền ảo dùng để demo, không có giá trị thật".

---

## 5. Theo dõi phiên (⭐) + thông báo

### Nút ⭐

**`src/shared/components/watch-star/WatchStar.tsx`**: props `sessionCode`, `isWatched`, `size`.

- **Chưa đăng nhập:** điều hướng tới `ADMIN_LOGIN_ROUTE`.
- **Đã đăng nhập:** gọi `POST` hoặc `DELETE /api/v1/watch/{sessionCode}`, cập nhật lạc quan:
  - `onMutate` lật `isWatched` trong cache `auction-sessions` và `roomDetail`.
  - Lỗi thì hoàn lại.
  - `onSettled` invalidate `watchList`.
- **Gắn vào:** `AuctionCardItem`, `AuctionTableItem`, `AuctionBoardItem`, `AuctionRoomHeader`.
- **Dữ liệu cần có:** `sessionCode` từ `AuctionSessionVO`. Hiện dashboard định danh theo biển số (`plate.p`), nên phải thêm `sessionCode` vào kiểu dữ liệu đã chuyển đổi trong `useData.ts`.

### Tab "Đang theo dõi" trên dashboard

- `GET /api/v1/watch?page&size` trả `WatchItem`. Các trường khác `AuctionSessionVO` nên cần một hàm chuyển đổi riêng sang kiểu card.
- Card hiển thị giống tab khác; ⭐ luôn sáng. Bỏ theo dõi thì card biến mất khỏi danh sách.

### Chuông thông báo

**`src/shared/components/notification-bell/`**: `NotificationBell.tsx`, `NotificationDropdown.tsx`, `NotificationRow.tsx`. Có thể chép giao diện từ `apps/admin/.../thong-bao`, nhưng dùng service mới.

| API | Dùng |
|---|---|
| `GET /api/v1/notifications/unread-count` | badge |
| `GET /api/v1/notifications?page&size&unreadOnly` | dropdown (10 tin) + trang `/thong-bao` (tùy chọn) |
| `PUT /api/v1/notifications/{id}/read` | bấm một tin |
| `PUT /api/v1/notifications/read-all` | nút "Đánh dấu tất cả đã đọc" |

- **Bấm một tin:** đánh dấu đã đọc rồi điều hướng `/phong-dau-gia/{sessionCode}` (nếu có).
- **Icon và màu theo `type`:**

  | type | Hiển thị |
  |---|---|
  | STARTING_SOON | ⏰ |
  | STARTED | ▶️ |
  | NEW_BID | 📈 |
  | OUTBID | ⚠️ đỏ |
  | ENDING_SOON | ⌛ cam |
  | ENDED_WON | 🏆 |
  | ENDED_LOST | ❌ |
  | ENDED | ⏹ |
  | ROOM_ANNOUNCEMENT | 📢 |
  | AUTO_BID_STOPPED | 🤖 |
  | SHILL_ALERT | 🚨 (chỉ admin) |

- **Realtime** (`UserChannels`), kênh `/user/queue/notifications`:
  - **Phân biệt payload:** `AutoBidScheduler` còn gửi thêm một Map `{sessionCode, reason, message}` vào cùng kênh. Chỉ xử lý payload có `id` và `type` (`NotificationVO`); bỏ qua payload có `reason` (xem mục 13).
  - Với `NotificationVO`:
    - Tăng `unreadCount` bằng `setQueryData`.
    - Thêm tin vào đầu cache trang 1.
    - `notification.open` nhỏ ở góc. Bỏ qua bước này với `OUTBID`, vì mục 6 đã hiện cảnh báo riêng.

---

## 6. Cảnh báo tức thì khi bị trả giá cao hơn

**`src/shared/realtime/OutbidAlertHost.tsx`**: đặt trong `UserChannels`, hoạt động ở **mọi trang**. Kênh `/user/queue/outbid` nhận 2 loại payload:

| Nhận diện | Loại | Xử lý |
|---|---|---|
| có `newPrice` | `OutbidAlert` | xem dưới |
| có `reason` | `AutoBidStoppedPayload` | toast "🤖 Đấu giá tự động đã dừng: {message}", invalidate `autoBid(sessionCode)` |

**Xử lý `OutbidAlert`:**

- **Âm thanh:** phát âm báo bằng `apps/auction-room/feature/audio.ts`. Chuyển file này sang `shared/` để dùng chung; tôn trọng nút tắt âm thanh, nên lưu cài đặt âm thanh vào localStorage để dùng chung giữa các trang.
- **Thông báo nổi:** `notification.warning` nổi bật, `key = 'outbid-' + sessionCode` để mỗi phiên chỉ có 1 cái (cái mới thay cái cũ). Thời gian hiển thị = `min(remainingSeconds, 15)` giây. Nội dung:
  > **Bạn đã bị vượt giá – {plateNumber}**
  > {outbidBy} vừa trả **{newPrice}** (giá của bạn: {yourLastBid}). Giá tối thiểu tiếp theo: **{nextMinBid}** · còn {mm:ss}
- **Nút trong thông báo:**
  - `autoBidActive = false`:
    - Đang ở đúng phòng: nút **"Trả {nextMinBid}"** mở `BidConfirmModal` với giá điền sẵn. **Không đặt giá bằng một lần bấm**, để tránh bấm nhầm.
    - Ở trang khác: nút "Vào phòng" điều hướng `/phong-dau-gia/{sessionCode}`.
  - `autoBidActive = true`: không có nút trả giá; hiện "🤖 Đấu giá tự động sẽ trả giá trong khoảng 5 giây".
- **Trong phòng:** banner trạng thái dẫn giá trên `MainStagePanel` (đã có logic "leading"/"outbid" trong `useData.ts` dòng ~154) chuyển sang đỏ và nhấp nháy 2 giây.
  - **Sửa logic xác định "của tôi":** hiện code so sánh tên (`leader === selfName || leader === "Bạn"`). Đổi sang so sánh `userId` (`BidMessage.userId === String(currentUser.id)`), vì BE đã gửi `userId`. Cách này cũng sửa luôn `isMine` cho lịch sử bid và chat (`ChatMessageVO.senderId`).

---

## 7. Đấu giá tự động (chạy ở server)

**Xóa** `apps/auction-room/feature/autoBid.ts` cùng các state `autoBidEnabled`, `autoBidMax`, `onToggleAutoBid`, `onChangeAutoBidMax` trong `useData.ts` và `useAction.ts`.

**Component mới** `apps/auction-room/components/AutoBidPanel.tsx`, chỉ hiện khi `isBidder`:

| API | Dùng |
|---|---|
| `GET /api/v1/auction/{code}/auto-bid` | trạng thái hiện tại (404 / `AUTOBID_NOT_FOUND` nghĩa là chưa cấu hình) |
| `PUT /api/v1/auction/{code}/auto-bid` `{maxAmount}` | bật hoặc cập nhật giá trần |
| `DELETE /api/v1/auction/{code}/auto-bid` | tắt |

**Giao diện:**

- **Ô giá trần** (`InputNumber` định dạng tiền):
  - Kiểm tra `>= nextMinBid` (BE: `AUTOBID_MAX_TOO_LOW`).
  - Gợi ý nhanh: +5, +10, +20 bước.
- **Công tắc Bật/Tắt.**
- **Khi đang bật:** "🤖 Đang tự động trả giá tới **{maxAmount}** · đã trả {autoBidCount} lượt". Ghi chú: "Hệ thống sẽ tự trả giá tối thiểu khoảng 5–6,5 giây sau khi bạn bị vượt giá."
- **Khi đã dừng:** hiện lý do theo `stoppedReason`:
  - `MAX_REACHED`: "Đã chạm giá trần"
  - `SESSION_ENDED`: "Phiên đã kết thúc"
  - `NOT_REGISTERED`: "Bạn không còn là người đấu giá"
  - `USER_DISABLED`: "Bạn đã tắt"
- **Thanh tiến độ:** `currentPrice / maxAmount`. Từ 80% trở lên đổi sang màu cam.

**Đồng bộ:**

- Mỗi `BidMessage` trong phòng: cập nhật `currentPrice` và `nextMinBid` trong cache `autoBid`. Nếu `source === 'AUTO' && userId === me` thì tăng `autoBidCount`.
- Nhận `AutoBidStoppedPayload` (mục 6): invalidate `autoBid`.

**Hiển thị lượt tự động:** trong lịch sử bid, biểu đồ và danh sách người tham gia, lượt có `source === 'AUTO'` gắn tag "🤖 Tự động".

---

## 8. Lịch sử đấu giá

### Trang "Lịch sử đấu giá của tôi"

**Route mới** `/lich-su-dau-gia` → `apps/bid-history/`. Mở từ menu user trên `TopNavbar`.

- **Bảng** (`GET /api/v1/me/bids?page&size&result`) gồm các cột:
  - Biển số + tỉnh
  - Trạng thái phiên
  - Số lượt của tôi (`myBidCount`, trong đó `myAutoBidCount` tự động)
  - Giá cao nhất của tôi
  - Giá cuối (`finalPrice`)
  - Kết quả
  - Tiền cọc (`depositStatus`: Đang giữ / Đã hoàn / Đã trừ / Đã hủy)
  - Lần đặt cuối
- **Tag kết quả:**

  | result | Nhãn | Màu |
  |---|---|---|
  | LEADING | Đang dẫn | xanh |
  | OUTBID | Bị vượt | cam |
  | WON | Trúng | vàng/xanh lá |
  | LOST | Không trúng | xám |

- **Lọc:** `Segmented` theo kết quả (Tất cả / Đang dẫn / Bị vượt / Trúng / Không trúng), gửi `result` lên BE.
- **Mở rộng một dòng:** gọi `GET /api/v1/me/bids/{sessionCode}` để hiện bảng con các lượt (thời gian, giá, mức tăng, tag 🤖).
- **Nút "Vào phòng":** điều hướng `/phong-dau-gia/{sessionCode}`.

### Tab lịch sử trong phòng (`BidHistoryTabContent`)

- Dữ liệu ban đầu: `initialBids` của room detail.
- Nút **"Tải thêm"** gọi `GET /api/v1/auction/{code}/bids?page&size` (`useInfiniteQuery` của react-query v3).
- Nhận `BidMessage` thì thêm lượt mới lên đầu danh sách.
- Mỗi dòng gồm: tên, giá, `+increment`, giờ, tag 🤖, ⭐ cho lượt đang thắng, và "(Bạn)" theo `userId`.

---

## 9. Biểu đồ giá

**`apps/auction-room/components/PriceChart.tsx`**, dùng recharts (giống `shared/components/area-chart`):

- **Dữ liệu ban đầu:** `GET /api/v1/auction/{code}/price-series` → `PriceSeries`.
- **Realtime:** mỗi `BidMessage` loại BID trên `/topic/auction/{code}` thì `setQueryData(QK.priceSeries(code), s => ({...s, points: [...s.points, { time: m.bidTime, price: m.currentPrice, bidder: m.userName, source: m.source, step: m.nextStep }]}))`. Bỏ qua nếu `bidTime` đã có (tránh trùng khi kết nối lại).
- **Kết nối lại:** refetch toàn bộ series.
- **Vẽ:**
  - `LineChart` hoặc `AreaChart` với `type="stepAfter"` (giá giữ nguyên cho tới lượt kế tiếp).
  - Trục X: thời gian (`dayjs(time).valueOf()`, `scale="time"`, định dạng `HH:mm:ss`).
  - Trục Y: định dạng "40tr", "1,2 tỷ".
  - `ReferenceLine y={100tr}` và `y={500tr}` lấy từ `stepTiers` (chỉ vẽ mốc nằm trong khoảng dữ liệu), nhãn "Bước giá → 10tr" / "→ 20tr".
  - Điểm (dot): lượt AUTO màu tím, MANUAL màu xanh; lượt của tôi viền đậm.
  - Tooltip: thời gian, giá, người đặt, mức tăng, nguồn.
  - Phiên LIVE thì kéo trục X tới `now` bằng một điểm ảo cuối, để thấy giá đang đứng yên.
- **Vị trí:** tab mới **"Biểu đồ"** trong `InteractionTabsPanel` (cạnh Chat / Lịch sử / Người tham gia). Trên màn hình rộng có thể hiện thêm biểu đồ nhỏ dưới `MainStagePanel`.
- **Khách chưa đăng nhập:** API này đã `permitAll`, nên vẫn xem được biểu đồ tĩnh.
- **Tái dùng cho mục 10:** `PriceChart` nhận prop tùy chọn `highlightUsers?: { [userId]: color }`.

---

## 10. Cảnh báo thổi giá (trang admin)

Có 2 nơi quản trị: web admin (`apps/admin`, `AdminLayout`) và **admin-console Java Swing** (`source/server/admin-console`). **Plan này làm trên web admin**; admin-console là phần riêng, có thể làm sau.

**Route** `/quan-tri/canh-bao-thoi-gia` (con của `adminRoute`, chỉ render khi `tokenManager` có role `ROLE_ADMIN`; không phải admin thì hiện `not-grant-permision`). Thư mục `apps/admin/pages/shill-alerts/`.

| API | Dùng |
|---|---|
| `GET /api/v1/admin/shill-alerts?status&sessionCode&page&size` | bảng |
| `GET /api/v1/admin/shill-alerts/{id}` | drawer chi tiết (có `recentBids`) |
| `PUT /api/v1/admin/shill-alerts/{id}` `{status, note}` | Xác nhận / Bỏ qua |
| `POST /api/v1/admin/users/{userId}/ban` `{reason}` | Khóa tài khoản |

**Giao diện:**

- **Bảng**, cột gồm:
  - Phiên (link vào phòng)
  - Cặp tài khoản "A ↔ B"
  - Số lượt
  - Khoảng cách nhỏ nhất / trung bình (giây)
  - Cùng IP (🖧 đỏ)
  - Mức độ (`HIGH` đỏ, `MEDIUM` cam)
  - Trạng thái
  - Lần cuối
- **Bộ lọc:** trạng thái (mặc định `OPEN`), mã phiên.
- **Drawer chi tiết:**
  - Timeline các lượt trong `recentBids`, tô màu A/B; hoặc `PriceChart` với `highlightUsers` cho A và B.
  - Bảng thông số.
  - Ô ghi chú + 2 nút **Xác nhận vi phạm** và **Bỏ qua**.
  - Nút **Khóa tài khoản A / B**, có `Popconfirm` và ô lý do.
- **Realtime:** admin subscribe `/topic/admin/alerts` (chỉ khi role ADMIN, nếu không BE sẽ đóng kết nối):
  - `notification.error` "🚨 Nghi vấn thổi giá tại {sessionCode}: {A} ↔ {B}" kèm nút "Xem".
  - Invalidate `shillAlerts`.
  - Badge số cảnh báo `OPEN` trên sidebar admin.

---

## 11. Admin gửi thông điệp vào phòng

### Phía admin

**Hai chỗ nhập thông điệp:**

1. **Trang** `/quan-tri/phong-dau-gia` (`apps/admin/pages/rooms/`): bảng phòng từ `GET /api/v1/admin/auction/rooms` (trả mảng trần). Mỗi dòng có nút **"Gửi thông điệp"** mở `AnnouncementModal` và **"Lịch sử thông điệp"** mở drawer.
2. **Trong phòng đấu giá** khi `myRole === 'ADMIN'`: `AdminRoomTools` thay chỗ `BiddingControlBox`, chứa form gửi thông điệp nhanh.

**`AnnouncementModal` / form:**

- `content`: `TextArea`, tối đa 1000 ký tự, có bộ đếm, không được để trống.
- `level`: `Segmented` INFO / WARNING / IMPORTANT.
- `pinned`: `Switch` "Ghim lên đầu phòng".
- `notifyWatchers`: `Switch` "Gửi thông báo tới người theo dõi và người đấu giá".
- Gửi bằng `POST /api/v1/admin/auction/{code}/announcements`.
- Danh sách lấy từ `GET /api/v1/auction/{code}/announcements`. Gỡ bằng `DELETE /api/v1/admin/auction/{code}/announcements/{id}` (có `Popconfirm`).

### Phía phòng đấu giá (mọi vai trò)

- **Nhận realtime:** `handleRoomEvent` trong `useData.ts` thêm 2 nhánh:
  - `event === 'ANNOUNCEMENT'`: hiện banner hoặc toast với `message`, chèn một dòng "📢 Thông điệp từ ban tổ chức" vào chat (kiểu `isSystem`), rồi **invalidate `announcements` và `roomDetail`** để lấy `level` / `pinned` / `pinnedNotice` mới. `RoomEventVO` không mang các trường này (xem mục 13).
  - `event === 'ANNOUNCEMENT_REMOVED'`: invalidate `announcements` và `roomDetail`.
- **Thanh ghim:** `PinnedNoticeBar` (đã có trong `InteractionTabsPanel`) lấy `pinnedNotice` từ room detail. Hiện thanh ở **mọi tab**, không chỉ tab chat. Màu theo `level` của thông điệp đang ghim, tìm trong `announcements`.
- **Danh sách thông điệp:** drawer hoặc popover từ icon 📢 trên header phòng, liệt kê `announcements`.
- **An toàn:** render `content` dạng **text thuần** (`{content}` trong JSX, `white-space: pre-wrap`). **Không** dùng `dangerouslySetInnerHTML` hay `html-react-parser`.

---

## 12. Cấu trúc file

**Mới:**

```
src/shared/types/auction.ts
src/shared/constants/queryKeys.ts
src/shared/realtime/StompProvider.tsx, useStomp.ts, useStompSubscription.ts, UserChannels.tsx, OutbidAlertHost.tsx
src/shared/feature/audio.ts                         (chuyển từ apps/auction-room/feature)
src/shared/components/watch-star/WatchStar.tsx
src/shared/components/notification-bell/NotificationBell.tsx, NotificationDropdown.tsx, NotificationRow.tsx
src/shared/components/wallet-badge/WalletBadge.tsx
src/shared/services/{wallet,notification,watch}.ts   (dùng chung giữa navbar và các trang)

src/apps/wallet/            route.ts, index.tsx, components/{WalletSummary,TopupModal,TransactionTable}.tsx, services/*
src/apps/bid-history/       route.ts, index.tsx, components/{HistoryTable,SessionBidsSubTable}.tsx, services/*
src/apps/auction-room/components/RegisterBidderCard.tsx, AutoBidPanel.tsx, PriceChart.tsx,
                                  AnnouncementBanner.tsx, AnnouncementListDrawer.tsx, AdminRoomTools.tsx, RoleBadge.tsx
src/apps/auction-room/hooks/useRoomRole.ts, usePriceSeries.ts, useAutoBid.ts
src/apps/admin/pages/shill-alerts/   index.tsx, ShillAlertTable.tsx, ShillAlertDrawer.tsx, services/*
src/apps/admin/pages/rooms/          index.tsx, AnnouncementModal.tsx, services/*
```

**Sửa:**

```
src/rootRoute.tsx                 → bọc StompProvider + UserChannels trong RootComponent
src/Route.tsx                     → thêm route ví, lịch sử, 2 trang admin
src/shared/utils/tokenManager.ts  → phát event 'auth-changed' khi set/remove token
apps/dashboard/hooks/useAuctionSocket.ts      → dùng useStompSubscription
apps/dashboard/hooks/useData.ts, useAction.ts → sessionCode, isWatched, nextMinBid; bỏ cập nhật giá cục bộ
apps/dashboard/services/{api,type}.ts         → bỏ mock placeBidApi; kiểu dữ liệu mới
apps/dashboard/components/AuctionCardItem, AuctionTableItem, AuctionBoardItem, BidModal, TopNavbar
apps/dashboard/index.tsx / Home.tsx           → tab "Đang theo dõi"
apps/auction-room/hooks/useAuctionRoomSocket.ts → dùng provider chung; publish { bidAmount }
apps/auction-room/hooks/useData.ts            → myRole, nextStep/nextMinBid, so sánh theo userId, ANNOUNCEMENT, bỏ auto-bid cục bộ
apps/auction-room/hooks/useAction.ts          → bỏ fallback cục bộ, kiểm tra theo nextStep, REST fallback thật
apps/auction-room/services/{api,type}.ts      → API mới, bỏ mock
apps/auction-room/components/BiddingControlBox, BidHistoryTabContent, InteractionTabsPanel,
                              MainStagePanel, AuctionRoomHeader, ChatTabContent, ParticipantsTabContent
apps/auction-room/feature/autoBid.ts          → XÓA
apps/admin/components/sidebar                 → menu "Phòng đấu giá", "Cảnh báo thổi giá"
```

---

## 13. BE cần chỉnh để FE làm gọn hơn (đề xuất, chưa bắt buộc)

| # | Vấn đề | Ảnh hưởng FE | Đề xuất |
|---|---|---|---|
| 1 | `ErrorVO.code` và `ErrorResponse` dùng mã HTTP ("400"/"403"), không phải tên lỗi | FE không phân biệt được `AUCTION_NOT_REGISTERED` với `CHAT_BIDDER_ONLY` (cùng "403"), hay `WALLET_INSUFFICIENT` với các lỗi 400 khác, nên không mở đúng modal "Đăng ký" / "Nạp tiền" | Thêm trường `errorKey = ErrorCode.name()` vào `ErrorVO` và `ErrorResponse`. **Tạm thời** FE so sánh `message` |
| 2 | `RoomEventVO` của `ANNOUNCEMENT` thiếu `id`, `level`, `pinned` | Phải refetch 2 API sau mỗi thông điệp | Gửi kèm `RoomAnnouncementVO` (thêm trường `payload` vào `RoomEventVO`) |
| 3 | `AutoBidScheduler.stopConfig` gửi Map thô vào `/user/queue/notifications`, rồi `notifyUser` gửi thêm `NotificationVO` | Trùng tin, khác kiểu dữ liệu | Bỏ dòng gửi Map vào `/queue/notifications`; giữ gửi vào `/queue/outbid` |
| 4 | `AuctionSessionVO` chưa có `isRegistered` / `myRole` | Dashboard không biết hiện "Đặt giá" hay "Đăng ký" | Thêm giống `isWatched` |
| 5 | API admin cũ trả trần, API admin mới bọc `SuccessResponse` | Service FE phải xử lý 2 kiểu | Thống nhất bọc `SuccessResponse` |
| 6 | `LocalDateTime` không có múi giờ | Lệch giờ nếu máy client khác múi giờ server | Chấp nhận được cho đồ án; nếu cần thì đổi sang `OffsetDateTime` |

---

## 14. Thứ tự làm và mốc kiểm tra

| # | Việc | Phụ thuộc | Xong khi |
|---|---|---|---|
| 1 | Mục 1: types, query keys, **StompProvider dùng chung**, chuyển 2 hook socket cũ, luồng bid mới (bỏ mock và cập nhật cục bộ) | — | Dashboard và phòng nhận giá realtime như cũ qua 1 kết nối; bid sai bị báo lỗi từ BE; đăng nhập/đăng xuất thì kết nối lại với token mới |
| 2 | Mục 2: bước giá động | 1 | Nút nhanh và ô nhập đúng bậc 5/10/20tr; vượt mốc 100tr hoặc 500tr thì thông báo bước giá mới |
| 3 | Mục 4 + 3: ví, đăng ký đấu giá, giao diện theo vai trò | 1 | Khách xem thấy `RegisterBidderCard`, đăng ký xong giao diện đổi ngay (không tải lại); ví trừ/hoàn đúng |
| 4 | Mục 6: cảnh báo vượt giá + so sánh theo `userId` | 1 | Mở 2 trình duyệt: A bị B vượt thì A thấy toast + âm báo ở cả trang dashboard |
| 5 | Mục 8 + 9: lịch sử + biểu đồ | 1 | Biểu đồ thêm điểm realtime, có mốc 100tr/500tr; trang lịch sử lọc đúng |
| 6 | Mục 5: ⭐ + chuông thông báo + tab theo dõi | 1 | ⭐ cập nhật lạc quan; chuông tăng số khi có tin; bấm tin thì vào đúng phòng |
| 7 | Mục 7: auto-bid panel, xóa auto-bid cục bộ | 3, 4 | Bật auto-bid ở A, đóng tab A: B trả giá thì A vẫn tự trả sau khoảng 5 giây; chạm trần thì panel báo dừng |
| 8 | Mục 11: thông điệp admin | 1 (song song được) | Admin gửi, phòng hiện ngay; ghim thay `pinnedNotice`; gỡ thì biến mất |
| 9 | Mục 10: trang cảnh báo thổi giá | 1, 9 (`PriceChart`) | 2 tài khoản trả tay xen kẽ dưới 15 giây: admin nhận toast, xác nhận hoặc bỏ qua được |

### Kịch bản test tay tổng (3 trình duyệt: Admin, A, B)

1. A và B nạp tiền, rồi đăng ký phiên X. Ví giữ cọc; huy hiệu đổi từ "Khách xem" sang "Người đấu giá".
2. B (chưa đăng ký phiên Y) vào Y: không có khung đặt giá, không chat được, vẫn xem được biểu đồ.
3. A bấm ⭐ phiên Z: nhận thông báo "sắp bắt đầu" và "bắt đầu".
4. A đặt giá, B trả cao hơn: A nhận toast vượt giá ở bất kỳ trang nào.
5. Giá vượt 100tr: bước giá trên giao diện đổi sang 10tr.
6. A bật auto-bid (trần 300tr), B trả tay vài lần: A tự trả sau khoảng 5 giây (tag 🤖); chạm trần thì báo dừng.
7. A và B trả tay xen kẽ nhanh: Admin nhận cảnh báo thổi giá.
8. Admin gửi thông điệp ghim vào phòng X: A và B thấy ngay.
9. Phiên kết thúc: lịch sử hiện Trúng/Không trúng; ví người thắng bị trừ cọc, người thua được hoàn.
