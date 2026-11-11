package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.RoomChatMessage;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
import com.ptit.bigdata.coreservice.model.vo.ChatMessageVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.RoomChatMessageRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.service.RoomChatService;
import com.ptit.bigdata.coreservice.service.RoomRoleResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomChatServiceImpl implements RoomChatService {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final int MAX_CONTENT_LENGTH = 500;
    private static final int MAX_HISTORY_LIMIT = 200;

    private final RoomChatMessageRepository roomChatMessageRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final UserRepository userRepository;
    private final UserInfoRepository userInfoRepository;
    private final RoomRoleResolver roomRoleResolver;
    private final AuctionProperties auctionProperties;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ChatMessageVO saveChatMessage(
            String roomCode,
            Long senderId,
            String senderName,
            String content,
            String clientMessageId
    ) {
        String trimmed = content != null ? content.trim() : "";
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.length() > MAX_CONTENT_LENGTH) {
            trimmed = trimmed.substring(0, MAX_CONTENT_LENGTH);
        }

        String safeName = (senderName != null && !senderName.isBlank()) ? senderName.trim() : "Người tham gia";
        String msgUuid = (clientMessageId != null && !clientMessageId.isBlank())
                ? clientMessageId
                : UUID.randomUUID().toString();
        Long sessionId = auctionSessionRepository.findBySessionCode(roomCode)
                .map(AuctionSession::getId)
                .orElse(null);

        LocalDateTime now = LocalDateTime.now();
        RoomChatMessage saved = roomChatMessageRepository.save(RoomChatMessage.builder()
                .messageUuid(msgUuid)
                .sessionId(sessionId)
                .roomCode(roomCode)
                .senderId(senderId)
                .senderName(safeName)
                .content(trimmed)
                .messageType("CHAT")
                .createdAt(now)
                .build());

        return toVO(saved);
    }

    @Override
    @Transactional
    public ChatMessageVO postChatFromRest(String roomCode, Long userId, String fallbackName, String content) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        RoomRoleEnum role = roomRoleResolver.resolveBySessionCode(userId, roomCode);
        if (role == RoomRoleEnum.VIEWER && !auctionProperties.getRoom().isViewerCanChat()) {
            throw new BusinessException(ErrorCode.CHAT_BIDDER_ONLY);
        }

        String displayName = resolveDisplayName(userId, fallbackName);
        ChatMessageVO saved = saveChatMessage(roomCode, userId, displayName, content, null);
        if (saved != null) {
            messagingTemplate.convertAndSend("/topic/chat/" + roomCode, saved);
        }
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageVO> getChatHistory(String roomCode, int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), MAX_HISTORY_LIMIT);
        List<RoomChatMessage> desc = roomChatMessageRepository.findByRoomCodeOrderByCreatedAtDescIdDesc(
                roomCode,
                PageRequest.of(0, safeLimit)
        );
        List<ChatMessageVO> chronological = new ArrayList<>(desc.size());
        for (int i = desc.size() - 1; i >= 0; i--) {
            chronological.add(toVO(desc.get(i)));
        }
        return Collections.unmodifiableList(chronological);
    }

    private ChatMessageVO toVO(RoomChatMessage entity) {
        LocalDateTime createdAt = entity.getCreatedAt() != null ? entity.getCreatedAt() : LocalDateTime.now();
        return ChatMessageVO.builder()
                .id(entity.getMessageUuid())
                .roomId(entity.getRoomCode())
                .senderId(entity.getSenderId() != null ? String.valueOf(entity.getSenderId()) : null)
                .senderName(entity.getSenderName())
                .content(entity.getContent())
                .timestamp(TIME_FMT.format(createdAt))
                .type(entity.getMessageType() != null ? entity.getMessageType() : "CHAT")
                .build();
    }

    private String resolveDisplayName(Long userId, String fallbackName) {
        return userRepository.findById(userId)
                .flatMap(u -> userInfoRepository.findByUserName(u.getUsername())
                        .map(ui -> (ui.getFullName() != null && !ui.getFullName().isBlank()) ? ui.getFullName() : u.getUsername()))
                .orElse((fallbackName != null && !fallbackName.isBlank()) ? fallbackName : "Người dùng #" + userId);
    }
}

