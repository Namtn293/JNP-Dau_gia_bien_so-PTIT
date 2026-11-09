# Plan Backend: tính năng mới (auction-core-service)

Phạm vi (10 chức năng):

| # | Chức năng | Mục |
|---|---|---|
| A | Bước giá tăng theo giá hiện tại (<100tr: +5tr, 100–500tr: +10tr, >500tr: +20tr) | 1 |
| B | Phân quyền **người đấu giá** (đã cọc) và **khách xem** (chưa cọc) | 2 |
| C | Ví điện tử (**tiền ảo**: chỉ là số dư trong DB, không có cổng thanh toán) | 3 |
| D | Theo dõi phiên (⭐) + tự động thông báo | 4 |
| E | Cảnh báo tức thì cho người đang giữ giá khi có người trả cao hơn | 5 |
| F | Đấu giá tự động (trả giá sau 5 giây + ngẫu nhiên vài trăm ms, chống spam) | 6 |
| G | Lịch sử đấu giá | 7 |
| H | Biểu đồ giá của phiên hiện tại | 8 |
| I | Phát hiện và cảnh báo thổi giá (2 tài khoản đặt giá liên tục, mỗi lượt cách nhau ≤ 15 giây) | 9 |
| J | Admin gửi thông điệp vào phòng đấu giá bất kỳ | 10 |

Mục 0 là việc nền, bắt buộc làm trước.

**Quy ước chung**

- Package gốc: `com.ptit.bigdata.coreservice`.
- Entity kế thừa `EntityBase` (id IDENTITY).
- Response bọc bằng `ResponseUtil.ok(...)`; lỗi nghiệp vụ dùng `BusinessException(ErrorCode.X)`.
- DB đang để `ddl-auto: update`, nên bảng/cột mới tự tạo, chưa cần migration. Index khai báo trong `@Table(indexes = ...)`.
- Tiền là `Long` (VND), không dùng `double`.
- Thời gian trả cho FE dùng ISO-8601 (`2026-11-09T14:03:21`).
- Các tham số đặt trong `application.yaml` dưới prefix `auction.*` (mục 13), đọc qua `AuctionProperties` (`@ConfigurationProperties`).

---

## 0. Việc nền: gom luồng đặt giá về `BidService`

### Vì sao

`AuctionWebSocketController.processBidPersistence` hiện:

- Không kiểm tra giá, trạng thái phiên hay tạm dừng.
- Không khóa dòng phiên, nên hai lượt bid đồng thời có thể ghi đè nhau.
- Lượt bid nào cũng lưu `isWinningBid = true`.
- Không có DB thì dùng "mock fallback", nên vẫn phát ra lượt bid giả.

Bước giá động, phân quyền, ví, auto-bid, cảnh báo vượt giá, biểu đồ, lịch sử và thổi giá đều dựa vào đây.

### Việc cần làm

**`AuctionSessionRepository`**: thêm hàm khóa dòng phiên.

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("select a from AuctionSession a where a.sessionCode = :code")
Optional<AuctionSession> findBySessionCodeForUpdate(@Param("code") String code);
```

**`BidHistory`**: bổ sung các phần sau.

- `@Table(indexes = { @Index(columnList = "auctionSessionId, bidTime"), @Index(columnList = "userID, bidTime") })`.
  - **Lưu ý:** kiểm tra tên bảng thật trong DB trước khi đặt `name`, để Hibernate không tạo bảng mới.
- Cột mới:
  - `previousPrice` (Long)
  - `stepApplied` (Long): bước giá áp dụng tại thời điểm bid
  - `clientIp` (String, 64)
  - `source` (enum `MANUAL`, `AUTO`): lượt bid tay hay lượt do auto-bid

**`BidService` + `BidServiceImpl`** (mới):

```java
@Transactional
BidResultVO placeBid(String sessionCode, Long userId, Long bidAmount, BidSourceEnum source, String clientIp);
```

Thứ tự xử lý trong `placeBid`:

1. `userId == null` → `BID_UNAUTHORIZED`.
2. `findBySessionCodeForUpdate` → `AUCTION_NOT_FOUND`.
3. `status != LIVE` (kể cả `PAUSED`) hoặc `now > endTime` → `AUCTION_NOT_LIVE`.
4. Chưa có `AuctionRegistration` ACTIVE (tức là khách xem, mục 2) → `AUCTION_NOT_REGISTERED`.
5. Người đặt đang là người dẫn giá → `ALREADY_LEADING`.
6. `step = StepPriceCalculator.stepFor(currentPrice)` (mục 1). Nếu `bidAmount == null` thì `bidAmount = currentPrice + step`. Nếu `bidAmount < currentPrice + step` → `BID_TOO_LOW`; nếu `(bidAmount - currentPrice) % step != 0` → `BID_INVALID_STEP`.
7. `bidHistoryRepository.clearWinning(sessionId)` (`@Modifying` update `isWinningBid = false`).
8. Lưu `BidHistory` (`isWinningBid = true`, `previousPrice`, `stepApplied`, `clientIp`, `source`, `userID`).
9. Cập nhật phiên: `currentPrice`, `winningPrice`, `bidCount + 1`, `userInfoId` = người dẫn, `stepPrice = stepFor(newPrice)` (bước giá cho lượt kế tiếp).
10. `publishEvent(new BidPlacedEvent(...))`.
11. Trả `BidResultVO`.

**`BidPlacedEvent`** (record mới):

```java
record BidPlacedEvent(Long sessionId, String sessionCode, String plateNumber,
                      Long bidHistoryId, Long userId, String username, String fullName,
                      Long previousLeaderUserId, String previousLeaderUsername,
                      Long previousPrice, Long newPrice, Long nextStep, Long nextMinBid,
                      int bidCount, LocalDateTime bidTime, BidSourceEnum source, String clientIp) {}
