package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.model.vo.RoomParticipantVO;

import java.util.List;

/**
 * Quản lý danh sách người dùng đang trực tuyến (live presence) trong từng phòng đấu giá
 * và đồng bộ số lượng người tham gia duy nhất (unique user) trực tiếp xuống bảng AUCTION_SESSION.
 */
public interface RoomPresenceService {

    /**
     * Ghi nhận 1 kết nối WebSocket của người dùng bước vào phòng.
     * Nếu 1 người mở nhiều tab / gửi JOIN nhiều lần cùng phòng, chỉ tính là 1 người duy nhất.
     */
    void joinRoom(String rawRoomId, Long userId, String displayName, String wsSessionId);

    /**
     * Ghi nhận 1 kết nối WebSocket của người dùng rời khỏi phòng.
     * Chỉ giảm số người tham gia và broadcast LEAVE khi tất cả tab của người dùng ở phòng đó đã rời đi.
     */
    void leaveRoom(String rawRoomId, Long userId, String wsSessionId);

    /**
     * Dọn dẹp toàn bộ các phòng mà kết nối WebSocket này từng tham gia khi client đóng tab / mất kết nối.
     */
    void handleDisconnect(String wsSessionId);

    /**
     * Lấy số người tham gia duy nhất đang trực tuyến trong phòng.
     */
    int getParticipantCount(String roomCode);

    /**
     * Lấy danh sách người dùng duy nhất đang trực tuyến trong phòng.
     */
    List<RoomParticipantVO> getOnlineParticipants(String roomCode);

    /**
     * Kiểm tra user có đang mở phòng này hay không.
     */
    boolean isUserOnline(String roomCode, Long userId);

    /**
     * Cập nhật vai trò (BIDDER/VIEWER/ADMIN) của user trong danh sách trực tuyến mà không đổi số lượng.
     */
    void refreshUserRole(Long userId, String roomCode, String newRole);

    /**
     * Cưỡng chế kick người dùng ra khỏi phòng: xóa mọi kết nối WS của user ở phòng này,
     * đồng bộ giảm participant_count trên DB, đưa vào danh sách bị kick của phòng và broadcast sự kiện KICK.
     *
     * @return true nếu user đang trực tuyến trong phòng tại thời điểm bị kick
     */
    boolean kickUser(String rawRoomId, Long userId, String displayName);

    /**
     * Kiểm tra user có đang bị chặn (đã bị kick) khỏi phòng này hay không.
     */
    boolean isUserKicked(String rawRoomId, Long userId);

    /**
     * Gỡ chặn kick cho user khỏi phòng (dùng khi quản trị viên mở lại quyền hoặc trong test).
     *
     * @return true nếu user trước đó đang nằm trong danh sách bị kick của phòng
     */
    boolean unkickUser(String rawRoomId, Long userId);

    /**
     * Lấy danh sách mã phòng (sessionCode) mà user đang bị chặn (kick).
     */
    List<String> getKickedRoomsOfUser(Long userId);

    /**
     * Lấy danh sách mã phòng (sessionCode) mà user đang trực tuyến.
     */
    List<String> getRoomsOfUser(Long userId);
}
