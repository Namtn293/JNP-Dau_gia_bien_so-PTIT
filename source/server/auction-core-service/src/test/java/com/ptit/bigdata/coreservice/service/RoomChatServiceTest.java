package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.RoomChatMessage;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
import com.ptit.bigdata.coreservice.model.vo.ChatMessageVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.RoomChatMessageRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.service.implement.RoomChatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomChatServiceTest {

    @Mock private RoomChatMessageRepository roomChatMessageRepository;
    @Mock private AuctionSessionRepository auctionSessionRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserInfoRepository userInfoRepository;
    @Mock private RoomRoleResolver roomRoleResolver;
    @Mock private SimpMessagingTemplate messagingTemplate;

    private RoomChatServiceImpl roomChatService;

    @BeforeEach
    void setUp() {
        roomChatService = new RoomChatServiceImpl(
                roomChatMessageRepository,
                auctionSessionRepository,
                userRepository,
                userInfoRepository,
                roomRoleResolver,
                new AuctionProperties(),
                messagingTemplate
        );
    }

    @Test
    @DisplayName("Lưu tin nhắn chat vào DB kèm senderId và bỏ qua tin nhắn rỗng")
    void testSaveChatMessagePersistsWithSenderId() {
        AuctionSession session = AuctionSession.builder().sessionCode("SES-HN-30K56789").build();
        session.setId(5L);
        when(auctionSessionRepository.findBySessionCode("SES-HN-30K56789")).thenReturn(Optional.of(session));
        when(roomChatMessageRepository.save(any(RoomChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));

        assertNull(roomChatService.saveChatMessage("SES-HN-30K56789", 11L, "Nam Trần", "   ", null));

        ChatMessageVO saved = roomChatService.saveChatMessage(
                "SES-HN-30K56789", 11L, "Nam Trần", "Xin chào mọi người", "msg-1"
        );
        assertNotNull(saved);
        assertEquals("msg-1", saved.getId());
        assertEquals("11", saved.getSenderId());
        assertEquals("Nam Trần", saved.getSenderName());
        assertEquals("Xin chào mọi người", saved.getContent());
        verify(roomChatMessageRepository).save(any(RoomChatMessage.class));
    }

    @Test
    @DisplayName("Lấy lịch sử chat trả về đúng thứ tự thời gian từ cũ đến mới")
    void testGetChatHistoryReturnsChronologicalOrder() {
        LocalDateTime t1 = LocalDateTime.of(2026, 11, 11, 22, 0, 1);
        LocalDateTime t2 = LocalDateTime.of(2026, 11, 11, 22, 0, 5);
        RoomChatMessage newer = RoomChatMessage.builder()
                .messageUuid("m2").roomCode("SES-HN-30K56789").senderId(2L)
                .senderName("User B").content("Tin thứ 2").createdAt(t2).build();
        RoomChatMessage older = RoomChatMessage.builder()
                .messageUuid("m1").roomCode("SES-HN-30K56789").senderId(1L)
                .senderName("User A").content("Tin thứ 1").createdAt(t1).build();

        when(roomChatMessageRepository.findByRoomCodeOrderByCreatedAtDescIdDesc(eq("SES-HN-30K56789"), any()))
                .thenReturn(List.of(newer, older));

        List<ChatMessageVO> history = roomChatService.getChatHistory("SES-HN-30K56789", 50);
        assertEquals(2, history.size());
        assertEquals("m1", history.get(0).getId());
        assertEquals("Tin thứ 1", history.get(0).getContent());
        assertEquals("m2", history.get(1).getId());
        assertEquals("Tin thứ 2", history.get(1).getContent());
    }

    @Test
    @DisplayName("Khách xem (VIEWER) gửi chat qua REST phải bị chặn CHAT_BIDDER_ONLY")
    void testPostChatFromRestBlocksViewer() {
        when(roomRoleResolver.resolveBySessionCode(99L, "SES-HN-30K56789")).thenReturn(RoomRoleEnum.VIEWER);
        BusinessException ex = assertThrows(BusinessException.class,
                () -> roomChatService.postChatFromRest("SES-HN-30K56789", 99L, "Viewer", "hello"));
        assertEquals(ErrorCode.CHAT_BIDDER_ONLY, ex.getErrorCode());
        verifyNoInteractions(messagingTemplate);
    }

    @Test
    @DisplayName("Đấu giá viên (BIDDER) gửi chat qua REST sẽ lưu DB và broadcast tới /topic/chat/{room}")
    void testPostChatFromRestPersistsAndBroadcastsForBidder() {
        User u = new User();
        u.setId(15L);
        u.setUserName("bidder1");
        UserInfo ui = new UserInfo();
        ui.setFullName("Trần Văn A");

        when(roomRoleResolver.resolveBySessionCode(15L, "SES-HN-30K56789")).thenReturn(RoomRoleEnum.BIDDER);
        when(userRepository.findById(15L)).thenReturn(Optional.of(u));
        when(userInfoRepository.findByUserName("bidder1")).thenReturn(Optional.of(ui));
        when(auctionSessionRepository.findBySessionCode("SES-HN-30K56789")).thenReturn(Optional.empty());
        when(roomChatMessageRepository.save(any(RoomChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));

        ChatMessageVO res = roomChatService.postChatFromRest("SES-HN-30K56789", 15L, "fallback", "Chúc may mắn");
        assertNotNull(res);
        assertEquals("15", res.getSenderId());
        assertEquals("Trần Văn A", res.getSenderName());
        verify(messagingTemplate).convertAndSend(eq("/topic/chat/SES-HN-30K56789"), any(ChatMessageVO.class));
    }
}