```

**Listener** dùng `@TransactionalEventListener(phase = AFTER_COMMIT)`, nên chỉ chạy khi bid đã thật sự được lưu:

| Listener | Mục | Chạy |
|---|---|---|
| `BidBroadcastListener` | broadcast giá tới `/topic/auction/{code}` và `/topic/auctions` | đồng bộ |
| `OutbidAlertListener` | 5 | đồng bộ (phải tức thì) |
| `AutoBidListener` | 6 | đồng bộ, chỉ đặt lịch rồi trả về ngay |
| `WatchNotificationListener` | 4 | `@Async` |
| `ShillDetectionListener` | 9 | `@Async` |

Bật `@EnableAsync` và khai báo một `ThreadPoolTaskExecutor` riêng (ví dụ `auctionAsyncExecutor`, core 4).

**`AuctionWebSocketController`**:

- `handleBid` và `handleDashboardBid` chỉ còn gọi `bidService.placeBid(..., MANUAL, ip)`. Bỏ `@SendTo`, vì việc broadcast đã do listener làm.
- Bắt `BusinessException` và gửi lỗi riêng cho người đặt: `convertAndSendToUser(principal.getName(), "/queue/errors", ErrorVO)`. **Không ném lỗi ra ngoài**, vì như vậy STOMP sẽ đóng kết nối.
- Xóa nhánh "Mock data fallback".
- Lấy IP: thêm `HandshakeInterceptor` vào endpoint `/ws`, đọc `X-Forwarded-For` hoặc `remoteAddress` rồi lưu vào session attributes.

**Tạm dừng phiên:** `AdminAuctionServiceImplement.halt` hiện chỉ thêm `roomId` vào `pausedRooms` trong bộ nhớ. Sửa để đặt `status = PAUSED` trong DB, và `resume` đặt lại `LIVE`, để `placeBid` chặn được bid khi phòng đang tạm dừng.

**`ErrorCode`** mới: `AUCTION_NOT_FOUND`, `AUCTION_NOT_LIVE`, `AUCTION_NOT_REGISTERED`, `ALREADY_LEADING`, `BID_TOO_LOW`, `BID_INVALID_STEP`, `BID_UNAUTHORIZED`.

**Cần test:**

- Hai luồng bid đồng thời cùng giá: chỉ một luồng thành công.
- Bid khi phiên `SOON`/`PAUSED`/`END` bị từ chối.
- Bid sai bước giá bị từ chối.
- Khách xem bid bị từ chối.

---

## 1. Bước giá tăng theo giá hiện tại

**`StepPriceCalculator`** (component, đọc bảng bậc từ config):

```java
public long stepFor(long currentPrice) {
    if (currentPrice < 100_000_000L) return 5_000_000L;    // < 100tr
    if (currentPrice <= 500_000_000L) return 10_000_000L;  // 100tr – 500tr (tính cả 100tr và 500tr)
    return 20_000_000L;                                    // > 500tr
}
```

Ví dụ: 95tr + 5tr = 100tr, bước kế tiếp là 10tr; 500tr + 10tr = 510tr, bước kế tiếp là 20tr.

- **Cấu hình:** bảng bậc đặt trong `auction.step-tiers` (mục 13), không viết cứng, để admin hoặc nhóm chỉnh được.
- **`AuctionSession.stepPrice`:** giữ cột này, nhưng **luôn tính lại** bằng `stepFor(currentPrice)` sau mỗi bid và khi tạo phiên. Không tin giá trị nhập tay nữa.
- **Trả cho FE:** thêm `nextStep` và `nextMinBid` (= `currentPrice + nextStep`) vào `AuctionSessionVO`, `AuctionRoomDetailVO` và `BidMessageVO`. **FE không tự tính bước giá**, để tránh lệch với BE.
- **`AuctionSessionServiceImplement`:** khi trả chi tiết phòng, tính `nextStep` từ `currentPrice`, không lấy `stepPrice` cũ trong DB.

**Cần test:** biên 99.999.999 / 100.000.000 / 500.000.000 / 500.000.001.

---

## 2. Phân quyền: người đấu giá (đã cọc) và khách xem (chưa cọc)

Định nghĩa vai trò trong một phiên:

| Vai trò | Điều kiện | Được làm |
|---|---|---|
| `ADMIN` | `RoleEnum.ADMIN` | xem mọi thứ, gửi thông điệp phòng, không đặt giá |
| `BIDDER` | đăng nhập + `AuctionRegistration` ACTIVE của phiên (đã giữ cọc) | đặt giá, auto-bid, chat, nhận cảnh báo vượt giá |
| `VIEWER` | đăng nhập, chưa cọc | xem giá, biểu đồ, lịch sử bid, đọc chat, nhận thông điệp admin, theo dõi ⭐ |
| (khách vãng lai) | chưa đăng nhập | như hiện tại: chỉ dashboard (`/topic/auctions`) |

**Thực thi ở BE (không chỉ ẩn nút ở FE):**

- **`RoomRoleResolver.resolve(userId, sessionId)`:** trả `ADMIN | BIDDER | VIEWER`. Cache ngắn trong session attributes của WebSocket, và xóa cache khi đăng ký hoặc hủy đăng ký.
- **`placeBid`:** đã chặn ở bước 4 của mục 0.
- **Chat `/app/chat/{code}`:** chỉ `BIDDER` hoặc `ADMIN` được gửi. Khách xem gửi thì trả lỗi `CHAT_BIDDER_ONLY` về `/user/queue/errors`. Muốn cho khách xem chat thì đặt `auction.room.viewer-can-chat: true`.
- **Auto-bid:** chỉ `BIDDER` được bật (mục 6).
- **Chi tiết phòng:** `AuctionRoomDetailVO` thêm `myRole`, `isRegistered`, `depositAmount`, để FE hiện nút "Đăng ký đấu giá (cọc X)" thay cho khung đặt giá.
- **Danh sách người tham gia:** `ParticipantsTabContent` / `AdminParticipantVO` thêm `role`, để phân biệt người đấu giá và khách xem.

---

## 3. Ví điện tử (tiền ảo)

"Nạp tiền" là cộng thẳng số dư, dùng để demo luồng đặt cọc. Không có cổng thanh toán và không có chức năng rút tiền.

### Entity

**`Wallet`**: bảng `WALLET`, unique `USER_ID`.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| userId | Long | |
| balance | Long | tổng số dư |
| heldAmount | Long | đang bị giữ làm cọc |
| version | Long | `@Version` |
| updatedAt | LocalDateTime | |

Số dư khả dụng = `balance - heldAmount`. Tính khi trả về, không lưu thành cột.

**`WalletTransaction`**: bảng `WALLET_TRANSACTION`, index `(WALLET_ID, CREATED_AT)`.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| walletId | Long | |
| type | `WalletTxTypeEnum` | `INIT_BONUS, TOPUP, HOLD, RELEASE, CAPTURE` |
| amount | Long | luôn dương |
| balanceAfter, heldAfter | Long | |
| sessionCode | String(50) | null với TOPUP / INIT_BONUS |
| note | String(255) | |
| createdAt | LocalDateTime | |

**`AuctionRegistration`**: bảng `AUCTION_REGISTRATION`, unique `(USER_ID, SESSION_ID)`.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| userId, sessionId | Long | |
| depositAmount | Long | chụp lại `session.depositAmount` lúc đăng ký |
| status | enum | `ACTIVE, RELEASED, CAPTURED, CANCELLED` |
| createdAt | LocalDateTime | |

### Quy tắc

- **Tạo ví:** tạo khi gọi ví lần đầu, tặng `auction.wallet.initial-balance` (1 tỷ) và ghi `INIT_BONUS`.
- **Nạp tiền ảo:** `amount` trong `(0, auction.wallet.max-topup]` (500 triệu mỗi lần). Ghi `TOPUP`.
- **Đăng ký đấu giá** (từ khách xem thành người đấu giá): phiên `SOON` hoặc `LIVE`, khả dụng ≥ `depositAmount`. Giữ cọc (`HOLD`) và tạo `AuctionRegistration` ACTIVE.
- **Hủy đăng ký:** chỉ khi phiên còn `SOON`. Ghi `RELEASE`, đặt `CANCELLED`, và tắt auto-bid nếu có.
- **Kết thúc phiên** (trong `handleEndSession`, cùng transaction với việc chuyển sang `END`):
  - Người thắng: `CAPTURE` tiền cọc (`balance` và `heldAmount` cùng giảm), đặt `CAPTURED`.
  - Người còn lại: `RELEASE`, đặt `RELEASED`.
  - Phần còn lại của giá trúng thanh toán ngoài hệ thống.
- **Admin hủy phiên** (`AdminAuctionServiceImplement.cancel`): `RELEASE` cho tất cả. Hiện code chỉ gửi câu "hoàn cọc 100%" mà chưa hoàn thật.
- **Không để lệch tiền:** mọi thay đổi `Wallet` chỉ đi qua `WalletService`. Mỗi thao tác là một `@Transactional` gồm thay đổi `Wallet` + insert `WalletTransaction`. Gặp `OptimisticLockException` thì thử lại tối đa 3 lần.

### API

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/v1/wallet` | `{balance, heldAmount, available}` |
| POST | `/api/v1/wallet/topup` | `{amount}` |
| GET | `/api/v1/wallet/transactions?page&size&type` | Lịch sử giao dịch |
| POST | `/api/v1/auction/{code}/register` | Đăng ký đấu giá và giữ cọc |
| DELETE | `/api/v1/auction/{code}/register` | Hủy đăng ký (chỉ khi `SOON`) |
| GET | `/api/v1/auction/{code}/registration` | `{registered, depositAmount, status, myRole}` |

