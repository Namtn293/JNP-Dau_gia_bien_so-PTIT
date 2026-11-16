package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.entity.Province;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.AdminCommandResultVO;
import com.ptit.bigdata.coreservice.model.vo.AdminParticipantVO;
import com.ptit.bigdata.coreservice.model.vo.AdminRoomVO;
import com.ptit.bigdata.coreservice.model.vo.AdminServerMetricsVO;
import com.ptit.bigdata.coreservice.model.vo.AdminAuctionResultVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.repository.ProvinceRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.service.AdminAuctionService;
import com.ptit.bigdata.coreservice.service.AutoBidScheduler;
import com.ptit.bigdata.coreservice.service.KickedUserRegistry;
import com.ptit.bigdata.coreservice.service.MetricsSampler;
import com.ptit.bigdata.coreservice.service.WalletService;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final NumberPlateRepository numberPlateRepository;
    private final ProvinceRepository provinceRepository;
    private final BidHistoryRepository bidHistoryRepository;
    private final UserInfoRepository userInfoRepository;
    private final UserRepository userRepository;
    private final AuctionRegistrationRepository auctionRegistrationRepository;
    private final WalletService walletService;
    private final AutoBidScheduler autoBidScheduler;
    private final KickedUserRegistry kickedUserRegistry;
    private final MetricsSampler metricsSampler;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public List<AdminRoomVO> getRooms() {
        List<AuctionSession> sessions = auctionSessionRepository.findAll();
        if (sessions.isEmpty()) {
            return Collections.emptyList();
        }

        List<AdminRoomVO> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        Set<Long> plateIds = new LinkedHashSet<>();
        Set<Long> sessionIds = new LinkedHashSet<>();
        for (AuctionSession session : sessions) {
            if (session.getNumberPlateId() != null) plateIds.add(session.getNumberPlateId());
            if (session.getId() != null) sessionIds.add(session.getId());
        }
        Map<Long, NumberPlate> plateMap = new HashMap<>();
        for (NumberPlate plate : numberPlateRepository.findAllById(plateIds)) {
            plateMap.put(plate.getId(), plate);
        }
        Set<Long> provinceIds = new LinkedHashSet<>();
        for (NumberPlate plate : plateMap.values()) {
            if (plate.getProvinceId() != null) provinceIds.add(plate.getProvinceId());
        }
        Map<Long, Province> provinceMap = new HashMap<>();
        for (Province province : provinceRepository.findAllById(provinceIds)) {
            provinceMap.put(province.getId(), province);
        }
        Map<Long, Integer> activeParticipantCounts = new HashMap<>();
        if (!sessionIds.isEmpty()) {
            for (Object[] row : auctionRegistrationRepository.countActiveBySessionIds(sessionIds)) {
                activeParticipantCounts.put(((Number) row[0]).longValue(), ((Number) row[1]).intValue());
            }
        }

        for (AuctionSession session : sessions) {
            NumberPlate plate = session.getNumberPlateId() != null ? plateMap.get(session.getNumberPlateId()) : null;
            Province province = plate != null && plate.getProvinceId() != null ? provinceMap.get(plate.getProvinceId()) : null;

            String plateNumber = plate != null ? plate.getPlateNumber() : extractPlateFromTitle(session.getTitle());
            String regionName = province != null ? province.getName() : "Toàn quốc";

            // Determine status and remaining time
            String status = mapStatus(session, now);
            String remaining = calculateRemaining(session, now);

            long currentPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
            int participantCount = activeParticipantCounts.getOrDefault(session.getId(), 0);

            result.add(AdminRoomVO.builder()
                    .id(session.getSessionCode())
                    .plate(plateNumber)
                    .region(regionName)
                    .status(status)
                    .participantCount(participantCount)
                    .currentPrice(currentPrice)
                    .remainingLabel(remaining)
                    .rttMs(0)
                    .build());
        }

        return result;
    }

    @Override
    public List<AdminParticipantVO> getParticipants(String roomId) {
        Optional<AuctionSession> sessionOpt = auctionSessionRepository.findBySessionCode(roomId);
        if (sessionOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Long sessionId = sessionOpt.get().getId();
        List<BidHistory> bids = bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(sessionId);
        List<com.ptit.bigdata.coreservice.entity.AuctionRegistration> registrations =
                auctionRegistrationRepository.findBySessionIdAndStatus(sessionId, RegistrationStatusEnum.ACTIVE);

        Set<Long> allUserIds = new LinkedHashSet<>();
        Set<Long> activeRegistrationUserIds = new HashSet<>();
        for (com.ptit.bigdata.coreservice.entity.AuctionRegistration registration : registrations) {
            if (registration.getUserId() != null) {
                allUserIds.add(registration.getUserId());
                activeRegistrationUserIds.add(registration.getUserId());
            }
        }

        Map<Long, List<BidHistory>> userBids = new LinkedHashMap<>();
        for (BidHistory bid : bids) {
            if (bid.getUserID() == null) {
                continue;
            }
            allUserIds.add(bid.getUserID());
            userBids.computeIfAbsent(bid.getUserID(), key -> new ArrayList<>()).add(bid);
        }

        if (allUserIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, User> authUsersById = new HashMap<>();
        for (User user : userRepository.findAllById(allUserIds)) {
            authUsersById.put(user.getId(), user);
        }
        Set<String> usernames = new LinkedHashSet<>();
        authUsersById.values().forEach(user -> usernames.add(user.getUsername()));
        Map<String, String> namesByUsername = new HashMap<>();
        if (!usernames.isEmpty()) {
            for (UserInfo userInfo : userInfoRepository.findByUserNameIn(usernames)) {
                namesByUsername.put(userInfo.getUserName(), userInfo.getFullName());
            }
        }

        LocalDateTime since = LocalDateTime.now().minusSeconds(5);
        List<AdminParticipantVO> list = new ArrayList<>();
        for (Long userId : allUserIds) {
            List<BidHistory> history = userBids.getOrDefault(userId, Collections.emptyList());
            User authUser = authUsersById.get(userId);
            String username = authUser == null ? null : authUser.getUsername();
            String name = namesByUsername.get(username);
            if (name == null || name.isBlank()) name = "Người dùng #" + userId;
            long maxBid = history.stream().mapToLong(BidHistory::getBidAmount).max().orElse(0L);
            int recentBids = (int) history.stream()
                    .filter(bid -> bid.getBidTime() != null && bid.getBidTime().isAfter(since))
                    .count();
            String role = authUser != null && authUser.getRoleEnum() == com.ptit.bigdata.coreservice.enumration.RoleEnum.ADMIN
                    ? "ADMIN" : activeRegistrationUserIds.contains(userId) ? "BIDDER" : "VIEWER";

            list.add(AdminParticipantVO.builder()
                    .userId(String.valueOf(userId))
                    .fullName(name)
                    .connection("UNKNOWN")
                    .bidsInLast5s(recentBids)
                    .lastPrice(maxBid)
                    .rttMs(0)
                    .role(role)
                    .build());
        }
        return list;
    }

    @Override
    public AdminAuctionResultVO getResult(String roomId) {
        AuctionSession session = auctionSessionRepository.findBySessionCode(roomId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy phiên " + roomId));
        if (session.getStatus() != AuctionStatusEnum.END || session.getUserInfoId() == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT, "Phiên chưa kết thúc hoặc chưa có người thắng.");
        }

        Long winnerId = session.getUserInfoId();
        User winner = userRepository.findById(winnerId).orElse(null);
        UserInfo profile = winner == null ? null : userInfoRepository.findByUserName(winner.getUsername()).orElse(null);
        String winnerName = profile != null && profile.getFullName() != null
                ? profile.getFullName()
                : winner != null ? winner.getUsername() : "Người dùng #" + winnerId;
        String winnerEmail = profile != null ? profile.getEmail() : null;
        long deposit = auctionRegistrationRepository.findByUserIdAndSessionId(winnerId, session.getId())
                .map(registration -> registration.getDepositAmount() == null ? 0L : registration.getDepositAmount())
                .orElse(0L);
        String plate = session.getNumberPlateId() == null ? ""
                : numberPlateRepository.findById(session.getNumberPlateId()).map(NumberPlate::getPlateNumber).orElse("");
        long finalPrice = session.getEndPrice() != null ? session.getEndPrice()
                : session.getWinningPrice() != null ? session.getWinningPrice()
                : session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();

        return new AdminAuctionResultVO(session.getSessionCode(), plate, session.getStatus().name(), finalPrice,
                deposit, winnerId, winnerName, winnerEmail, session.getEndTime());
    }

    @Override
    public AdminServerMetricsVO getMetrics() {
        var sample = metricsSampler.sample();

        return AdminServerMetricsVO.builder()
                .cpuPercent(sample.cpuPercent())
                .cpuCores(sample.cores())
                .ramUsedGb(sample.ramUsedGb())
                .ramTotalGb(sample.ramTotalGb())
                .onlineUsers((int) sample.online())
                .bidsPerSecond(sample.bps())
                .build();
    }

    @Override
    @Transactional
    public AdminCommandResultVO halt(String roomId) {
        log.info("Admin HALT command requested for room: {}", roomId);
        AuctionSession session = auctionSessionRepository.findBySessionCodeForUpdate(roomId).orElse(null);
        if (session == null) return AdminCommandResultVO.fail("Không tìm thấy phiên " + roomId + ".");
        if (session.getStatus() != AuctionStatusEnum.LIVE) {
            return AdminCommandResultVO.fail("Chỉ có thể tạm dừng phiên đang diễn ra.");
        }
        session.setStatus(AuctionStatusEnum.PAUSED);
        auctionSessionRepository.save(session);
        if (messagingTemplate != null) {
            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                    new RoomEventVO(roomId, "HALT", "Phiên đấu giá đã bị tạm dừng khẩn cấp bởi quản trị viên.", null, time));
        }
        return AdminCommandResultVO.ok("Đã tạm dừng phiên " + roomId + " trong database; lệnh đặt giá đã bị khóa.");
    }

    @Override
    @Transactional
    public AdminCommandResultVO resume(String roomId) {
        log.info("Admin RESUME command requested for room: {}", roomId);
        AuctionSession s = auctionSessionRepository.findBySessionCodeForUpdate(roomId).orElse(null);
        if (s == null) return AdminCommandResultVO.fail("Không tìm thấy phiên " + roomId + ".");
        if (s.getStatus() != AuctionStatusEnum.PAUSED) {
            return AdminCommandResultVO.fail("Chỉ có thể tiếp tục phiên đang tạm dừng.");
        }
        LocalDateTime now = LocalDateTime.now();
        if (s.getEndTime() != null) {
            s.setEndTime(s.getEndTime().isBefore(now) ? now.plusSeconds(30) : s.getEndTime().plusSeconds(30));
        }
        s.setStatus(AuctionStatusEnum.LIVE);
        auctionSessionRepository.save(s);
        autoBidScheduler.scheduleNextAutoBid(s.getId());
        if (messagingTemplate != null) {
            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                    new RoomEventVO(roomId, "RESUME", "Phiên đấu giá đã được tiếp tục. Đồng hồ đếm ngược cộng thêm 30 giây.", null, time));
        }
        return AdminCommandResultVO.ok("Đã tiếp tục phiên " + roomId + ". Đồng hồ đếm ngược đã cộng thêm 30 giây.");
    }

    @Override
    public AdminCommandResultVO kick(String userId, String roomId) {
        log.info("Admin KICK command requested: user {} from room {}", userId, roomId);
        final Long parsedUserId;
        try {
            parsedUserId = Long.parseLong(userId);
        } catch (RuntimeException e) {
            return AdminCommandResultVO.fail("userId phải là số auth_user.id.");
        }
        if (!userRepository.existsById(parsedUserId)) {
            return AdminCommandResultVO.fail("Không tìm thấy tài khoản " + parsedUserId + ".");
        }
        if (!"ALL".equalsIgnoreCase(roomId) && !auctionSessionRepository.findBySessionCode(roomId).isPresent()) {
            return AdminCommandResultVO.fail("Không tìm thấy phiên " + roomId + ".");
        }
        kickedUserRegistry.kick(parsedUserId, roomId);
        if (messagingTemplate != null) {
            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                    new RoomEventVO(roomId, "KICK", "Tài khoản " + userId + " đã bị chặn đặt giá trong phòng.", null, time));
        }
        return AdminCommandResultVO.ok("Đã chặn tài khoản " + parsedUserId + " đặt giá trong " + roomId + ".");
    }

    @Override
    @Transactional
    public AdminCommandResultVO cancel(String roomId) {
        log.info("Admin CANCEL command requested for room: {}", roomId);
        AuctionSession s = auctionSessionRepository.findBySessionCodeForUpdate(roomId).orElse(null);
        if (s == null) return AdminCommandResultVO.fail("Không tìm thấy phiên " + roomId + ".");
        if (s.getStatus() != AuctionStatusEnum.SOON && s.getStatus() != AuctionStatusEnum.LIVE
                && s.getStatus() != AuctionStatusEnum.PAUSED) {
            return AdminCommandResultVO.fail("Phiên này không còn ở trạng thái có thể hủy.");
        }
        s.setStatus(AuctionStatusEnum.END);
        auctionSessionRepository.save(s);
        autoBidScheduler.cancelSessionTasks(s.getId());
        int refundedRegistrations = walletService.handleSessionCancelled(s.getId());
        if (messagingTemplate != null) {
            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                    new RoomEventVO(roomId, "CANCEL", "Phiên đấu giá đã bị hủy. Đã hoàn cọc cho " + refundedRegistrations + " đăng ký.", null, time));
        }
        return AdminCommandResultVO.ok("Đã hủy phiên " + roomId + " và hoàn cọc cho " + refundedRegistrations + " đăng ký.");
    }

    private String mapStatus(AuctionSession session, LocalDateTime now) {
        if (session.getStatus() == AuctionStatusEnum.PAUSED) {
            return "PAUSED";
        }
        if (session.getStatus() == AuctionStatusEnum.END) {
            return "CLOSED";
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

    private String calculateRemaining(AuctionSession session, LocalDateTime now) {
        if (session.getStatus() == AuctionStatusEnum.PAUSED) {
            return "Tạm dừng";
        }
        if (session.getStatus() == AuctionStatusEnum.END) {
            return "00:00";
        }
        if (session.getStartTime() != null && session.getEndTime() != null
                && now.isAfter(session.getStartTime()) && now.isBefore(session.getEndTime())) {
            Duration d = Duration.between(now, session.getEndTime());
            long mins = d.toMinutes();
            long secs = d.minusMinutes(mins).getSeconds();
            return String.format("%02d:%02d", mins, secs);
        }
        if (session.getStartTime() != null && session.getStartTime().isAfter(now)) {
            if (session.getStartTime().toLocalDate().isEqual(now.toLocalDate())) {
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");
                return session.getStartTime().format(fmt) + " hôm nay";
            }
            return "Chưa bắt đầu";
        }
        return "00:00";
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
