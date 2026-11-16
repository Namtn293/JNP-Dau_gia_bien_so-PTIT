package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.entity.AuctionRegistration;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.AdminCommandResultVO;
import com.ptit.bigdata.coreservice.repository.*;
import com.ptit.bigdata.coreservice.service.implement.AdminAuctionServiceImplement;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAuctionServiceTest {
    @Mock private AuctionSessionRepository auctionSessionRepository;
    @Mock private NumberPlateRepository numberPlateRepository;
    @Mock private ProvinceRepository provinceRepository;
    @Mock private BidHistoryRepository bidHistoryRepository;
    @Mock private UserInfoRepository userInfoRepository;
    @Mock private UserRepository userRepository;
    @Mock private AuctionRegistrationRepository auctionRegistrationRepository;
    @Mock private WalletService walletService;
    @Mock private AutoBidScheduler autoBidScheduler;
    @Mock private KickedUserRegistry kickedUserRegistry;
    @Mock private MetricsSampler metricsSampler;

    private AdminAuctionServiceImplement service;

    @BeforeEach
    void setUp() {
        service = new AdminAuctionServiceImplement(auctionSessionRepository, numberPlateRepository,
                provinceRepository, bidHistoryRepository, userInfoRepository, userRepository,
                auctionRegistrationRepository, walletService, autoBidScheduler,
                kickedUserRegistry, metricsSampler);
    }

    @Test
    void getRoomsReturnsEmptyListWhenDatabaseHasNoSessions() {
        when(auctionSessionRepository.findAll()).thenReturn(List.of());

        assertTrue(service.getRooms().isEmpty());
        verifyNoInteractions(numberPlateRepository, provinceRepository, auctionRegistrationRepository);
    }

    @Test
    void participantsUseAuthUserIdAndProfileJoinedByUsername() {
        AuctionSession session = session(AuctionStatusEnum.LIVE);
        AuctionRegistration registration = AuctionRegistration.builder()
                .userId(9L).sessionId(2L).depositAmount(40_000_000L).status(RegistrationStatusEnum.ACTIVE).build();
        User authUser = new User();
        authUser.setId(9L);
        authUser.setUserName("test");
        UserInfo profile = new UserInfo();
        profile.setId(7L);
        profile.setUserName("test");
        profile.setFullName("Test User");
        when(auctionSessionRepository.findBySessionCode("ROOM-2")).thenReturn(Optional.of(session));
        when(bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(2L)).thenReturn(List.of());
        when(auctionRegistrationRepository.findBySessionIdAndStatus(2L, RegistrationStatusEnum.ACTIVE))
                .thenReturn(List.of(registration));
        when(userRepository.findAllById(anyCollection())).thenReturn(List.of(authUser));
        when(userInfoRepository.findByUserNameIn(anyCollection())).thenReturn(List.of(profile));

        var participant = service.getParticipants("ROOM-2").get(0);

        assertEquals("9", participant.getUserId());
        assertEquals("Test User", participant.getFullName());
        assertEquals("BIDDER", participant.getRole());
        assertEquals("UNKNOWN", participant.getConnection());
        assertEquals(0, participant.getRttMs());
    }

    @Test
    void haltPersistsPausedStateAndRejectsNonLiveSessions() {
        AuctionSession session = session(AuctionStatusEnum.LIVE);
        when(auctionSessionRepository.findBySessionCodeForUpdate("ROOM-2")).thenReturn(Optional.of(session));

        AdminCommandResultVO result = service.halt("ROOM-2");

        assertTrue(result.isSuccess());
        assertEquals(AuctionStatusEnum.PAUSED, session.getStatus());
        verify(auctionSessionRepository).save(session);
    }

    @Test
    void haltRejectsSessionThatIsNotLive() {
        AuctionSession session = session(AuctionStatusEnum.SOON);
        when(auctionSessionRepository.findBySessionCodeForUpdate("ROOM-2")).thenReturn(Optional.of(session));

        AdminCommandResultVO result = service.halt("ROOM-2");

        assertFalse(result.isSuccess());
        assertEquals(AuctionStatusEnum.SOON, session.getStatus());
        verify(auctionSessionRepository, never()).save(any());
    }

    @Test
    void cancelRefundsActiveRegistrations() {
        AuctionSession session = session(AuctionStatusEnum.LIVE);
        when(auctionSessionRepository.findBySessionCodeForUpdate("ROOM-2")).thenReturn(Optional.of(session));
        when(walletService.handleSessionCancelled(2L)).thenReturn(2);

        AdminCommandResultVO result = service.cancel("ROOM-2");

        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("2 đăng ký"));
        assertEquals(AuctionStatusEnum.END, session.getStatus());
        verify(walletService).handleSessionCancelled(2L);
        verify(autoBidScheduler).cancelSessionTasks(2L);
    }

    private static AuctionSession session(AuctionStatusEnum status) {
        AuctionSession session = new AuctionSession();
        session.setId(2L);
        session.setSessionCode("ROOM-2");
        session.setStatus(status);
        session.setStartPrice(40_000_000L);
        return session;
    }
}