Sau khi đăng ký hoặc hủy, đẩy `ROLE_CHANGED` tới `/user/queue/room-role` để FE đổi giao diện ngay mà không phải tải lại trang.

**`ErrorCode`** mới: `WALLET_INSUFFICIENT`, `TOPUP_INVALID_AMOUNT`, `ALREADY_REGISTERED`, `REGISTRATION_CLOSED`, `NOT_REGISTERED`.

**Cần test:**

- Đăng ký khi không đủ tiền bị từ chối.
- Đăng ký 2 lần bị từ chối.
- Kết thúc phiên: người thắng bị trừ cọc, người thua được trả cọc. Tổng `balance` giảm đúng bằng tổng cọc người thắng.
- Admin hủy phiên thì hoàn cọc đủ cho tất cả.
- Nạp tiền đồng thời không bị mất tiền.

---

## 4. Theo dõi phiên (⭐) + tự động thông báo

### Entity

**`AuctionWatch`**: bảng `AUCTION_WATCH`, unique `(USER_ID, SESSION_ID)`. Cột: `userId`, `sessionId`, `createdAt`.

**`Notification`**: bảng `NOTIFICATION`, index `(USER_ID, IS_READ, CREATED_AT)`. Cột: `userId`, `type`, `title`, `content`, `sessionCode`, `isRead`, `createdAt`.

