
package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.dto.CreateAuctionSessionDTO;
import com.ptit.bigdata.coreservice.model.vo.AvailablePlateVO;
import com.ptit.bigdata.coreservice.model.vo.CreateAuctionSessionVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.repository.ProvinceRepository;
import com.ptit.bigdata.coreservice.service.StepPriceCalculator;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminAuctionSessionCreator {

    private static final List<AuctionStatusEnum> OPEN_STATUSES = List.of(
            AuctionStatusEnum.SOON,
            AuctionStatusEnum.LIVE,
            AuctionStatusEnum.PAUSED);

    private final AuctionSessionRepository sessionRepository;
    private final NumberPlateRepository plateRepository;
    private final ProvinceRepository provinceRepository;
    private final StepPriceCalculator stepPriceCalculator;

    @Transactional
    public CreateAuctionSessionVO create(CreateAuctionSessionDTO dto) {

        // 1. Kiểm tra thời gian
        LocalDateTime now = LocalDateTime.now();

        if (!dto.startTime().isAfter(now)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thời gian bắt đầu phải ở tương lai");
        }

        if (!dto.endTime().isAfter(dto.startTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thời gian kết thúc phải sau thời gian bắt đầu");
        }

        // 2. Tìm biển số thật trong database
        String plateNumber = dto.plateNumber()
                .trim()
                .toUpperCase(Locale.ROOT);

        NumberPlate plate = plateRepository
                .findByPlateNumber(plateNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Biển số không tồn tại: " + plateNumber));

        // 3. Đảm bảo biển số có tỉnh/thành hợp lệ
        if (plate.getProvinceId() == null ||
                !provinceRepository.existsById(plate.getProvinceId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Biển số chưa có tỉnh/thành hợp lệ");
        }

        // 4. Kiểm tra phiên chưa kết thúc
        boolean exists = sessionRepository
                .existsByNumberPlateIdAndStatusIn(
                        plate.getId(),
                        OPEN_STATUSES);

        if (exists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Biển số đã có phiên SOON, LIVE hoặc PAUSED");
        }

        // 5. Tạo mã phiên
        String date = now.format(
                DateTimeFormatter.ofPattern("yyyyMMdd"));

        String randomId = UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);

        String sessionCode = "SES-" + date + "-" + randomId;

        // 6. Tạo Entity
        AuctionSession session = AuctionSession.builder()
                .sessionCode(sessionCode)
                .title("Đấu giá biển số xe ô tô " + plateNumber)
                .numberPlateId(plate.getId())
                .startPrice(dto.startPrice())
                .currentPrice(dto.startPrice())
                .endPrice(0L)
                .stepPrice(
                        stepPriceCalculator.stepFor(dto.startPrice()))
                .depositAmount(dto.depositAmount())
                .startTime(dto.startTime())
                .endTime(dto.endTime())
                .status(AuctionStatusEnum.SOON)
                .bidCount(0)
                .participantCount(0L)
                .build();

        // 7. Lưu xuống PostgreSQL
        AuctionSession saved = sessionRepository.saveAndFlush(session);

        // 8. Trả kết quả
        return new CreateAuctionSessionVO(
                saved.getSessionCode(),
                plateNumber,
                saved.getStatus().name());
    }

    @Transactional(readOnly = true)
    public List<AvailablePlateVO> getAvailablePlates() {
        return plateRepository.findAvailableForAuction(OPEN_STATUSES);
    }
}
