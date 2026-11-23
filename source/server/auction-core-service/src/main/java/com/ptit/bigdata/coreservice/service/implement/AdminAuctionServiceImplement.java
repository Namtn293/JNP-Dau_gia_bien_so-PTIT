package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.entity.Province;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.AdminCommandResultVO;
import com.ptit.bigdata.coreservice.model.vo.AdminParticipantVO;
import com.ptit.bigdata.coreservice.model.vo.AdminRoomVO;
import com.ptit.bigdata.coreservice.model.vo.AdminServerMetricsVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.AuctionWatchRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.repository.NotificationLogRepository;
import com.ptit.bigdata.coreservice.repository.NotificationRepository;
import com.ptit.bigdata.coreservice.repository.ProvinceRepository;
import com.ptit.bigdata.coreservice.repository.RoomAnnouncementRepository;
import com.ptit.bigdata.coreservice.repository.RoomChatMessageRepository;
import com.ptit.bigdata.coreservice.repository.ShillAlertRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.repository.WalletTransactionRepository;
import com.ptit.bigdata.coreservice.service.AdminAuctionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuctionServiceImplement implements AdminAuctionService {

    private final AuctionSessionRepository auctionSessionRepository;
    private final AuctionWatchRepository auctionWatchRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final NotificationRepository notificationRepository;
    private final ProvinceRepository provinceRepository;
    private final RoomAnnouncementRepository roomAnnouncementRepository;
    private final RoomChatMessageRepository roomChatMessageRepository;
    private final ShillAlertRepository shillAlertRepository;
    private final BidHistoryRepository bidHistoryRepository;
    private final UserInfoRepository userInfoRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final com.ptit.bigdata.coreservice.core.auth.repository.UserRepository userRepository;
    private final com.ptit.bigdata.coreservice.service.WalletService walletService;
    private final com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository auctionRegistrationRepository;
    private final com.ptit.bigdata.coreservice.service.RoomRoleResolver roomRoleResolver;
    private final Set<String> pausedRooms = java.util.concurrent.ConcurrentHashMap.newKeySet();

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Autowired(required = false)
    private com.ptit.bigdata.coreservice.service.RoomPresenceService roomPresenceService;

    @Autowired(required = false)
    private com.ptit.bigdata.coreservice.repository.AutoBidConfigRepository autoBidConfigRepository;

    @Override
    public List<AdminRoomVO> getRooms() {
        List<AuctionSession> sessions = auctionSessionRepository.findAll();
        if (sessions.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDateTime now = LocalDateTime.now();
        sessions.sort(Comparator
                .comparingInt(this::roomSortPriority)
                .thenComparing(session -> session.getStatus() == AuctionStatusEnum.LIVE
                                ? session.getEndTime()
                                : session.getStartTime(),
                        Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(AuctionSession::getSessionCode, Comparator.nullsLast(Comparator.naturalOrder())));
        List<AdminRoomVO> result = new ArrayList<>(sessions.size());

        // Load related plate/province rows in batches instead of issuing queries per room.
        Set<Long> plateIds = new HashSet<>();
        for (AuctionSession session : sessions) {
            if (session.getNumberPlateId() != null) {
                plateIds.add(session.getNumberPlateId());
            }
        }
        Map<Long, NumberPlate> plateMap = new HashMap<>();
        for (NumberPlate plate : numberPlateRepository.findAllById(plateIds)) {
            plateMap.put(plate.getId(), plate);
        }

        Set<Long> provinceIds = new HashSet<>();
        for (NumberPlate plate : plateMap.values()) {
            if (plate.getProvinceId() != null) {
                provinceIds.add(plate.getProvinceId());
            }
        }
        Map<Long, Province> provinceMap = new HashMap<>();
        for (Province province : provinceRepository.findAllById(provinceIds)) {
            provinceMap.put(province.getId(), province);
        }

        for (AuctionSession session : sessions) {
            NumberPlate plate = null;
            Province province = null;

            if (session.getNumberPlateId() != null) {
                plate = plateMap.get(session.getNumberPlateId());
                if (plate != null && plate.getProvinceId() != null) {
                    province = provinceMap.get(plate.getProvinceId());
                }
            }

            String plateNumber = plate != null ? plate.getPlateNumber() : extractPlateFromTitle(session.getTitle());
            String regionName = province != null ? province.getName() : "Toàn quốc";

            // Determine status and remaining time
            String status = mapStatus(session, now);
            String remaining = calculateRemaining(session, now);

            long currentPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
            int participantCount = roomPresenceService != null
                    ? roomPresenceService.getParticipantCount(session.getSessionCode())
                    : session.getParticipantCount() != null ? session.getParticipantCount().intValue() : 0;

            result.add(AdminRoomVO.builder()
                    .id(session.getSessionCode())
                    .plate(plateNumber)
                    .region(regionName)
                    .status(status)
                    .participantCount(participantCount)
                    .currentPrice(currentPrice)
                    .remainingLabel(remaining)
                    .build());
        }

        return result;
    }

    @Override
    public List<AdminParticipantVO> getParticipants(String roomId) {
        Optional<AuctionSession> sessionOpt = auctionSessionRepository.findBySessionCode(roomId);
        if (sessionOpt.isPresent()) {
            Long sessionId = sessionOpt.get().getId();
            List<BidHistory> bids = bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(sessionId);
            List<com.ptit.bigdata.coreservice.entity.AuctionRegistration> registrations =
                    auctionRegistrationRepository.findBySessionId(sessionId);

            Set<Long> allUserIds = new LinkedHashSet<>();
            Map<Long, String> onlineNames = new HashMap<>();
            if (roomPresenceService != null) {
                for (var onlineUser : roomPresenceService.getOnlineParticipants(sessionOpt.get().getSessionCode())) {
                    if (onlineUser.getUserId() != null) {
                        allUserIds.add(onlineUser.getUserId());
                        if (onlineUser.getUserName() != null) {
                            onlineNames.put(onlineUser.getUserId(), onlineUser.getUserName());
                        }
                    }
                }
            }
            for (com.ptit.bigdata.coreservice.entity.AuctionRegistration reg : registrations) {
                allUserIds.add(reg.getUserId());
            }
            for (BidHistory b : bids) {
                allUserIds.add(b.getUserID());
            }

            if (!allUserIds.isEmpty()) {
                Map<Long, List<BidHistory>> userBids = new LinkedHashMap<>();
                for (BidHistory b : bids) {
                    userBids.computeIfAbsent(b.getUserID(), k -> new ArrayList<>()).add(b);
                }

                String canonicalCode = sessionOpt.get().getSessionCode();
                List<AdminParticipantVO> list = new ArrayList<>();
                for (Long userId : allUserIds) {
                    List<BidHistory> hist = userBids.getOrDefault(userId, Collections.emptyList());
                    String name = onlineNames.getOrDefault(userId, resolveDisplayName(userId));
                    long maxBid = hist.stream().mapToLong(BidHistory::getBidAmount).max().orElse(0L);
                    String role = roomRoleResolver.resolve(userId, sessionId).name();
                    boolean isOnline = roomPresenceService != null && roomPresenceService.isUserOnline(canonicalCode, userId);

                    list.add(AdminParticipantVO.builder()
                            .userId("U-" + String.format("%04d", userId))
                            .fullName(name)
                            .connection(isOnline ? "CONNECTED" : "OFFLINE")
                            .bidsInLast5s(hist.size())
                            .lastPrice(maxBid)
                            .rttMs(32)
                            .role(role)
                            .build());
                }
                return list;
            }
        }

        // No participants yet
        return Collections.emptyList();
    }

    @Override
    public AdminServerMetricsVO getMetrics() {
        double cpuPercent = 38.0;
        int cpuCores = Runtime.getRuntime().availableProcessors();
        double ramUsedGb = 9.8;
        double ramTotalGb = 16.0;

        try {
            com.sun.management.OperatingSystemMXBean osBean =
                    (com.sun.management.OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
            double cpuLoad = osBean.getCpuLoad();
            if (cpuLoad >= 0) {
                cpuPercent = Math.round(cpuLoad * 1000.0) / 10.0;
            }
            long totalMem = osBean.getTotalMemorySize();
            long freeMem = osBean.getFreeMemorySize();
            ramTotalGb = Math.round((totalMem / (1024.0 * 1024 * 1024)) * 10.0) / 10.0;
            ramUsedGb = Math.round(((totalMem - freeMem) / (1024.0 * 1024 * 1024)) * 10.0) / 10.0;
        } catch (Exception e) {
            log.debug("Unable to read OS metrics: {}", e.getMessage());
        }

        // Count online users from active sessions (đọc trực tiếp từ DB đã được RoomPresenceService đồng bộ)
        long online = auctionSessionRepository.findAll().stream()
                .filter(s -> s.getStatus() == AuctionStatusEnum.LIVE)
                .mapToLong(s -> s.getParticipantCount() != null ? s.getParticipantCount() : 0L)
                .sum();

        return AdminServerMetricsVO.builder()
                .cpuPercent(cpuPercent)
                .cpuCores(cpuCores)
                .ramUsedGb(ramUsedGb)
                .ramTotalGb(ramTotalGb)
                .pingMs(29)
                .onlineUsers((int) online)
                .bidsPerSecond(11.7)
                .build();
    }

    @Override
    public AdminCommandResultVO halt(String roomId) {
        log.info("Admin HALT command requested for room: {}", roomId);
        Optional<AuctionSession> opt = auctionSessionRepository.findBySessionCode(roomId);
        if (opt.isEmpty()) {
            return AdminCommandResultVO.fail("Không tìm thấy phiên " + roomId);
        }
        pausedRooms.add(roomId);
        AuctionSession s = opt.get();
        s.setStatus(AuctionStatusEnum.PAUSED);
        auctionSessionRepository.save(s);

        if (messagingTemplate != null) {
            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
            com.ptit.bigdata.coreservice.model.vo.BidMessageVO haltMsg =
                    com.ptit.bigdata.coreservice.model.vo.BidMessageVO.builder()
                            .roomId(roomId)
                            .status("PAUSED")
                            .type("STATUS_CHANGE")
                            .timestamp(time)
                            .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                    new RoomEventVO(roomId, "HALT", "Phiên đấu giá đã bị tạm dừng khẩn cấp bởi quản trị viên.", null, time));
            messagingTemplate.convertAndSend("/topic/auction/" + roomId, haltMsg);
            messagingTemplate.convertAndSend("/topic/auctions", haltMsg);
        }
        return AdminCommandResultVO.ok("Đã tạm dừng phiên " + roomId + ". Đóng băng đồng hồ và khóa lệnh đặt giá.");
    }

    @Override
    public AdminCommandResultVO resume(String roomId) {
        log.info("Admin RESUME command requested for room: {}", roomId);
        Optional<AuctionSession> opt = auctionSessionRepository.findBySessionCode(roomId);
        if (opt.isEmpty()) {
            return AdminCommandResultVO.fail("Không tìm thấy phiên " + roomId);
        }
        pausedRooms.remove(roomId);
        AuctionSession s = opt.get();
        s.setStatus(AuctionStatusEnum.LIVE);
        LocalDateTime now = LocalDateTime.now();
        if (s.getEndTime() != null && s.getEndTime().isBefore(now)) {
            s.setEndTime(now.plusSeconds(30));
        } else if (s.getEndTime() != null) {
            s.setEndTime(s.getEndTime().plusSeconds(30));
        }
        try {
            auctionSessionRepository.save(s);
        } catch (Exception e) {
            log.warn("Could not save new end time for {}: {}", roomId, e.getMessage());
        }
        long remainingSec = s.getEndTime() != null ? Math.max(0L, Duration.between(now, s.getEndTime()).getSeconds()) : 0L;
        Long endTimeEpochMs = s.getEndTime() != null
                ? s.getEndTime().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
                : null;
        long serverNowMs = System.currentTimeMillis();
        if (messagingTemplate != null) {
            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
            String endTimeStr = s.getEndTime() != null ? s.getEndTime().toString() : null;
            com.ptit.bigdata.coreservice.model.vo.BidMessageVO resumeMsg =
                    com.ptit.bigdata.coreservice.model.vo.BidMessageVO.builder()
                            .roomId(roomId)
                            .status("LIVE")
                            .remainingSeconds(remainingSec)
                            .endTime(endTimeStr)
                            .endTimeEpochMs(endTimeEpochMs)
                            .serverTimeMs(serverNowMs)
                            .type("STATUS_CHANGE")
                            .timestamp(time)
                            .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                    RoomEventVO.builder()
                            .roomId(roomId)
                            .event("RESUME")
                            .message("Phiên đấu giá đã được tiếp tục. Đồng hồ đếm ngược cộng thêm 30 giây.")
                            .remainingSeconds(remainingSec)
                            .endTime(endTimeStr)
                            .endTimeEpochMs(endTimeEpochMs)
                            .serverTimeMs(serverNowMs)
                            .timestamp(time)
                            .build());
            messagingTemplate.convertAndSend("/topic/auction/" + roomId, resumeMsg);
            messagingTemplate.convertAndSend("/topic/auctions", resumeMsg);
        }
        return AdminCommandResultVO.ok("Đã tiếp tục phiên " + roomId + ". Đồng hồ đếm ngược đã cộng thêm 30 giây.");
    }

    @Override
    public AdminCommandResultVO kick(String userId, String roomId) {
        log.info("Admin KICK command requested: user {} from room {}", userId, roomId);
        if (userId == null || userId.isBlank()) {
            return AdminCommandResultVO.fail("Thiếu ID hoặc tên tài khoản cần ngắt kết nối.");
        }

        Long targetUserId = resolveTargetUserId(userId.trim());
        if (targetUserId == null) {
            return AdminCommandResultVO.fail("Không tìm thấy tài khoản '" + userId.trim() + "' trong hệ thống.");
        }

        String displayName = resolveDisplayName(targetUserId);
        String targetRoomRaw = (roomId != null && !roomId.isBlank()) ? roomId.trim() : "ALL";

        // Trường hợp KICK <userId> ALL -> kick khỏi mọi phòng user đang trực tuyến
        if ("ALL".equalsIgnoreCase(targetRoomRaw)) {
            if (roomPresenceService == null) {
                return AdminCommandResultVO.fail("Dịch vụ quản lý phòng trực tuyến chưa sẵn sàng.");
            }
            List<String> onlineRooms = roomPresenceService.getRoomsOfUser(targetUserId);
            if (onlineRooms.isEmpty()) {
                return AdminCommandResultVO.fail("Tài khoản " + displayName + " (ID " + targetUserId + ") hiện không trực tuyến ở phòng nào.");
            }
            for (String code : onlineRooms) {
                disableAutoBidForKickedUser(targetUserId, code);
                roomPresenceService.kickUser(code, targetUserId, displayName);
            }
            return AdminCommandResultVO.ok("Đã cưỡng chế ngắt kết nối tài khoản " + displayName
                    + " (ID " + targetUserId + ") khỏi " + onlineRooms.size() + " phòng: " + String.join(", ", onlineRooms));
        }

        // Tìm phiên theo sessionCode hoặc plateNumber
        Optional<AuctionSession> sessionOpt = auctionSessionRepository.findBySessionCode(targetRoomRaw);
        if (sessionOpt.isEmpty()) {
            Optional<NumberPlate> plateOpt = numberPlateRepository.findByPlateNumber(targetRoomRaw);
            if (plateOpt.isPresent()) {
                sessionOpt = auctionSessionRepository.findFirstByNumberPlateId(plateOpt.get().getId());
            }
        }
        if (sessionOpt.isEmpty()) {
            return AdminCommandResultVO.fail("Không tìm thấy phòng đấu giá '" + targetRoomRaw + "'.");
        }

        AuctionSession session = sessionOpt.get();
        String canonicalCode = session.getSessionCode();
        boolean isOnlineInRoom = roomPresenceService != null && roomPresenceService.isUserOnline(canonicalCode, targetUserId);
        boolean isRegistered = auctionRegistrationRepository.existsByUserIdAndSessionIdAndStatus(
                targetUserId, session.getId(), com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum.ACTIVE);
        boolean hasBidInRoom = bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(session.getId())
                .stream().anyMatch(b -> targetUserId.equals(b.getUserID()));

        if (!isOnlineInRoom && !isRegistered && !hasBidInRoom) {
            return AdminCommandResultVO.fail("Tài khoản " + displayName + " (ID " + targetUserId
                    + ") hiện không có mặt trong phòng " + canonicalCode + ".");
        }

        // Tắt auto-bid đang chạy của user ở phòng này (nếu có)
        disableAutoBidForKickedUser(targetUserId, session.getId());

        if (roomPresenceService != null) {
            roomPresenceService.kickUser(canonicalCode, targetUserId, displayName);
            int remaining = roomPresenceService.getParticipantCount(canonicalCode);
            return AdminCommandResultVO.ok("Đã cưỡng chế ngắt kết nối tài khoản " + displayName
                    + " (ID " + targetUserId + ") khỏi phòng " + canonicalCode + " (còn " + remaining + " người trong phòng).");
        }

        if (messagingTemplate != null) {
            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
            messagingTemplate.convertAndSend("/topic/room/" + canonicalCode,
                    RoomEventVO.builder()
                            .roomId(canonicalCode)
                            .event("KICK")
                            .userId(targetUserId)
                            .userName(displayName)
                            .message(displayName + " đã bị Quản trị viên ngắt kết nối khỏi phòng đấu giá.")
                            .timestamp(time)
                            .build());
        }
        return AdminCommandResultVO.ok("Đã cưỡng chế ngắt kết nối tài khoản " + displayName + " (ID " + targetUserId + ") khỏi phòng " + canonicalCode + ".");
    }

    @Override
    public AdminCommandResultVO unkick(String userId, String roomId) {
        log.info("Admin UNKICK command requested: user {} for room {}", userId, roomId);
        if (userId == null || userId.isBlank()) {
            return AdminCommandResultVO.fail("Thiếu ID hoặc tên tài khoản cần mở khóa.");
        }
        if (roomPresenceService == null) {
            return AdminCommandResultVO.fail("Dịch vụ quản lý phòng trực tuyến chưa sẵn sàng.");
        }

        Long targetUserId = resolveTargetUserId(userId.trim());
        if (targetUserId == null) {
            return AdminCommandResultVO.fail("Không tìm thấy tài khoản '" + userId.trim() + "' trong hệ thống.");
        }

        String displayName = resolveDisplayName(targetUserId);
        String targetRoomRaw = (roomId != null && !roomId.isBlank()) ? roomId.trim() : "ALL";

        if ("ALL".equalsIgnoreCase(targetRoomRaw)) {
            List<String> kickedRooms = roomPresenceService.getKickedRoomsOfUser(targetUserId);
            if (kickedRooms.isEmpty()) {
                return AdminCommandResultVO.fail("Tài khoản " + displayName + " (ID " + targetUserId + ") hiện không bị chặn ở phòng nào.");
            }
            for (String code : kickedRooms) {
                roomPresenceService.unkickUser(code, targetUserId);
            }
            notifyUserUnkicked(targetUserId, String.join(", ", kickedRooms));
            return AdminCommandResultVO.ok("Đã mở khóa (UNKICK) tài khoản " + displayName
                    + " (ID " + targetUserId + ") cho " + kickedRooms.size() + " phòng: " + String.join(", ", kickedRooms));
        }

        Optional<AuctionSession> sessionOpt = auctionSessionRepository.findBySessionCode(targetRoomRaw);
        if (sessionOpt.isEmpty()) {
            Optional<NumberPlate> plateOpt = numberPlateRepository.findByPlateNumber(targetRoomRaw);
            if (plateOpt.isPresent()) {
                sessionOpt = auctionSessionRepository.findFirstByNumberPlateId(plateOpt.get().getId());
            }
        }
        if (sessionOpt.isEmpty()) {
            return AdminCommandResultVO.fail("Không tìm thấy phòng đấu giá '" + targetRoomRaw + "'.");
        }

        String canonicalCode = sessionOpt.get().getSessionCode();
        boolean removed = roomPresenceService.unkickUser(canonicalCode, targetUserId);
        if (!removed) {
            return AdminCommandResultVO.fail("Tài khoản " + displayName + " (ID " + targetUserId
                    + ") hiện không bị chặn ở phòng " + canonicalCode + ".");
        }

        notifyUserUnkicked(targetUserId, canonicalCode);
        return AdminCommandResultVO.ok("Đã mở khóa (UNKICK) cho tài khoản " + displayName
                + " (ID " + targetUserId + ") được phép vào lại phòng " + canonicalCode + ".");
    }

    private void notifyUserUnkicked(Long userId, String roomLabel) {
        if (messagingTemplate == null || userId == null) {
            return;
        }
        try {
            userRepository.findById(userId).ifPresent(user -> {
                if (user.getUsername() != null && !user.getUsername().isBlank()) {
                    Map<String, Object> payload = Map.of(
                            "type", "ROOM_UNKICKED",
                            "title", "Đã mở khóa phòng đấu giá",
                            "content", "Quản trị viên đã cho phép bạn vào lại phòng " + roomLabel + "."
                    );
                    messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", payload);
                }
            });
        } catch (Exception e) {
            log.debug("Could not push UNKICK notification to user {}: {}", userId, e.getMessage());
        }
    }

    private Long resolveTargetUserId(String raw) {
        String normalized = raw;
        if (normalized.regionMatches(true, 0, "U-", 0, 2)) {
            normalized = normalized.substring(2).trim();
        }
        try {
            long parsedId = Long.parseLong(normalized);
            if (userRepository.findById(parsedId).isPresent()) {
                return parsedId;
            }
            if (roomPresenceService != null && !roomPresenceService.getRoomsOfUser(parsedId).isEmpty()) {
                return parsedId;
            }
        } catch (NumberFormatException ignored) {
            // Không phải số -> thử tìm theo username hoặc fullName
        }

        var byUsername = userRepository.findByUserName(raw);
        if (byUsername.isPresent()) {
            return byUsername.get().getId();
        }

        return userInfoRepository.findAll().stream()
                .filter(ui -> raw.equalsIgnoreCase(ui.getUserName()) || raw.equalsIgnoreCase(ui.getFullName()))
                .findFirst()
                .flatMap(ui -> ui.getUserName() != null ? userRepository.findByUserName(ui.getUserName()) : Optional.empty())
                .map(com.ptit.bigdata.coreservice.core.auth.entity.User::getId)
                .orElse(null);
    }

    private void disableAutoBidForKickedUser(Long userId, String sessionCode) {
        auctionSessionRepository.findBySessionCode(sessionCode)
                .ifPresent(s -> disableAutoBidForKickedUser(userId, s.getId()));
    }

    private void disableAutoBidForKickedUser(Long userId, Long sessionId) {
        if (autoBidConfigRepository == null || userId == null || sessionId == null) {
            return;
        }
        try {
            autoBidConfigRepository.findByUserIdAndSessionId(userId, sessionId).ifPresent(cfg -> {
                if (Boolean.TRUE.equals(cfg.getActive())) {
                    cfg.setActive(false);
                    cfg.setStoppedReason(com.ptit.bigdata.coreservice.enumration.AutoBidStopReasonEnum.NOT_REGISTERED);
                    cfg.setUpdatedAt(LocalDateTime.now());
                    autoBidConfigRepository.save(cfg);
                }
            });
        } catch (Exception e) {
            log.warn("Could not disable auto-bid for kicked user {} in session {}: {}", userId, sessionId, e.getMessage());
        }
    }

    @Override
    public AdminCommandResultVO cancel(String roomId) {
        log.info("Admin CANCEL command requested for room: {}", roomId);
        Optional<AuctionSession> opt = auctionSessionRepository.findBySessionCode(roomId);
        if (opt.isEmpty()) {
            return AdminCommandResultVO.fail("Không tìm thấy phiên " + roomId);
        }
        pausedRooms.remove(roomId);
        AuctionSession s = opt.get();
        s.setStatus(AuctionStatusEnum.END);
        s.setUserInfoId(null);
        s.setWinningPrice(null);
        auctionSessionRepository.save(s);
        try {
            walletService.handleSessionCancelled(s.getId());
        } catch (Exception e) {
            log.error("Could not refund deposits for session {}: {}", roomId, e.getMessage());
        }
        if (messagingTemplate != null) {
            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
            com.ptit.bigdata.coreservice.model.vo.BidMessageVO cancelMsg =
                    com.ptit.bigdata.coreservice.model.vo.BidMessageVO.builder()
                            .roomId(roomId)
                            .status("END")
                            .remainingSeconds(0L)
                            .type("STATUS_CHANGE")
                            .timestamp(time)
                            .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                    RoomEventVO.builder()
                            .roomId(roomId)
                            .event("CANCEL")
                            .message("Phiên đấu giá đã bị hủy. Quy trình hoàn cọc 100% đã được kích hoạt.")
                            .remainingSeconds(0L)
                            .timestamp(time)
                            .build());
            messagingTemplate.convertAndSend("/topic/auction/" + roomId, cancelMsg);
            messagingTemplate.convertAndSend("/topic/auctions", cancelMsg);
        }
        return AdminCommandResultVO.ok("Đã hủy phiên " + roomId + ". Đã kích hoạt hoàn trả 100% tiền cọc.");
    }

    @Override
    @Transactional
    public AdminCommandResultVO deleteRoom(String roomId) {
        Optional<AuctionSession> sessionOpt = auctionSessionRepository.findBySessionCode(roomId);
        if (sessionOpt.isEmpty()) {
            return AdminCommandResultVO.fail("Không tìm thấy phiên " + roomId);
        }

        AuctionSession session = sessionOpt.get();
        if (session.getStatus() != AuctionStatusEnum.SOON) {
            return AdminCommandResultVO.fail("Chỉ có thể xóa phiên sắp diễn ra. Phiên đã chạy phải được giữ lại để bảo toàn lịch sử.");
        }
        if (roomPresenceService != null && roomPresenceService.getParticipantCount(roomId) > 0) {
            return AdminCommandResultVO.fail("Không thể xóa phiên đang có người trực tuyến.");
        }
        if (bidHistoryRepository.countByAuctionSessionId(session.getId()) > 0) {
            return AdminCommandResultVO.fail("Không thể xóa phiên đã có lượt đặt giá.");
        }
        if (auctionRegistrationRepository.countBySessionId(session.getId()) > 0) {
            return AdminCommandResultVO.fail("Phiên đã có đăng ký. Hãy hủy phiên để hoàn cọc trước; lịch sử đăng ký sẽ được giữ lại.");
        }
        if (walletTransactionRepository.existsBySessionCode(roomId)) {
            return AdminCommandResultVO.fail("Không thể xóa phiên có giao dịch ví để bảo toàn lịch sử tài chính.");
        }

        String sessionCode = session.getSessionCode();
        Long sessionId = session.getId();
        auctionWatchRepository.deleteBySessionId(sessionId);
        roomAnnouncementRepository.deleteBySessionId(sessionId);
        roomChatMessageRepository.deleteByRoomCode(sessionCode);
        shillAlertRepository.deleteBySessionId(sessionId);
        notificationLogRepository.deleteBySessionId(sessionId);
        notificationRepository.deleteBySessionCode(sessionCode);
        if (autoBidConfigRepository != null) {
            autoBidConfigRepository.deleteBySessionId(sessionId);
        }
        auctionSessionRepository.delete(session);
        pausedRooms.remove(sessionCode);

        log.info("Admin deleted unused scheduled auction session {} from database", sessionCode);
        return AdminCommandResultVO.ok("Đã xóa phiên " + sessionCode + " khỏi cơ sở dữ liệu.");
    }

    private String mapStatus(AuctionSession session, LocalDateTime now) {
        if (pausedRooms.contains(session.getSessionCode()) || session.getStatus() == AuctionStatusEnum.PAUSED) {
            return "PAUSED";
        }
        if (session.getStatus() == AuctionStatusEnum.END) {
            return session.getUserInfoId() != null ? "COMPLETED" : "CLOSED";
        }
        if (session.getStatus() == AuctionStatusEnum.LIVE) {
            if (session.getEndTime() != null && session.getEndTime().isAfter(now)) {
                Duration d = Duration.between(now, session.getEndTime());
                if (d.getSeconds() <= 30) {
                    return "EXTENDING";
                }
            }
            return "ACTIVE";
        }
        if (session.getStatus() == AuctionStatusEnum.SOON) {
            if (session.getStartTime() != null && session.getStartTime().isAfter(now)) {
                Duration d = Duration.between(now, session.getStartTime());
                if (d.toMinutes() <= 15) {
                    return "WAITING";
                }
            }
            return "SCHEDULED";
        }
        return "SCHEDULED";
    }

    private int roomSortPriority(AuctionSession session) {
        if (session.getStatus() == AuctionStatusEnum.LIVE) {
            return 0;
        }
        if (session.getStatus() == AuctionStatusEnum.SOON) {
            return 1;
        }
        if (session.getStatus() == AuctionStatusEnum.PAUSED) {
            return 2;
        }
        if (session.getStatus() == AuctionStatusEnum.END && session.getUserInfoId() != null) {
            return 4;
        }
        return 3;
    }

    private String calculateRemaining(AuctionSession session, LocalDateTime now) {
        if (pausedRooms.contains(session.getSessionCode()) || session.getStatus() == AuctionStatusEnum.PAUSED) {
            return "Tạm dừng";
        }
        if (session.getStatus() == AuctionStatusEnum.END) {
            return "00:00:00";
        }
        if (session.getEndTime() != null && now.isAfter(session.getStartTime()) && now.isBefore(session.getEndTime())) {
            long totalSec = Math.max(0L, Duration.between(now, session.getEndTime()).getSeconds());
            return String.format("%02d:%02d:%02d", totalSec / 3600, (totalSec % 3600) / 60, totalSec % 60);
        }
        if (session.getStartTime() != null && session.getStartTime().isAfter(now)) {
            if (session.getStartTime().toLocalDate().isEqual(now.toLocalDate())) {
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");
                return session.getStartTime().format(fmt) + " hôm nay";
            }
            return "Chưa bắt đầu";
        }
        return "00:00:00";
    }

    private String resolveDisplayName(Long userId) {
        if (userId == null) return "Người dùng #?";
        return userRepository.findById(userId)
                .flatMap(u -> userInfoRepository.findByUserName(u.getUsername())
                        .map(ui -> (ui.getFullName() != null && !ui.getFullName().isBlank()) ? ui.getFullName() : u.getUsername()))
                .orElseGet(() -> userInfoRepository.findById(userId)
                        .map(UserInfo::getFullName)
                        .orElse("Người dùng #" + userId));
    }

    private String extractPlateFromTitle(String title) {
        if (title == null) return "Chưa cập nhật";
        // Try to extract pattern like 30K-999.99
        int idx = title.indexOf("biển số xe ô tô ");
        if (idx != -1) {
            int end = title.indexOf(" (", idx);
            if (end != -1) {
                return title.substring(idx + "biển số xe ô tô ".length(), end).trim();
            }
        }
        return title;
    }

}
