package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
import com.ptit.bigdata.coreservice.model.vo.BidMessageVO;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import com.ptit.bigdata.coreservice.model.vo.RoomParticipantVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.service.RoomPresenceService;
import com.ptit.bigdata.coreservice.service.RoomRoleResolver;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomPresenceServiceImpl implements RoomPresenceService {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final AuctionSessionRepository auctionSessionRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final RoomRoleResolver roomRoleResolver;
    private final SimpMessagingTemplate messagingTemplate;

    /** Khóa đồng bộ theo từng roomCode để đảm bảo thứ tự ghi DB và đếm không bị race condition. */
    private final ConcurrentHashMap<String, Object> roomLocks = new ConcurrentHashMap<>();

    /** roomCode -> (userKey -> OnlineUserEntry). Inner map dùng LinkedHashMap được bảo vệ bởi lockFor(roomCode). */
    private final ConcurrentHashMap<String, Map<String, OnlineUserEntry>> roomUsers = new ConcurrentHashMap<>();

    /** wsSessionId -> tập roomCode mà kết nối WS này đang tham gia. */
    private final ConcurrentHashMap<String, Set<String>> sessionToRooms = new ConcurrentHashMap<>();

    /** wsSessionId -> userKey đã gắn với kết nối WS này (dùng khi disconnect không còn Principal). */
    private final ConcurrentHashMap<String, String> sessionToUserKey = new ConcurrentHashMap<>();

    /** Cache ánh xạ roomCode -> plateNumber để gửi event PARTICIPANT_UPDATE lên /topic/auctions không cần query lại. */
    private final ConcurrentHashMap<String, String> roomPlateCache = new ConcurrentHashMap<>();

    /** roomCode -> tập userId đã bị quản trị viên kick khỏi phòng (chặn vào lại / đặt giá / chat). */
    private final ConcurrentHashMap<String, Set<Long>> kickedUsersByRoom = new ConcurrentHashMap<>();

    private record CanonicalRoom(String roomCode, String plateNumber) {}

    private static final class OnlineUserEntry {
        final Long userId;
        String userName;
        String role;
        final Set<String> wsSessionIds = new LinkedHashSet<>();

        OnlineUserEntry(Long userId, String userName, String role) {
            this.userId = userId;
            this.userName = userName;
            this.role = role;
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            int resetRows = auctionSessionRepository.resetAllParticipantCounts();
            // Trường hợp có client reconnect trong tích tắc lúc boot, đồng bộ lại số người thực tế cho các phòng đó
            for (String roomCode : roomUsers.keySet()) {
                synchronized (lockFor(roomCode)) {
                    Map<String, OnlineUserEntry> users = roomUsers.get(roomCode);
                    int count = users != null ? users.size() : 0;
                    if (count > 0) {
                        persistParticipantCount(roomCode, count);
                    }
                }
            }
            log.info("[PRESENCE] Đã đồng bộ reset participant_count = 0 cho {} phiên trong DB khi khởi động", resetRows);
        } catch (Exception e) {
            log.warn("[PRESENCE] Không thể reset participant_count khi khởi động: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void onShutdown() {
        try {
            if (!roomUsers.isEmpty()) {
                auctionSessionRepository.resetAllParticipantCounts();
                log.info("[PRESENCE] Đã reset participant_count = 0 khi tắt server");
            }
        } catch (Exception e) {
            log.debug("[PRESENCE] Bỏ qua lỗi reset participant_count khi tắt server: {}", e.getMessage());
        }
    }

    @EventListener
    public void onSessionDisconnect(SessionDisconnectEvent event) {
        if (event != null && event.getSessionId() != null) {
            handleDisconnect(event.getSessionId());
        }
    }

    @Override
    public void joinRoom(String rawRoomId, Long userId, String displayName, String wsSessionId) {
        if (rawRoomId == null || rawRoomId.isBlank()) {
            return;
        }
        CanonicalRoom canonical = resolveCanonicalRoom(rawRoomId);
        String roomCode = canonical.roomCode();

        // Chặn user đã bị quản trị viên kick khỏi phòng quay lại ghi nhận presence / tăng participant_count
        if (userId != null && isKickedInternal(roomCode, userId)) {
            log.warn("[PRESENCE] Chặn userId={} vào lại phòng {} vì đã bị quản trị viên kick", userId, roomCode);
            return;
        }

        String safeName = (displayName != null && !displayName.isBlank()) ? displayName.trim() : "Người tham gia";
        String safeSessionId = (wsSessionId != null && !wsSessionId.isBlank())
                ? wsSessionId
                : "DIRECT-" + (userId != null ? userId : safeName);
        String userKey = buildUserKey(userId, safeSessionId);
        String role = resolveRoleName(userId, roomCode);

        boolean newlyJoined;
        int participantCount;
        List<RoomParticipantVO> snapshot;

        synchronized (lockFor(roomCode)) {
            Map<String, OnlineUserEntry> users = roomUsers.computeIfAbsent(roomCode, k -> new LinkedHashMap<>());
            OnlineUserEntry existing = users.get(userKey);
            if (existing == null) {
                existing = new OnlineUserEntry(userId, safeName, role);
                existing.wsSessionIds.add(safeSessionId);
                users.put(userKey, existing);
                newlyJoined = true;
            } else {
                existing.userName = safeName;
                existing.role = role;
                existing.wsSessionIds.add(safeSessionId);
                newlyJoined = false;
            }

            sessionToUserKey.put(safeSessionId, userKey);
            sessionToRooms.computeIfAbsent(safeSessionId, k -> ConcurrentHashMap.newKeySet()).add(roomCode);

            participantCount = users.size();
            snapshot = buildSnapshot(users);

            if (newlyJoined) {
                persistParticipantCount(roomCode, participantCount);
            }
        }

        if (newlyJoined) {
            log.info("[PRESENCE] {} (userId={}, ws={}) vào phòng {} -> {} người tham gia duy nhất",
                    safeName, userId, safeSessionId, roomCode, participantCount);
            broadcastRoomEvent(roomCode, "JOIN", userId, safeName, role,
                    safeName + " đã tham gia phòng", participantCount, snapshot);
            broadcastDashboardCount(roomCode, canonical.plateNumber(), participantCount);
        } else {
            log.debug("[PRESENCE] {} (userId={}, ws={}) đã có mặt trong phòng {}, giữ nguyên {} người tham gia",
                    safeName, userId, safeSessionId, roomCode, participantCount);
        }
    }

    @Override
    public void leaveRoom(String rawRoomId, Long userId, String wsSessionId) {
        if (rawRoomId == null || rawRoomId.isBlank()) {
            return;
        }
        CanonicalRoom canonical = resolveCanonicalRoom(rawRoomId);
        String roomCode = canonical.roomCode();
        String safeSessionId = (wsSessionId != null && !wsSessionId.isBlank())
                ? wsSessionId
                : (userId != null ? "DIRECT-" + userId : null);
        String userKey = (userId != null)
                ? "USER:" + userId
                : (safeSessionId != null ? sessionToUserKey.get(safeSessionId) : null);

        if (userKey == null && safeSessionId == null) {
            return;
        }

        removeSessionFromRoom(roomCode, canonical.plateNumber(), userKey, safeSessionId);
    }

    @Override
    public void handleDisconnect(String wsSessionId) {
        if (wsSessionId == null || wsSessionId.isBlank()) {
            return;
        }
        String userKey = sessionToUserKey.remove(wsSessionId);
        Set<String> rooms = sessionToRooms.remove(wsSessionId);
        if (rooms == null || rooms.isEmpty()) {
            return;
        }
        for (String roomCode : rooms) {
            String plateNumber = roomPlateCache.get(roomCode);
            removeSessionFromRoom(roomCode, plateNumber, userKey, wsSessionId);
        }
    }

    private void removeSessionFromRoom(String roomCode, String plateNumber, String userKey, String wsSessionId) {
        boolean fullyLeft = false;
        Long leftUserId = null;
        String leftUserName = null;
        String leftRole = null;
        int participantCount = 0;
        List<RoomParticipantVO> snapshot = Collections.emptyList();

        synchronized (lockFor(roomCode)) {
            Map<String, OnlineUserEntry> users = roomUsers.get(roomCode);
            if (users == null || users.isEmpty()) {
                return;
            }

            if (wsSessionId != null) {
                Set<String> roomsForSession = sessionToRooms.get(wsSessionId);
                if (roomsForSession != null) {
                    roomsForSession.remove(roomCode);
                    if (roomsForSession.isEmpty()) {
                        sessionToRooms.remove(wsSessionId);
                    }
                }
            }

            String targetKey = userKey;
            if (targetKey == null && wsSessionId != null) {
                for (Map.Entry<String, OnlineUserEntry> entry : users.entrySet()) {
                    if (entry.getValue().wsSessionIds.contains(wsSessionId)) {
                        targetKey = entry.getKey();
                        break;
                    }
                }
            }
            if (targetKey == null) {
                return;
            }

            OnlineUserEntry entry = users.get(targetKey);
            if (entry == null) {
                return;
            }

            if (wsSessionId != null) {
                entry.wsSessionIds.remove(wsSessionId);
            } else {
                entry.wsSessionIds.clear();
            }

            if (entry.wsSessionIds.isEmpty()) {
                users.remove(targetKey);
                fullyLeft = true;
                leftUserId = entry.userId;
                leftUserName = entry.userName;
                leftRole = entry.role;
            }

            participantCount = users.size();
            if (users.isEmpty()) {
                roomUsers.remove(roomCode);
            }
            snapshot = buildSnapshot(users);

            if (fullyLeft) {
                persistParticipantCount(roomCode, participantCount);
            }
        }

        if (fullyLeft) {
            String name = leftUserName != null ? leftUserName : "Người tham gia";
            log.info("[PRESENCE] {} (userId={}, ws={}) rời phòng {} -> còn {} người tham gia duy nhất",
                    name, leftUserId, wsSessionId, roomCode, participantCount);
            broadcastRoomEvent(roomCode, "LEAVE", leftUserId, name, leftRole,
                    name + " đã rời phòng", participantCount, snapshot);
            broadcastDashboardCount(roomCode, plateNumber != null ? plateNumber : roomPlateCache.get(roomCode), participantCount);
        }
    }

    @Override
    public int getParticipantCount(String roomCode) {
        if (roomCode == null || roomCode.isBlank()) {
            return 0;
        }
        String canonicalCode = resolveCanonicalCodeFast(roomCode);
        synchronized (lockFor(canonicalCode)) {
            Map<String, OnlineUserEntry> users = roomUsers.get(canonicalCode);
            return users != null ? users.size() : 0;
        }
    }

    @Override
    public List<RoomParticipantVO> getOnlineParticipants(String roomCode) {
        if (roomCode == null || roomCode.isBlank()) {
            return Collections.emptyList();
        }
        String canonicalCode = resolveCanonicalCodeFast(roomCode);
        synchronized (lockFor(canonicalCode)) {
            Map<String, OnlineUserEntry> users = roomUsers.get(canonicalCode);
            if (users == null || users.isEmpty()) {
                return Collections.emptyList();
            }
            return buildSnapshot(users);
        }
    }

    @Override
    public boolean isUserOnline(String roomCode, Long userId) {
        if (roomCode == null || roomCode.isBlank() || userId == null) {
            return false;
        }
        String canonicalCode = resolveCanonicalCodeFast(roomCode);
        synchronized (lockFor(canonicalCode)) {
            Map<String, OnlineUserEntry> users = roomUsers.get(canonicalCode);
            return users != null && users.containsKey("USER:" + userId);
        }
    }

    @Override
    public void refreshUserRole(Long userId, String roomCode, String newRole) {
        if (userId == null || roomCode == null || roomCode.isBlank() || newRole == null) {
            return;
        }
        String canonicalCode = resolveCanonicalCodeFast(roomCode);
        synchronized (lockFor(canonicalCode)) {
            Map<String, OnlineUserEntry> users = roomUsers.get(canonicalCode);
            if (users != null) {
                OnlineUserEntry entry = users.get("USER:" + userId);
                if (entry != null) {
                    entry.role = newRole;
                }
            }
        }
    }

    @Override
    public boolean kickUser(String rawRoomId, Long userId, String displayName) {
        if (rawRoomId == null || rawRoomId.isBlank() || userId == null) {
            return false;
        }
        CanonicalRoom canonical = resolveCanonicalRoom(rawRoomId);
        String roomCode = canonical.roomCode();
        String userKey = "USER:" + userId;

        kickedUsersByRoom.computeIfAbsent(roomCode, k -> ConcurrentHashMap.newKeySet()).add(userId);

        boolean wasOnline = false;
        String resolvedName = (displayName != null && !displayName.isBlank()) ? displayName.trim() : "Tài khoản #" + userId;
        String resolvedRole = null;
        int participantCount;
        List<RoomParticipantVO> snapshot;

        synchronized (lockFor(roomCode)) {
            Map<String, OnlineUserEntry> users = roomUsers.get(roomCode);
            if (users != null) {
                OnlineUserEntry removed = users.remove(userKey);
                if (removed != null) {
                    wasOnline = true;
                    if (removed.userName != null && !removed.userName.isBlank()) {
                        resolvedName = removed.userName;
                    }
                    resolvedRole = removed.role;
                    for (String wsId : removed.wsSessionIds) {
                        Set<String> roomsForSession = sessionToRooms.get(wsId);
                        if (roomsForSession != null) {
                            roomsForSession.remove(roomCode);
                            if (roomsForSession.isEmpty()) {
                                sessionToRooms.remove(wsId);
                            }
                        }
                    }
                }
                participantCount = users.size();
                if (users.isEmpty()) {
                    roomUsers.remove(roomCode);
                }
                snapshot = buildSnapshot(users);
            } else {
                participantCount = 0;
                snapshot = Collections.emptyList();
            }

            // Luôn đồng bộ lại participant_count chính xác xuống DB ngay lập tức
            persistParticipantCount(roomCode, participantCount);
        }

        log.warn("[PRESENCE-KICK] Quản trị viên đã kick {} (userId={}) khỏi phòng {} (wasOnline={}, còn {} người)",
                resolvedName, userId, roomCode, wasOnline, participantCount);

        broadcastRoomEvent(
                roomCode,
                "KICK",
                userId,
                resolvedName,
                resolvedRole,
                resolvedName + " đã bị Quản trị viên ngắt kết nối khỏi phòng đấu giá.",
                participantCount,
                snapshot
        );
        broadcastDashboardCount(
                roomCode,
                canonical.plateNumber() != null ? canonical.plateNumber() : roomPlateCache.get(roomCode),
                participantCount
        );
        return wasOnline;
    }

    @Override
    public boolean isUserKicked(String rawRoomId, Long userId) {
        if (rawRoomId == null || rawRoomId.isBlank() || userId == null) {
            return false;
        }
        String canonicalCode = resolveCanonicalCodeFast(rawRoomId);
        return isKickedInternal(canonicalCode, userId);
    }

    @Override
    public boolean unkickUser(String rawRoomId, Long userId) {
        if (rawRoomId == null || rawRoomId.isBlank() || userId == null) {
            return false;
        }
        String canonicalCode = resolveCanonicalCodeFast(rawRoomId);
        Set<Long> kicked = kickedUsersByRoom.get(canonicalCode);
        if (kicked != null) {
            boolean removed = kicked.remove(userId);
            if (kicked.isEmpty()) {
                kickedUsersByRoom.remove(canonicalCode);
            }
            if (removed) {
                log.info("[PRESENCE-UNKICK] Đã mở khóa quyền vào lại phòng {} cho userId={}", canonicalCode, userId);
            }
            return removed;
        }
        return false;
    }

    @Override
    public List<String> getKickedRoomsOfUser(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        List<String> rooms = new ArrayList<>();
        for (Map.Entry<String, Set<Long>> entry : kickedUsersByRoom.entrySet()) {
            if (entry.getValue() != null && entry.getValue().contains(userId)) {
                rooms.add(entry.getKey());
            }
        }
        return rooms;
    }

    @Override
    public List<String> getRoomsOfUser(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        String userKey = "USER:" + userId;
        List<String> rooms = new ArrayList<>();
        for (String roomCode : roomUsers.keySet()) {
            synchronized (lockFor(roomCode)) {
                Map<String, OnlineUserEntry> users = roomUsers.get(roomCode);
                if (users != null && users.containsKey(userKey)) {
                    rooms.add(roomCode);
                }
            }
        }
        return rooms;
    }

    private boolean isKickedInternal(String canonicalRoomCode, Long userId) {
        Set<Long> kicked = kickedUsersByRoom.get(canonicalRoomCode);
        return kicked != null && kicked.contains(userId);
    }

    private void persistParticipantCount(String roomCode, int count) {
        try {
            auctionSessionRepository.updateParticipantCountBySessionCode(roomCode, (long) count, LocalDateTime.now());
        } catch (Exception e) {
            log.error("[PRESENCE] Lỗi cập nhật participant_count={} cho phòng {} vào DB: {}", count, roomCode, e.getMessage());
        }
    }

    private void broadcastRoomEvent(
            String roomCode,
            String eventType,
            Long userId,
            String userName,
            String role,
            String message,
            int participantCount,
            List<RoomParticipantVO> snapshot
    ) {
        if (messagingTemplate == null) {
            return;
        }
        RoomEventVO payload = RoomEventVO.builder()
                .roomId(roomCode)
                .event(eventType)
                .userId(userId)
                .userName(userName)
                .role(role)
                .message(message)
                .participantCount(participantCount)
                .participants(snapshot)
                .timestamp(TIME_FMT.format(LocalTime.now()))
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + roomCode, payload);
    }

    private void broadcastDashboardCount(String roomCode, String plateNumber, int participantCount) {
        if (messagingTemplate == null) {
            return;
        }
        BidMessageVO payload = BidMessageVO.builder()
                .roomId(roomCode)
                .plateNumber(plateNumber)
                .participantCount(participantCount)
                .type("PARTICIPANT_UPDATE")
                .timestamp(TIME_FMT.format(LocalTime.now()))
                .build();
        messagingTemplate.convertAndSend("/topic/auctions", payload);
    }

    private CanonicalRoom resolveCanonicalRoom(String rawRoomId) {
        String trimmed = rawRoomId.trim();
        String cachedPlate = roomPlateCache.get(trimmed);
        if (cachedPlate != null) {
            return new CanonicalRoom(trimmed, cachedPlate);
        }

        Optional<AuctionSession> byCode = auctionSessionRepository.findBySessionCode(trimmed);
        if (byCode.isPresent()) {
            AuctionSession session = byCode.get();
            String plate = resolvePlateNumber(session);
            if (plate != null) {
                roomPlateCache.put(session.getSessionCode(), plate);
            }
            return new CanonicalRoom(session.getSessionCode(), plate);
        }

        Optional<NumberPlate> byPlate = numberPlateRepository.findByPlateNumber(trimmed);
        if (byPlate.isPresent()) {
            Optional<AuctionSession> byPlateSession = auctionSessionRepository.findFirstByNumberPlateId(byPlate.get().getId());
            if (byPlateSession.isPresent()) {
                String canonicalCode = byPlateSession.get().getSessionCode();
                String plate = byPlate.get().getPlateNumber();
                roomPlateCache.put(canonicalCode, plate);
                return new CanonicalRoom(canonicalCode, plate);
            }
        }

        return new CanonicalRoom(trimmed, null);
    }

    private String resolveCanonicalCodeFast(String rawRoomId) {
        String trimmed = rawRoomId.trim();
        if (roomUsers.containsKey(trimmed) || roomPlateCache.containsKey(trimmed)) {
            return trimmed;
        }
        return resolveCanonicalRoom(trimmed).roomCode();
    }

    private String resolvePlateNumber(AuctionSession session) {
        if (session == null || session.getNumberPlateId() == null) {
            return null;
        }
        return numberPlateRepository.findById(session.getNumberPlateId())
                .map(NumberPlate::getPlateNumber)
                .orElse(null);
    }

    private String resolveRoleName(Long userId, String roomCode) {
        if (userId == null) {
            return RoomRoleEnum.VIEWER.name();
        }
        try {
            RoomRoleEnum resolved = roomRoleResolver.resolveBySessionCode(userId, roomCode);
            return resolved != null ? resolved.name() : RoomRoleEnum.VIEWER.name();
        } catch (Exception e) {
            return RoomRoleEnum.VIEWER.name();
        }
    }

    private String buildUserKey(Long userId, String wsSessionId) {
        return userId != null ? "USER:" + userId : "ANON:" + wsSessionId;
    }

    private Object lockFor(String roomCode) {
        return roomLocks.computeIfAbsent(roomCode, k -> new Object());
    }

    private List<RoomParticipantVO> buildSnapshot(Map<String, OnlineUserEntry> users) {
        if (users == null || users.isEmpty()) {
            return Collections.emptyList();
        }
        List<RoomParticipantVO> list = new ArrayList<>(users.size());
        for (OnlineUserEntry entry : users.values()) {
            list.add(RoomParticipantVO.builder()
                    .userId(entry.userId)
                    .userName(entry.userName)
                    .role(entry.role)
                    .online(true)
                    .build());
        }
        return Collections.unmodifiableList(list);
    }
}
