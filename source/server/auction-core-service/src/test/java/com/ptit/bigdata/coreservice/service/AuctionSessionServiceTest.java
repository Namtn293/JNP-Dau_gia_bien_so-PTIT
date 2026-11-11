package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.entity.AuctionRegistration;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.PlateTypeEnum;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.AuctionWatchRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.repository.ProvinceRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.service.implement.AuctionSessionServiceImplement;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuctionSessionServiceTest {

    @Mock private AuctionSessionRepository auctionSessionRepository;
    @Mock private NumberPlateRepository numberPlateRepository;
    @Mock private ProvinceRepository provinceRepository;
    @Mock private BidHistoryRepository bidHistoryRepository;
    @Mock private UserInfoRepository userInfoRepository;
    @Mock private UserRepository userRepository;
    @Mock private RoomRoleResolver roomRoleResolver;
    @Mock private AuctionRegistrationRepository auctionRegistrationRepository;
    @Mock private WatchService watchService;
    @Mock private AuctionWatchRepository auctionWatchRepository;
    @Mock private RoomAnnouncementService roomAnnouncementService;

    private AuctionSessionServiceImplement service;

    @BeforeEach
    void setUp() {
        StepPriceCalculator stepPriceCalculator = new StepPriceCalculator(new AuctionProperties());
        service = new AuctionSessionServiceImplement(
                auctionSessionRepository,
                numberPlateRepository,
                provinceRepository,
                bidHistoryRepository,
                userInfoRepository,
                userRepository,
                stepPriceCalculator,
                roomRoleResolver,
                auctionRegistrationRepository,
                watchService,
                auctionWatchRepository,
                roomAnnouncementService
        );
    }

    @AfterEach
    void tearDown() {
        ThreadContext.userHolder.remove();
    }

    @Test
    @DisplayName("Danh sách phiên đang diễn ra phải đánh dấu isRegistered và đưa phiên đã nộp cọc lên đầu")
    void testGetAuctionSessionsPrioritizesDepositedSessions() {
        User user = new User();
        user.setId(55L);
        ThreadContext.setUserDetail(user);

        LocalDateTime now = LocalDateTime.now();
        AuctionSessionVO unreg = new AuctionSessionVO(
                "SES-HN-30K88888", "30K-888.88", "Hà Nội", PlateTypeEnum.NGU_QUY,
                40_000_000L, AuctionStatusEnum.LIVE, now.minusMinutes(10), now.plusHours(1),
                5_000_000L, 12L, null, 850_000_000L
        );
        AuctionSessionVO reg = new AuctionSessionVO(
                "SES-BN-99A99999", "99A-999.99", "Bắc Ninh", PlateTypeEnum.NGU_QUY,
                40_000_000L, AuctionStatusEnum.LIVE, now.minusMinutes(5), now.plusHours(2),
                5_000_000L, 5L, null, 50_000_000L
        );

        AuctionRegistration activeReg = AuctionRegistration.builder()
                .userId(55L)
                .sessionId(102L)
                .status(RegistrationStatusEnum.ACTIVE)
                .build();
        AuctionSession sessionEntity = AuctionSession.builder()
                .sessionCode("SES-BN-99A99999")
                .build();
        sessionEntity.setId(102L);

        when(auctionSessionRepository.getAuctionSession(any(), eq(AuctionStatusEnum.LIVE)))
                .thenReturn(new PageImpl<>(List.of(unreg, reg), PageRequest.of(0, 100), 2));
        when(auctionWatchRepository.findByUserId(55L)).thenReturn(Collections.emptyList());
        when(auctionRegistrationRepository.findByUserIdAndStatus(55L, RegistrationStatusEnum.ACTIVE))
                .thenReturn(List.of(activeReg));
        when(auctionSessionRepository.findAllById(any())).thenReturn(List.of(sessionEntity));

        Page<AuctionSessionVO> result = service.getAuctionSessions(PageRequest.of(0, 100), "LIVE");

        assertEquals(2, result.getContent().size());
        assertEquals("SES-BN-99A99999", result.getContent().get(0).getSessionCode());
        assertTrue(Boolean.TRUE.equals(result.getContent().get(0).getIsRegistered()));
        assertEquals("SES-HN-30K88888", result.getContent().get(1).getSessionCode());
        assertFalse(Boolean.TRUE.equals(result.getContent().get(1).getIsRegistered()));
    }
}

