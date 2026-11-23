package com.ptit.bigdata.coreservice.mail;

import java.util.concurrent.CompletableFuture;

/**
 * Service gửi email thông báo kết quả đấu giá.
 */
public interface AuctionMailService {

    /**
     * Gửi email biên bản / thông báo trúng đấu giá bất đồng bộ cho người chiến thắng.
     *
     * @param roomCode Mã phiên đấu giá (ví dụ: SES-HN-30K56789)
     * @param plateNumber Biển số đấu giá (ví dụ: 30K-567.89)
     * @param finalPrice Mức giá trúng đấu giá
     * @param deposit Tiền cọc đã nộp
     * @param winnerUserId ID người dùng trúng đấu giá
     * @return CompletableFuture hoàn tất sau khi email được gửi
     */
    CompletableFuture<Void> sendWinnerNoticeAsync(
            String roomCode,
            String plateNumber,
            long finalPrice,
            long deposit,
            Long winnerUserId
    );
}