**`NotificationLog`**: bảng `NOTIFICATION_LOG`, unique `(USER_ID, SESSION_ID, TYPE)`. Dùng để chống gửi trùng, vì scheduler chạy 2 giây một lần.

`NotificationTypeEnum`: `STARTING_SOON, STARTED, NEW_BID, OUTBID, ENDING_SOON, ENDED_WON, ENDED_LOST, ENDED, ROOM_ANNOUNCEMENT, AUTO_BID_STOPPED, SHILL_ALERT`.

### API

| Method | Path | Mô tả |
|---|---|---|
| POST / DELETE | `/api/v1/watch/{sessionCode}` | Theo dõi / bỏ theo dõi (gọi lại vẫn an toàn) |
| GET | `/api/v1/watch?page&size` | Danh sách phiên đang theo dõi |
| GET | `/api/v1/notifications?page&size&unreadOnly` | Danh sách thông báo |
| GET | `/api/v1/notifications/unread-count` | Số tin chưa đọc |
| PUT | `/api/v1/notifications/{id}/read`, `/read-all` | Đánh dấu đã đọc (chỉ thông báo của chính mình) |

**Sửa `AuctionSessionVO` và `/api/v1/auction/get`:**

- Thêm `sessionCode`, `isWatched`, `nextStep`, `nextMinBid`. Hiện VO chưa có mã phiên, nên FE không biết gắn ⭐ vào phiên nào.
- Nếu dashboard cho khách vãng lai xem thì cần `permitAll` cho GET này trong `SecurityConfig`.

### Khi nào gửi thông báo, gửi cho ai

| Type | Kích hoạt | Người nhận |
|---|---|---|
| STARTING_SOON | Scheduler: `SOON` và còn ≤ 15 phút | người theo dõi |
| STARTED | `handleStartSession` | người theo dõi + người đã đăng ký |
| NEW_BID | `BidPlacedEvent` | người theo dõi, trừ người đặt và người vừa bị vượt (họ đã nhận OUTBID); tối đa 1 tin/phiên/người mỗi 60 giây |
| OUTBID | mục 5 | người vừa bị vượt giá |
| ENDING_SOON | Scheduler: `LIVE` và còn ≤ 5 phút | người theo dõi + người đã đăng ký |
| ENDED_WON / ENDED_LOST | `handleEndSession` | người đã đặt giá |
| ENDED | `handleEndSession` | người theo dõi nhưng chưa đặt giá |
| ROOM_ANNOUNCEMENT | mục 10 | người theo dõi + người đã đăng ký, nếu admin chọn "gửi thông báo" |

- **Giới hạn NEW_BID:** dùng `ConcurrentHashMap` trong bộ nhớ.
- **STARTING_SOON, ENDING_SOON, kết thúc:** insert `NotificationLog` trước khi gửi. Nếu trùng unique thì bỏ qua.

**`NotificationService.notifyUsers(userIds, type, title, content, sessionCode)`:** `saveAll` các `Notification` rồi `convertAndSendToUser(username, "/queue/notifications", vo)` cho từng user.

---

## 5. Cảnh báo tức thì khi bị trả giá cao hơn

Khác với thông báo thường (mục 4), cảnh báo này phải **đến ngay lập tức** và hiện nổi bật, kể cả khi người dùng đang ở trang khác trong app.

**`OutbidAlertListener`** (AFTER_COMMIT, **đồng bộ**, không `@Async`). Nếu `previousLeaderUserId != null` và khác `userId` người vừa đặt:

1. `convertAndSendToUser(previousLeaderUsername, "/queue/outbid", OutbidAlertVO)`:

   ```json
   { "sessionCode": "...", "plateNumber": "30K-999.99",
     "newPrice": 120000000, "yourLastBid": 110000000,
     "nextMinBid": 130000000, "nextStep": 10000000,
     "outbidBy": "Nguyễn Văn B", "remainingSeconds": 95,
     "autoBidActive": true, "bidTime": "2026-11-09T14:03:21" }
   ```

2. Lưu `Notification` type `OUTBID`, để còn trong lịch sử thông báo nếu lúc đó họ không online.

- **Không giới hạn tần suất** cho OUTBID: mỗi lần mất vị trí dẫn đầu đều phải báo.
- **Khi người bị vượt đang bật auto-bid:** vẫn gửi, kèm `autoBidActive: true`. FE hiện "Auto-bid sẽ trả giá sau ~5 giây" thay vì giục họ trả giá tay.
- **WebSocket:** cho phép user đăng nhập SUBSCRIBE `/user/queue/outbid`.

**Cần test:** A dẫn giá, B trả cao hơn: A nhận tin `/user/queue/outbid` trong vòng dưới 1 giây; B không nhận.

---

## 6. Đấu giá tự động (auto-bid ở server)

### Vì sao chuyển từ FE về BE

Auto-bid hiện nằm ở FE (`jnp.fe/src/apps/auction-room/feature/autoBid.ts`): trả giá sau 700ms và nhận biết người dẫn bằng cách so tên với chuỗi `"Bạn"`. Cách này có ba vấn đề:

- Tắt tab là auto-bid ngừng.
- Nhiều người cùng bật thì các client trả giá đồng loạt, gây spam.
- Không kiểm soát được từ server.

