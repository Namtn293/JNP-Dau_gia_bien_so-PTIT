package com.auction.ui.panels.control.session;

import static com.auction.ui.common.Theme.*;
import static com.auction.ui.common.UiKit.*;

import java.awt.GridLayout;

import javax.swing.JLabel;
import javax.swing.JPanel;

import com.auction.AdminConfig;
import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;

/** Thẻ phiên đang chọn: mã phòng, đồng hồ, giá hiện tại, số người tham gia. */
public class SessionInfoCard extends JPanel {
    private final JLabel roomIdLabel = caption("—");
    private final JLabel plateLabel = value("—", 22f);
    private final JLabel statusLabel = caption("—");
    private final JLabel countdownTitleLabel = caption("ĐẾM NGƯỢC");
    private final JLabel countdownLabel = value("—", 22f);
    private final JLabel priceLabel = value("—", 22f);
    private final JLabel peopleLabel = value("—", 16f);

    public SessionInfoCard() {
        setLayout(new GridLayout(1, 4, 16, 0));
        applyCardStyle(this);

        JLabel priceTitle = caption("GIÁ HIỆN TẠI (VNĐ)");
        JLabel depositLabel = caption("Tiền cọc: " + formatVnd(AdminConfig.DEPOSIT_VND) + " VNĐ / người");

        add(stack(roomIdLabel, plateLabel, statusLabel));
        add(stack(countdownTitleLabel, countdownLabel,
                caption("Sau RESUME: cộng " + AdminConfig.EXTENSION_SECONDS + " giây")));
        add(stack(priceTitle, priceLabel,
                caption("Khởi điểm " + formatVnd(AdminConfig.START_PRICE_VND)
                        + " • Bước giá " + formatVnd(AdminConfig.BID_STEP_VND))));
        add(stack(peopleLabel, depositLabel,
                caption("Có lượt đặt giá trong " + AdminConfig.LATE_BID_WINDOW_SECONDS + "s cuối: gia hạn "
                        + AdminConfig.EXTENSION_SECONDS + " giây")));
    }

    /** Hiển thị phòng. Truyền null để đưa thẻ về trạng thái trống. */
    public void setRoom(RoomInfo room) {
        if (room == null) {
            roomIdLabel.setText("—");
            plateLabel.setText("—");
            statusLabel.setText("—");
            statusLabel.setForeground(COLOR_MUTED);
            countdownTitleLabel.setText("ĐẾM NGƯỢC");
            countdownLabel.setText("—");
            countdownLabel.setForeground(COLOR_TEXT);
            priceLabel.setText("—");
            peopleLabel.setText("—");
            return;
        }

        roomIdLabel.setText(room.id() + " • " + room.region());
        plateLabel.setText(room.plate());
        statusLabel.setText("• " + room.status().label());
        statusLabel.setForeground(statusColor(room.status()));

        boolean paused = room.status() == RoomStatus.PAUSED;
        countdownTitleLabel.setText(paused ? "ĐẾM NGƯỢC ĐÓNG BĂNG" : "ĐẾM NGƯỢC");
        countdownLabel.setText(room.remainingLabel());
        countdownLabel.setForeground(paused ? COLOR_WARNING : COLOR_TEXT);

        priceLabel.setText(formatVnd(room.currentPrice()));
        peopleLabel.setText(room.participantCount() + " người tham gia");
    }
}