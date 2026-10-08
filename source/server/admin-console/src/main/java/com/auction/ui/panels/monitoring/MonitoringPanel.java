package com.auction.ui.panels.monitoring;

import com.auction.ui.panels.monitoring.MetricCardsPanel;
import com.auction.ui.panels.monitoring.RoomTablePanel;
import com.auction.ui.panels.monitoring.QuickControlPanel;
import com.auction.ui.panels.LogPanel;

import java.awt.BorderLayout;
import java.awt.Dimension;

import javax.swing.*;
import javax.swing.text.StyledDocument;

public class MonitoringPanel extends JPanel {
    private LogPanel logPanel;
    private MetricCardsPanel metricCardsPanel;
    private QuickControlPanel quickControlPanel;
    private RoomTablePanel roomTablePanel;

    // ==== TRANG MONITORING ====
    public MonitoringPanel(StyledDocument logDocument) {
        setLayout(new BorderLayout(0, 16));
        setBorder(BorderFactory.createEmptyBorder(16, 20, 16, 20));

        // North
        metricCardsPanel = new MetricCardsPanel();
        add(metricCardsPanel, BorderLayout.NORTH);

        // Center
        JPanel centerPanel = new JPanel(new BorderLayout(16, 0));
        centerPanel.setOpaque(false);

        roomTablePanel = new RoomTablePanel();
        centerPanel.add(roomTablePanel, BorderLayout.CENTER);

        quickControlPanel = new QuickControlPanel(logDocument);

        JScrollPane quickScrollPane = new JScrollPane(quickControlPanel);
        quickScrollPane.setPreferredSize(new Dimension(330, 0)); // Tăng thêm 10px chiều rộng để chứa thanh cuộn
        quickScrollPane.setBorder(BorderFactory.createEmptyBorder()); // Xóa viền ngoài
        quickScrollPane.setOpaque(false);
        quickScrollPane.getViewport().setOpaque(false);
        quickScrollPane.getVerticalScrollBar().setUnitIncrement(16); // Tăng tốc độ cuộn chuột

        centerPanel.add(roomTablePanel, BorderLayout.CENTER);

        centerPanel.add(quickScrollPane, BorderLayout.EAST);

        add(centerPanel, BorderLayout.CENTER);

        // South
        logPanel = new LogPanel(logDocument);
        logPanel.setPreferredSize(new Dimension(0, 190));
        add(logPanel, BorderLayout.SOUTH);

        connectTableSelectionListener(roomTablePanel, quickControlPanel);
    }

    private void connectTableSelectionListener(RoomTablePanel roomTablePanel, QuickControlPanel quickControlPanel) {
        JTable table = roomTablePanel.getRoomTable();

        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                int selectedRow = table.getSelectedRow();

                if (selectedRow >= 0) {
                    // Lấy dữ liệu từ hàng được chọn
                    String roomId= (String) table.getValueAt(selectedRow, 0);
                    String plateNumber = (String) table.getValueAt(selectedRow, 1);
                    String status = (String) table.getValueAt(selectedRow, 2);

                    // Tạo chuỗi thông tin phòng
                    String roomInfo = " • " + plateNumber + "     • " + status;

                    // Cập nhật QuickControlPanel
                    quickControlPanel.updateRoom(roomId, "Hà Nội", roomInfo);
                }
            }
        });
    }
}