Hướng mới: **chỉ server thực hiện auto-bid**. FE chỉ còn bật/tắt và hiển thị trạng thái; xóa logic gửi bid trong `autoBid.ts`.

### Entity

**`AutoBidConfig`**: bảng `AUTO_BID_CONFIG`, unique `(USER_ID, SESSION_ID)`.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| userId, sessionId | Long | |
| maxAmount | Long | giá trần người dùng chấp nhận |
| active | Boolean | |
| stoppedReason | enum | `USER_DISABLED, MAX_REACHED, SESSION_ENDED, NOT_REGISTERED` |
| autoBidCount | Integer | số lượt đã tự trả |
| createdAt, updatedAt | LocalDateTime | |

### API

| Method | Path | Mô tả |
|---|---|---|
| PUT | `/api/v1/auction/{code}/auto-bid` | `{maxAmount}`: bật hoặc cập nhật (chỉ `BIDDER`; `maxAmount >= nextMinBid`) |
| DELETE | `/api/v1/auction/{code}/auto-bid` | Tắt |
| GET | `/api/v1/auction/{code}/auto-bid` | Cấu hình của tôi |

### Cơ chế chống spam

Thuật toán do `AutoBidScheduler` thực hiện. Dùng `ThreadPoolTaskScheduler` riêng, giữ `Map<sessionId, ScheduledFuture>` và **mỗi phiên chỉ có tối đa 1 lượt auto-bid đang chờ**.

1. Khi có `BidPlacedEvent`, bật/sửa auto-bid, hoặc phiên chuyển sang LIVE:
   - **Hủy** lượt auto-bid đang chờ của phiên đó (nếu có).
   - Tìm các ứng viên: `AutoBidConfig` active của phiên, **trừ người đang dẫn giá**, có `maxAmount >= nextMinBid`.
   - Không còn ứng viên thì dừng.
   - Chọn **một** ứng viên:
     - Ưu tiên `maxAmount` cao nhất.
     - Bằng nhau thì lấy người bật auto-bid sớm hơn (`createdAt`).
   - Đặt lịch chạy sau `delay = auction.auto-bid.base-delay-ms (5000) + random(0, auction.auto-bid.jitter-ms (1500))` ms.
2. Khi đến giờ chạy, **kiểm tra lại toàn bộ** vì trạng thái có thể đã đổi:
   - Phiên vẫn LIVE và chưa hết giờ.
   - Người này vẫn không phải người dẫn giá.
   - Config vẫn active.
   - `nextMinBid <= maxAmount`.
   - Thỏa hết thì gọi `bidService.placeBid(code, userId, null, AUTO, null)`, đặt đúng `nextMinBid` theo bậc giá ở mục 1.
3. `placeBid` thành công sinh ra `BidPlacedEvent` mới, quay lại bước 1.
4. Nếu `nextMinBid > maxAmount`:
   - Đặt `active = false` và `stoppedReason = MAX_REACHED`.
   - Gửi `AUTO_BID_STOPPED` tới `/user/queue/notifications` và `/user/queue/outbid`.
5. Gặp lỗi nghiệp vụ (`AUCTION_NOT_LIVE`, `NOT_REGISTERED`…) thì tắt config với lý do tương ứng. Không thử lại vòng lặp.

**Kết quả:**

- Mỗi phiên **nhiều nhất 1 lượt auto-bid trong khoảng 5–6,5 giây**, dù có bao nhiêu người bật.
- Phần ngẫu nhiên vài trăm ms tránh việc nhiều phiên hoặc nhiều server bắn cùng một mili-giây.
- Người trả giá tay luôn có ít nhất 5 giây để chen vào.

**Phụ trợ:**

- **Kết thúc phiên:** `handleEndSession` hủy lượt đang chờ và tắt mọi config (`SESSION_ENDED`).
- **Khởi động lại server:** các lượt đang chờ trong bộ nhớ bị mất. Lúc khởi động (`ApplicationReadyEvent`), quét các phiên LIVE có auto-bid active và đặt lịch lại.
- **Chỉ chạy 1 instance:** cơ chế này giả định chỉ có 1 server. Nếu sau này chạy nhiều instance thì phải chuyển sang khóa phân tán.
- **Hiển thị:** `BidMessageVO` thêm `source: AUTO/MANUAL` để FE gắn nhãn "🤖 tự động" vào lượt bid.

**Cần test:**

- Hai người bật auto-bid (max 200tr và 150tr): hai bên trả xen kẽ, mỗi lượt cách nhau 5–6,5 giây, dừng khi vượt 150tr; người max 150tr nhận `AUTO_BID_STOPPED`.
- Người trả tay chen vào giữa: lượt auto đang chờ bị hủy và đặt lịch lại.
- Đang dẫn giá thì auto-bid không tự trả đè chính mình.

---

