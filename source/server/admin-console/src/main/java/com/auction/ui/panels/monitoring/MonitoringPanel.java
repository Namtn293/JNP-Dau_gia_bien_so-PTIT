package com.auction.ui.panels.monitoring;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.util.List;

import javax.swing.BorderFactory;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.SwingUtilities;
import javax.swing.Timer;
import javax.swing.text.StyledDocument;

import com.auction.AdminConfig;
import com.auction.gateway.AdminGateway;
import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;
import com.auction.ui.panels.LogPanel;

/**
 * Điều phối các thành phần trên tab Giám sát:
 * lấy dữ liệu phòng từ gateway, đưa vào bảng, đồng bộ khung điều khiển và thẻ chỉ số.
 */
public class MonitoringPanel extends JPanel {
    private static final int REFRESH_MS = 1000; // Chu kỳ 1 giây theo thiết kế

    private final AdminGateway gateway;
    private final MetricCardsPanel metricCardsPanel;
    private final RoomTablePanel roomTablePanel;
    private final QuickControlPanel quickControlPanel;
    private final Timer refreshTimer;

    public MonitoringPanel(AdminGateway gateway, StyledDocument logDocument) {
        this.gateway = gateway;

        setLayout(new BorderLayout(0, 16));
        setBorder(BorderFactory.createEmptyBorder(16, 20, 16, 20));

        // North: thẻ chỉ số
        metricCardsPanel = new MetricCardsPanel(gateway);
        add(metricCardsPanel, BorderLayout.NORTH);

        // Center: bảng phòng + điều khiển nhanh
        roomTablePanel = new RoomTablePanel();
        quickControlPanel = new QuickControlPanel(gateway, logDocument);

        JScrollPane quickScrollPane = new JScrollPane(quickControlPanel);
        quickScrollPane.setPreferredSize(new Dimension(330, 0));
        quickScrollPane.setBorder(BorderFactory.createEmptyBorder());
        quickScrollPane.setOpaque(false);
        quickScrollPane.getViewport().setOpaque(false);
        quickScrollPane.getVerticalScrollBar().setUnitIncrement(16);

        JPanel centerPanel = new JPanel(new BorderLayout(16, 0));
        centerPanel.setOpaque(false);
        centerPanel.add(roomTablePanel, BorderLayout.CENTER);
        centerPanel.add(quickScrollPane, BorderLayout.EAST);
        add(centerPanel, BorderLayout.CENTER);

        // South: nhật ký
        LogPanel logPanel = new LogPanel(logDocument);
        logPanel.setPreferredSize(new Dimension(0, 190));
        add(logPanel, BorderLayout.SOUTH);

        // Nối các thành phần
        roomTablePanel.addRoomSelectionListener(quickControlPanel::showRoom);
        quickControlPanel.addRoomPickedListener(this::onRoomPickedFromCombo);
        quickControlPanel.setOnCommandCompleted(this::refreshRooms);

        // Tải lần đầu, sau đó làm mới mỗi giây
        refreshRooms();
        refreshTimer = new Timer(REFRESH_MS, e -> refreshRooms());
        refreshTimer.start();
    }

    private void refreshRooms() {
        gateway.fetchRooms().thenAccept(rooms ->
                SwingUtilities.invokeLater(() -> applyRooms(rooms)));
    }

    private void applyRooms(List<RoomInfo> rooms) {
        roomTablePanel.setRooms(rooms);
        quickControlPanel.setRoomOptions(rooms.stream().map(RoomInfo::id).toList());

        // Phiên đang nhận giá: đang đấu giá hoặc đang gia hạn
        long activeRooms = rooms.stream()
                .filter(r -> r.status() == RoomStatus.ACTIVE || r.status() == RoomStatus.EXTENDING)
                .count();
        metricCardsPanel.setRoomSummary(rooms.size(), (int) activeRooms);

        RoomInfo selected = roomTablePanel.getSelectedRoom();
        if (selected == null) {
            // Lần đầu hoặc phòng đang chọn đã biến mất: chọn phòng mặc định
            roomTablePanel.selectRoom(AdminConfig.DEFAULT_ROOM_ID);
            selected = roomTablePanel.getSelectedRoom();
        }
        if (selected != null) {
            quickControlPanel.showRoom(selected);
        }
    }

    private void onRoomPickedFromCombo(String roomId) {
        roomTablePanel.selectRoom(roomId);
        RoomInfo room = roomTablePanel.findRoom(roomId);
        if (room != null) {
            quickControlPanel.showRoom(room);
        }
    }
}