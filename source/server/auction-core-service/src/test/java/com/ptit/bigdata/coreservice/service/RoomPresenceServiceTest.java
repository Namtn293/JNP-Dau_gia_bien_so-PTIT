package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
import com.ptit.bigdata.coreservice.model.vo.BidMessageVO;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.service.implement.RoomPresenceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomPresenceServiceTest {

    @Mock
    private AuctionSessionRepository auctionSessionRepository;
    @Mock
    private NumberPlateRepository numberPlateRepository;
    @Mock
    private RoomRoleResolver roomRoleResolver;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private RoomPresenceServiceImpl presenceService;

    @BeforeEach
    void setUp() {
        presenceService = new RoomPresenceServiceImpl(
                auctionSessionRepository,
                numberPlateRepository,
                roomRoleResolver,
                messagingTemplate
        );
    }

    private void stubRoom(String sessionCode, Long plateId, String plateNumber) {
        AuctionSession session = AuctionSession.builder()
                .sessionCode(sessionCode)
                .numberPlateId(plateId)
                .build();
        session.setId(10L);
        NumberPlate plate = NumberPlate.builder()
                .plateNumber(plateNumber)
                .build();
        plate.setId(plateId);

        lenient().when(auctionSessionRepository.findBySessionCode(sessionCode)).thenReturn(Optional.of(session));
        lenient().when(numberPlateRepository.findById(plateId)).thenReturn(Optional.of(plate));
        lenient().when(numberPlateRepository.findByPlateNumber(plateNumber)).thenReturn(Optional.of(plate));
        lenient().when(auctionSessionRepository.findFirstByNumberPlateId(plateId)).thenReturn(Optional.of(session));
        lenient().when(roomRoleResolver.resolveBySessionCode(anyLong(), eq(sessionCode))).thenReturn(RoomRoleEnum.BIDDER);
    }

    @Test
    @DisplayName("1 người mở nhiều tab vào cùng phòng chỉ được tính là 1 người trên DB và không spam JOIN")
    void testSingleUserMultipleTabsCountedOnce() {
        stubRoom("SES-HN-30K99999", 1L, "30K-999.99");

        // Tab 1 vào phòng -> DB cập nhật 1, broadcast JOIN + PARTICIPANT_UPDATE
        presenceService.joinRoom("SES-HN-30K99999", 5L, "Nam Trần", "ws-tab-1");
        assertEquals(1, presenceService.getParticipantCount("SES-HN-30K99999"));
        assertTrue(presenceService.isUserOnline("SES-HN-30K99999", 5L));
        verify(auctionSessionRepository, times(1))
                .updateParticipantCountBySessionCode(eq("SES-HN-30K99999"), eq(1L), any(LocalDateTime.class));

        // Tab 2 của cùng user vào lại phòng -> vẫn chỉ tính là 1, KHÔNG tăng DB, KHÔNG spam JOIN
        presenceService.joinRoom("SES-HN-30K99999", 5L, "Nam Trần", "ws-tab-2");
        assertEquals(1, presenceService.getParticipantCount("SES-HN-30K99999"));
        verify(auctionSessionRepository, times(1))
                .updateParticipantCountBySessionCode(anyString(), anyLong(), any(LocalDateTime.class));
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/room/SES-HN-30K99999"), any(RoomEventVO.class));

        // Đóng Tab 2 (Tab 1 vẫn mở) -> vẫn tính là 1, KHÔNG giảm DB, KHÔNG gửi LEAVE
        presenceService.handleDisconnect("ws-tab-2");
        assertEquals(1, presenceService.getParticipantCount("SES-HN-30K99999"));
        assertTrue(presenceService.isUserOnline("SES-HN-30K99999", 5L));
        verify(auctionSessionRepository, times(1))
                .updateParticipantCountBySessionCode(anyString(), anyLong(), any(LocalDateTime.class));

        // Đóng Tab 1 (tab cuối cùng) -> giảm về 0, cập nhật DB = 0, gửi LEAVE + PARTICIPANT_UPDATE
        presenceService.handleDisconnect("ws-tab-1");
        assertEquals(0, presenceService.getParticipantCount("SES-HN-30K99999"));
        assertFalse(presenceService.isUserOnline("SES-HN-30K99999", 5L));
        verify(auctionSessionRepository, times(1))
                .updateParticipantCountBySessionCode(eq("SES-HN-30K99999"), eq(0L), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("1 người vào phòng -> thoát ra -> vào lại nhiều lần vẫn luôn tính tối đa là 1")
    void testRejoinSameUserNeverAccumulates() {
        stubRoom("SES-HN-30K99999", 1L, "30K-999.99");

        presenceService.joinRoom("SES-HN-30K99999", 5L, "Nam Trần", "ws-1");
        assertEquals(1, presenceService.getParticipantCount("SES-HN-30K99999"));

        presenceService.leaveRoom("SES-HN-30K99999", 5L, "ws-1");
        assertEquals(0, presenceService.getParticipantCount("SES-HN-30K99999"));

        presenceService.joinRoom("SES-HN-30K99999", 5L, "Nam Trần", "ws-2");
        assertEquals(1, presenceService.getParticipantCount("SES-HN-30K99999"));

        verify(auctionSessionRepository, times(2))
                .updateParticipantCountBySessionCode(eq("SES-HN-30K99999"), eq(1L), any(LocalDateTime.class));
        verify(auctionSessionRepository, times(1))
                .updateParticipantCountBySessionCode(eq("SES-HN-30K99999"), eq(0L), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("2 người khác nhau vào cùng phòng (kể cả truyền plateNumber alias) -> đếm đúng 2 và đồng bộ DB")
    void testTwoDistinctUsersAndPlateAlias() {
        stubRoom("SES-HN-30K99999", 1L, "30K-999.99");

        presenceService.joinRoom("SES-HN-30K99999", 5L, "Nam Trần", "ws-a");
        presenceService.joinRoom("30K-999.99", 9L, "Minh Anh", "ws-b");

        assertEquals(2, presenceService.getParticipantCount("SES-HN-30K99999"));
        assertEquals(2, presenceService.getOnlineParticipants("SES-HN-30K99999").size());

        verify(auctionSessionRepository)
                .updateParticipantCountBySessionCode(eq("SES-HN-30K99999"), eq(1L), any(LocalDateTime.class));
        verify(auctionSessionRepository)
                .updateParticipantCountBySessionCode(eq("SES-HN-30K99999"), eq(2L), any(LocalDateTime.class));

        ArgumentCaptor<BidMessageVO> dashboardCaptor = ArgumentCaptor.forClass(BidMessageVO.class);
        verify(messagingTemplate, times(2))
                .convertAndSend(eq("/topic/auctions"), dashboardCaptor.capture());
        BidMessageVO latest = dashboardCaptor.getAllValues().get(1);
        assertEquals("PARTICIPANT_UPDATE", latest.getType());
        assertEquals("SES-HN-30K99999", latest.getRoomId());
        assertEquals("30K-999.99", latest.getPlateNumber());
        assertEquals(2, latest.getParticipantCount());

        // User 5 rời phòng -> giảm về 1
        presenceService.leaveRoom("SES-HN-30K99999", 5L, "ws-a");
        assertEquals(1, presenceService.getParticipantCount("SES-HN-30K99999"));
        assertFalse(presenceService.isUserOnline("SES-HN-30K99999", 5L));
        assertTrue(presenceService.isUserOnline("SES-HN-30K99999", 9L));
    }

    @Test
    @DisplayName("KICK user khỏi phòng: xóa mọi tab, giảm DB về đúng số còn lại, broadcast KICK và chặn vào lại")
    void testKickUserRemovesAllTabsUpdatesDbAndBlocksRejoin() {
        stubRoom("SES-HN-30K99999", 1L, "30K-999.99");
        stubRoom("SES-HN-30K88888", 2L, "30K-888.88");

        // User 5 mở 2 tab + User 9 mở 1 tab ở phòng 30K99999 -> tổng 2 người
        presenceService.joinRoom("SES-HN-30K99999", 5L, "Nam Trần", "ws-5-tab1");
        presenceService.joinRoom("SES-HN-30K99999", 5L, "Nam Trần", "ws-5-tab2");
        presenceService.joinRoom("SES-HN-30K99999", 9L, "Minh Anh", "ws-9-tab1");
        assertEquals(2, presenceService.getParticipantCount("SES-HN-30K99999"));

        // Kick User 5 khỏi phòng 30K99999
        boolean wasOnline = presenceService.kickUser("SES-HN-30K99999", 5L, "Nam Trần");
        assertTrue(wasOnline);
        assertTrue(presenceService.isUserKicked("SES-HN-30K99999", 5L));
        assertFalse(presenceService.isUserOnline("SES-HN-30K99999", 5L));
        assertEquals(1, presenceService.getParticipantCount("SES-HN-30K99999"));
        verify(auctionSessionRepository, atLeastOnce())
                .updateParticipantCountBySessionCode(eq("SES-HN-30K99999"), eq(1L), any(LocalDateTime.class));

        // Kiểm tra broadcast KICK chứa đúng userId và participantCount = 1
        ArgumentCaptor<RoomEventVO> roomEventCaptor = ArgumentCaptor.forClass(RoomEventVO.class);
        verify(messagingTemplate, atLeastOnce())
                .convertAndSend(eq("/topic/room/SES-HN-30K99999"), roomEventCaptor.capture());
        RoomEventVO kickEvent = roomEventCaptor.getAllValues().get(roomEventCaptor.getAllValues().size() - 1);
        assertEquals("KICK", kickEvent.getEvent());
        assertEquals(5L, kickEvent.getUserId());
        assertEquals(1, kickEvent.getParticipantCount());

        // User 5 cố vào lại phòng 30K99999 -> bị chặn, số lượng giữ nguyên 1
        presenceService.joinRoom("SES-HN-30K99999", 5L, "Nam Trần", "ws-5-rejoin");
        assertFalse(presenceService.isUserOnline("SES-HN-30K99999", 5L));
        assertEquals(1, presenceService.getParticipantCount("SES-HN-30K99999"));

        // User 5 vẫn có thể vào phòng khác bình thường
        assertFalse(presenceService.isUserKicked("SES-HN-30K88888", 5L));
        presenceService.joinRoom("SES-HN-30K88888", 5L, "Nam Trần", "ws-5-other");
        assertTrue(presenceService.isUserOnline("SES-HN-30K88888", 5L));
        assertEquals(1, presenceService.getParticipantCount("SES-HN-30K88888"));

        // UNKICK User 5 khỏi phòng 30K99999 -> mở khóa và cho phép vào lại
        assertEquals(java.util.List.of("SES-HN-30K99999"), presenceService.getKickedRoomsOfUser(5L));
        assertTrue(presenceService.unkickUser("SES-HN-30K99999", 5L));
        assertFalse(presenceService.unkickUser("SES-HN-30K99999", 5L));
        assertFalse(presenceService.isUserKicked("SES-HN-30K99999", 5L));

        presenceService.joinRoom("SES-HN-30K99999", 5L, "Nam Trần", "ws-5-rejoin-ok");
        assertTrue(presenceService.isUserOnline("SES-HN-30K99999", 5L));
        assertEquals(2, presenceService.getParticipantCount("SES-HN-30K99999"));
    }
}