## 7. Lịch sử đấu giá

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/v1/me/bids?page&size&result` | Lịch sử của tôi, mỗi dòng là một phiên |
| GET | `/api/v1/me/bids/{sessionCode}` | Các lượt đặt của tôi trong một phiên |
| GET | `/api/v1/auction/{sessionCode}/bids?page&size` | Toàn bộ lượt đặt của phiên (phân trang, mới nhất trước) |

**`MyAuctionHistoryVO`:**

```
sessionCode, plateNumber, provinceName, status, startTime, endTime,
myBidCount, myAutoBidCount, myHighestBid, myLastBidAt, finalPrice,
depositStatus (ACTIVE/RELEASED/CAPTURED/CANCELLED),
result: LEADING | OUTBID | WON | LOST
```

- **Truy vấn:** gộp `bid_history` theo phiên với `where userid = :userId`, join `auction_session`, `number_plate`, `auction_registration`.
- **Kết quả:** `LEADING`/`WON` khi lượt `is_winning_bid` là của tôi.
- **Lọc `result`:** lọc trong SQL, không lọc trên bộ nhớ, để phân trang đúng.

`BidHistoryItemVO`: thêm `userId`, `bidTime` (ISO), `increment`, `source`.

---

## 8. Biểu đồ giá của phiên

`GET /api/v1/auction/{sessionCode}/price-series`

```json
{
  "sessionCode": "...", "startPrice": 40000000,
  "startTime": "...", "endTime": "...",
  "points": [
    { "time": "2026-11-09T14:00:00", "price": 40000000, "bidder": null, "source": null, "step": null },
    { "time": "2026-11-09T14:01:12", "price": 45000000, "bidder": "Nguyễn Văn A", "source": "MANUAL", "step": 5000000 }
  ],
  "stepTiers": [
    { "upTo": 100000000, "step": 5000000 },
    { "upTo": 500000000, "step": 10000000 },
    { "upTo": null, "step": 20000000 }
  ]
}
```

- **Điểm dữ liệu:** điểm đầu là `startPrice`; các điểm tiếp theo lấy từ `BidHistory` theo thời gian tăng dần. Tối đa `auction.chart.max-points` điểm (lấy các điểm cuối, kèm điểm đầu).
- **`stepTiers`:** để FE vẽ các đường mốc 100tr / 500tr.
- **Realtime:** không thêm kênh mới. `BidMessageVO` thêm `bidTime` (ISO); trường `timestamp` `HH:mm:ss` giữ nguyên để FE hiện tại không hỏng.

---

## 9. Phát hiện và cảnh báo thổi giá

### Định nghĩa

Trong một phiên, xét chuỗi lượt bid mới nhất. Phát hiện nghi vấn khi:

- `N = auction.shill.min-alternating-bids` lượt cuối (mặc định **6**, tức 3 vòng) chỉ thuộc **đúng 2 tài khoản A và B**,
- hai lượt liên tiếp **đổi người** (A→B→A→B…),
- mọi khoảng cách giữa hai lượt liên tiếp ≤ `auction.shill.max-gap-seconds` (**15**), và
- **chỉ tính các lượt `source = MANUAL`**.

Lý do loại lượt AUTO: hai người cùng bật auto-bid sẽ trả xen kẽ mỗi 5–6,5 giây, đúng mẫu trên dù hoàn toàn hợp lệ. Lượt AUTO được bỏ qua khi xét chuỗi, không làm đứt chuỗi.

**Mức độ:**

| Severity | Điều kiện |
|---|---|
| `MEDIUM` | Thỏa định nghĩa trên |
| `HIGH` | Thỏa định nghĩa và A, B có cùng `clientIp` ở ít nhất một lượt, **hoặc** chuỗi kéo dài ≥ 2N lượt |

Chỉ **cảnh báo cho admin, không tự chặn bid**. Hai người đấu giá thật sự quyết liệt cũng tạo ra đúng mẫu này; admin là người quyết định.

### Entity `ShillAlert` (bảng `SHILL_ALERT`, index `(SESSION_ID, STATUS)`)

| Cột | Ghi chú |
|---|---|
| sessionId, sessionCode | |
| userAId, userBId | lưu `min, max` để cặp (A, B) và (B, A) là một |
| bidCount, minGapSeconds, avgGapSeconds, sameIp | |
| severity | `MEDIUM`, `HIGH` |
| status | `OPEN`, `CONFIRMED`, `DISMISSED` |
| firstBidAt, lastBidAt, reviewedBy, reviewedAt, note | |

### Xử lý (`ShillDetectionListener`, `@Async`)

1. Lấy `2N` lượt MANUAL mới nhất của phiên từ DB.
2. Đếm độ dài chuỗi thỏa điều kiện tính từ lượt mới nhất. Nếu < N thì dừng.
3. Tìm cảnh báo `OPEN` của cùng cặp và cùng phiên:
   - Có rồi: cập nhật.
   - Chưa có: tạo mới.
   - Đã `DISMISSED`: tạo mới khi chuỗi dài thêm ≥ N lượt sau `reviewedAt`.
4. Đẩy `ShillAlertVO` tới `/topic/admin/alerts` và lưu `Notification` `SHILL_ALERT` cho các ADMIN.

### API admin

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/admin/shill-alerts?status&sessionCode&page&size` | Danh sách cảnh báo |
| GET | `/api/admin/shill-alerts/{id}` | Chi tiết + các lượt bid của A và B (để vẽ timeline) |
| PUT | `/api/admin/shill-alerts/{id}` | `{status, note}` |
| POST | `/api/admin/users/{userId}/ban` | (tùy chọn) `BANNED` + `revokedToken(userId)` + tắt auto-bid của user |

**Cần test:**

- A, B xen kẽ 6 lượt tay, mỗi lượt cách 10 giây → có cảnh báo.
- Một lượt cách 20 giây → không có cảnh báo.
- Người thứ 3 chen vào → chuỗi bị cắt.
- Hai người auto-bid trả xen kẽ → **không** có cảnh báo.

---

## 10. Admin gửi thông điệp vào phòng bất kỳ

Hiện `pinnedNotice` trong `AuctionSessionServiceImplement` là một câu viết cứng, còn các lệnh admin (HALT/RESUME/KICK/CANCEL) đi qua `TcpControlServer` và gửi `RoomEventVO` tới `/topic/room/{code}`.

