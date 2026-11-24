# Các thay đổi đã thực hiện trong dự án

## Trạng thái phiên đấu giá

- Quy ước `COMPLETED` cho phiên kết thúc có người thắng; `END` cho phiên kết thúc không có người thắng.
- Đồng bộ quy ước này trong backend, API, frontend, lịch sử đấu giá, dữ liệu mẫu và tài liệu.
- Bỏ `baseUrl` khỏi `source/client/jnp.fe/tsconfig.app.json`; giữ các alias trong `paths`.

## Danh sách người tham gia trong Admin Console

- Bỏ cột **Đặt giá** và field `bidsInLast5s` khỏi UI, model và API vì số liệu trước đó đếm toàn phiên, không phải số yêu cầu trong 5 giây.
- Bỏ cột **RTT** và field RTT khỏi participant response vì dữ liệu này không đại diện cho RTT của từng người.
- Bỏ trạng thái `CHECK_NEEDED`; trạng thái kết nối của người tham gia dựa trên presence `CONNECTED` hoặc `OFFLINE`.
- Hiển thị tất cả chữ trong hàng màu xanh dương khi đã kết nối và crimson khi mất kết nối.
- Bỏ nền tô màu của phần thân bảng; giữ kiểu hiển thị hiện tại của header.
- Các cột còn lại: ID tài khoản, Họ và tên, Kết nối, Giá cuối (VNĐ).

File liên quan:

- `source/server/admin-console/src/main/java/com/auction/model/ParticipantInfo.java`
- `source/server/admin-console/src/main/java/com/auction/model/ConnectionState.java`
- `source/server/admin-console/src/main/java/com/auction/net/udp/UdpAdminGateway.java`
- `source/server/admin-console/src/main/java/com/auction/ui/panels/control/participant/ParticipantRenderer.java`
- `source/server/admin-console/src/main/java/com/auction/ui/panels/control/participant/ParticipantsPanel.java`
- `source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/model/vo/AdminParticipantVO.java`
- `source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/service/implement/AdminAuctionServiceImplement.java`

## Chọn phòng và tải dữ liệu điều khiển phiên

- Khi đổi phòng, thông tin phòng cũ được xóa ngay; dữ liệu trả về muộn của phòng cũ không được áp dụng cho phòng mới.
- Chia sẻ thông tin `RoomInfo` đang chọn để trang Điều khiển phiên hiển thị thông tin phòng ngay, không đợi tải lại danh sách phòng.
- Double-click một phòng trong Giám sát đấu giá sẽ chọn phòng đó và mở Điều khiển phiên.
- Tải danh sách người tham gia độc lập với request danh sách phòng; dùng chung request đang chạy theo mã phòng và cache dữ liệu theo phòng.
- Trong lúc tải, nhãn trạng thái hiển thị **Đang tải danh sách...** hoặc **Đang cập nhật**.

File liên quan:

- `source/server/admin-console/src/main/java/com/auction/ui/common/RoomSelection.java`
- `source/server/admin-console/src/main/java/com/auction/ui/panels/monitoring/rooms/RoomTablePanel.java`
- `source/server/admin-console/src/main/java/com/auction/ui/panels/monitoring/MonitoringPanel.java`
- `source/server/admin-console/src/main/java/com/auction/ui/panels/control/SessionControlPanel.java`
- `source/server/admin-console/src/main/java/com/auction/ui/panels/control/participant/ParticipantsPanel.java`
- `source/server/admin-console/src/main/java/com/auction/ui/AdminConsoleUI.java`

## Thẻ thông tin phiên

- Mức cọc hiển thị lấy từ `auction_session.deposit_amount`, truyền qua `AdminRoomVO`, `RoomInfo` và API admin. Nếu response không có giá trị thì hiển thị **Chưa có dữ liệu**.
- Bỏ dòng **Bước giá 5.000.000** và hằng số giao diện chỉ phục vụ dòng này.

File liên quan:

- `source/server/admin-console/src/main/java/com/auction/model/RoomInfo.java`
- `source/server/admin-console/src/main/java/com/auction/ui/panels/control/session/SessionInfoCard.java`
- `source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/model/vo/AdminRoomVO.java`
- `source/server/auction-core-service/src/main/java/com/ptit/bigdata/coreservice/service/implement/AdminAuctionServiceImplement.java`