### Entity `RoomAnnouncement` (bảng `ROOM_ANNOUNCEMENT`, index `(SESSION_ID, CREATED_AT)`)

| Cột | Ghi chú |
|---|---|
| sessionId, sessionCode | |
| adminUserId | null nếu gửi từ admin-console qua TCP |
| content | String(1000), plain text: BE cắt khoảng trắng và giới hạn độ dài; FE render dạng text, không render HTML |
| pinned | Boolean: ghim lên đầu tab chat, thay `pinnedNotice` |
| level | `INFO`, `WARNING`, `IMPORTANT` |
| createdAt | |

### Luồng

1. **Gửi:** admin gửi bằng một trong hai cách.
   - REST: `POST /api/admin/auction/{code}/announcements` với body `{content, pinned, level, notifyWatchers}`.
   - Lệnh TCP mới `ANNOUNCE <roomId> <nội dung>` trong `TcpControlServer`, để admin-console dùng được ngay.
2. **Lưu:** `RoomAnnouncementService.post(...)` lưu bản ghi. Nếu `pinned` thì bỏ ghim các thông điệp cũ của phòng.
3. **Phát realtime:** gửi `RoomEventVO` với `event = "ANNOUNCEMENT"` tới `/topic/room/{code}`. Payload gồm `id`, `content`, `level`, `pinned` và `createdAt`. FE hiện tại đã subscribe kênh này nên nhận được ngay.
4. **Thông báo người theo dõi (tùy chọn):** nếu `notifyWatchers` thì gửi `ROOM_ANNOUNCEMENT` (mục 4) cho người theo dõi và người đã đăng ký.
5. **Chi tiết phòng:** `AuctionRoomDetailVO.pinnedNotice` lấy thông điệp đang ghim, nếu không có thì dùng câu mặc định. Thêm `announcements` (10 thông điệp gần nhất).

### API

| Method | Path | Quyền |
|---|---|---|
| POST | `/api/admin/auction/{code}/announcements` | ADMIN |
| DELETE | `/api/admin/auction/{code}/announcements/{id}` | ADMIN (gỡ thông điệp, phát `ANNOUNCEMENT_REMOVED`) |
| GET | `/api/v1/auction/{code}/announcements?page&size` | mọi người đã đăng nhập |

- Phiên đã `END` vẫn gửi được, để thông báo kết quả hoặc hướng dẫn nộp tiền.

---

## 11. Kênh WebSocket sau khi hoàn thành

| Kênh | Ai SUBSCRIBE | Nội dung |
|---|---|---|
| `/topic/auctions` | mọi người, kể cả khách vãng lai | giá / trạng thái cho dashboard (kèm `nextMinBid`) |
| `/topic/auction/{code}` | đã đăng nhập (VIEWER, BIDDER, ADMIN) | bid trong phòng (`bidTime`, `source`, `nextStep`, `nextMinBid`) |
| `/topic/room/{code}` | đã đăng nhập | JOIN/LEAVE/HALT/RESUME/CANCEL/**ANNOUNCEMENT** |
| `/topic/chat/{code}` | đã đăng nhập (chỉ BIDDER/ADMIN được gửi) | chat |
| `/user/queue/outbid` | chính user | cảnh báo vượt giá tức thì, auto-bid dừng |
| `/user/queue/notifications` | chính user | thông báo theo dõi / kết thúc / thông điệp admin |
| `/user/queue/room-role` | chính user | đổi vai trò sau khi đăng ký hoặc hủy |
| `/user/queue/errors` | chính user | lỗi đặt giá / chat |
| `/topic/admin/alerts` | **chỉ ADMIN** | cảnh báo thổi giá |

**`WebSocketAuthChannelInterceptor` cần sửa:**

- Cho phép SUBSCRIBE `/user/queue/**`.
- **Chặn `/topic/admin/**` với user không phải ADMIN.** Hiện user đã đăng nhập subscribe được mọi kênh.
- Kiểm tra quyền chat (`BIDDER`/`ADMIN`) ở bước SEND `/app/chat/**`, hoặc ngay trong controller.

---

## 12. Danh sách file

**Mới:**

```
entity/      AuctionWatch, Notification, NotificationLog, Wallet, WalletTransaction,
             AuctionRegistration, AutoBidConfig, ShillAlert, RoomAnnouncement
enumration/  NotificationTypeEnum, WalletTxTypeEnum, RegistrationStatusEnum, BidSourceEnum,
             RoomRoleEnum, AutoBidStopReasonEnum, ShillSeverityEnum, ShillAlertStatusEnum,
             AnnouncementLevelEnum
repository/  (một repository cho mỗi entity mới)
event/       BidPlacedEvent
event/listener/ BidBroadcastListener, OutbidAlertListener, AutoBidListener,
                WatchNotificationListener, ShillDetectionListener
service/     BidService, StepPriceCalculator, RoomRoleResolver, WalletService, WatchService,
             NotificationService, AutoBidService, AutoBidScheduler, AuctionHistoryService,
             PriceSeriesService, ShillDetectionService, RoomAnnouncementService (+ implement/*)
controller/  WatchController, NotificationController, WalletController, AutoBidController,
             MyBidHistoryController, AdminShillAlertController, AdminAnnouncementController
model/vo/    NotificationVO, OutbidAlertVO, WalletVO, WalletTransactionVO, MyAuctionHistoryVO,
             PriceSeriesVO, PricePointVO, AutoBidConfigVO, ShillAlertVO, RoomAnnouncementVO,
             BidResultVO, ErrorVO
model/dto/   TopupDTO, AutoBidDTO, AnnouncementDTO, ShillAlertReviewDTO
configuration/ AuctionProperties, AsyncConfig (executor + scheduler), ClientIpHandshakeInterceptor
```

**Sửa:**

```
controller/AuctionWebSocketController     → gọi BidService, bỏ mock, lỗi về /user/queue/errors, kiểm tra quyền chat
controller/AuctionSessionController       → /{code}/bids, /price-series, /register, /auto-bid, /announcements
controller/AdminAuctionController         → (xem mục 14: đổi prefix hoặc thêm phân quyền ADMIN)
service/AuctionBackgroundService          → STARTING_SOON/ENDING_SOON, trả/trừ cọc khi kết thúc, tắt auto-bid
service/implement/AdminAuctionServiceImplement → HALT/RESUME ghi status DB, CANCEL hoàn cọc thật
service/implement/AuctionSessionServiceImplement → nextStep/nextMinBid, myRole, pinnedNotice từ RoomAnnouncement
network/TcpControlServer                  → lệnh ANNOUNCE
repository/AuctionSessionRepository       → findBySessionCodeForUpdate, query trả sessionCode + isWatched
repository/BidHistoryRepository           → clearWinning, query lịch sử, top N theo phiên/nguồn
entity/BidHistory                         → index, previousPrice, stepApplied, clientIp, source
model/vo/AuctionSessionVO, AuctionRoomDetailVO, BidMessageVO, BidHistoryItemVO, RoomEventVO, AdminParticipantVO
configuration/WebSocketConfig             → HandshakeInterceptor lấy IP, userDestinationPrefix
configuration/security/WebSocketAuthChannelInterceptor → /user/queue/**, chặn /topic/admin/**
configuration/SecurityConfig              → permitAll GET công khai; bảo vệ /api/v1/admin/**
enumration/ErrorCode                      → mã lỗi mới
AuctionCoreServiceApplication             → @EnableAsync, @EnableScheduling (nếu chưa có)
```

---

## 13. Cấu hình (`application.yaml` + cập nhật `application.yml.example`)

```yaml
auction:
  step-tiers:                 # bước giá theo giá hiện tại; bậc cuối để upTo trống
    - { up-to: 99999999,  step: 5000000 }    # < 100tr
    - { up-to: 500000000, step: 10000000 }   # 100tr – 500tr
    - { up-to: ,          step: 20000000 }   # > 500tr
  room:
    viewer-can-chat: false
  notify:
    starting-soon-minutes: 15
    ending-soon-minutes: 5
    new-bid-throttle-seconds: 60
  wallet:
    initial-balance: 1000000000
    max-topup: 500000000
  auto-bid:
    base-delay-ms: 5000
    jitter-ms: 1500
  chart:
    max-points: 1000
  shill:
    min-alternating-bids: 6
    max-gap-seconds: 15
```

---

## 14. Lỗi hiện có cần sửa kèm

- **`AdminAuctionController`** dùng prefix `/api/v1/admin`, nhưng `SecurityConfig` chỉ bảo vệ `/api/admin/**`. Vì vậy **mọi user đã đăng nhập đều xem được danh sách phòng, người tham gia và metrics của admin**. Sửa bằng cách thêm `.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")`.
- **`TcpControlServer`** (cổng 9090) nhận các lệnh HALT/CANCEL/ANNOUNCE. Kiểm tra xem server chỉ lắng nghe trên `localhost` hoặc có xác thực chưa; nếu chưa, ai truy cập được cổng này đều có thể hủy phiên.
- **`AuctionSessionRepository.findFirstByNumberPlateId`:** một biển số có thể có nhiều phiên. Luồng bid nên luôn tìm phiên theo `sessionCode`, không theo biển số.

---

## 15. Thứ tự làm và mốc kiểm tra

| # | Việc | Phụ thuộc | Xong khi |
|---|---|---|---|
| 1 | Mục 0 + 1: `BidService`, `BidPlacedEvent`, `BidBroadcastListener`, bước giá động | — | Bid sai giá hoặc trạng thái bị từ chối; bid đồng thời không ghi đè nhau; `nextMinBid` đúng theo bậc |
| 2 | Mục 3 + 2: ví tiền ảo, đăng ký cọc, phân quyền BIDDER/VIEWER | 1 | Khách xem không đặt giá hay chat được; kết thúc phiên trừ/trả cọc đúng |
| 3 | Mục 5: cảnh báo vượt giá tức thì | 1 | Người bị vượt nhận `/user/queue/outbid` dưới 1 giây |
| 4 | Mục 7 + 8: lịch sử + biểu đồ | 1 | API trả đúng; biểu đồ cập nhật realtime |
| 5 | Mục 4: theo dõi + thông báo | 1, 3 | Đủ chuỗi STARTING_SOON → … → ENDED, không trùng |
| 6 | Mục 6: auto-bid ở server | 1, 2, 3 | Các kịch bản test ở mục 6 chạy đúng; FE không còn tự gửi bid |
| 7 | Mục 9: thổi giá | 1, 6 (cần `source`) | Các kịch bản test ở mục 9 chạy đúng |
| 8 | Mục 10: thông điệp admin | độc lập, có thể làm song song từ đầu | Admin gửi từ REST hoặc TCP, phòng nhận ngay; thông điệp ghim thay `pinnedNotice` |
| — | Mục 14: lỗi phân quyền admin | độc lập | User thường gọi `/api/v1/admin/**` nhận 403 |
