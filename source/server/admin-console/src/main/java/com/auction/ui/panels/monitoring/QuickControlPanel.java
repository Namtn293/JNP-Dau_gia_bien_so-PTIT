package com.auction.ui.panels.monitoring;

import com.auction.ui.panels.LogPanel;

import static com.auction.ui.Theme.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridLayout;

import javax.swing.*;
import javax.swing.text.StyledDocument;

public class QuickControlPanel extends JPanel {
    private final StyledDocument logDocument;

    // Thông tin phòng
    private JLabel roomIdLabel;
    private JLabel roomLocationLabel;
    private JLabel roomStatusLabel;

    // ComboBox chọn phòng
    private JComboBox<String> roomComboBox;

    // Input field Kick
    private JTextField kickAccountField;

    // Các nút
    private JButton haltButton;
    private JButton resumeButton;
    private JButton kickButton;
    private JButton cancelButton;

    // Các label mô tả
    private JLabel haltDescLabel;
    private JLabel resumeDescLabel;
    private JLabel kickDescLabel;
    private JLabel cancelDescLabel;

    public QuickControlPanel(StyledDocument logDocument) {
        this.logDocument = logDocument;
        initializeUI();
        attachButtonListeners(logDocument);
    }

    private void initializeUI() {
        setLayout(new BorderLayout());
        setBackground(Color.WHITE);
        setBorder(BorderFactory.createEmptyBorder(12, 16, 12, 16));

        // Gom toàn bộ nội dung vào một Panel chạy dọc (Y_AXIS)
        JPanel contentWrapper = new JPanel();
        contentWrapper.setLayout(new BoxLayout(contentWrapper, BoxLayout.Y_AXIS));
        contentWrapper.setOpaque(false);

        contentWrapper.add(createRoomInfoPanel());
        contentWrapper.add(Box.createVerticalStrut(16));
        contentWrapper.add(createControlPanel());

        // Đặt nội dung vào NORTH để khóa cứng chiều cao thực tế, giúp JScrollPane nhận diện được vùng tràn
        add(contentWrapper, BorderLayout.NORTH);
    }

    private JPanel createRoomInfoPanel() {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setOpaque(false);
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);

        // Biển số
        roomIdLabel = new JLabel("30K - 999.99");
        roomIdLabel.setFont(FONT_VALUE.deriveFont(20f));
        roomIdLabel.setForeground(COLOR_TEXT);
        roomIdLabel.setAlignmentX(Component.LEFT_ALIGNMENT);

        // Địa điểm
        roomLocationLabel = new JLabel("Hà Nội");
        roomLocationLabel.setFont(FONT_NORMAL);
        roomLocationLabel.setForeground(COLOR_TEXT);
        roomLocationLabel.setAlignmentX(Component.LEFT_ALIGNMENT);

        // Trạng thái
        roomStatusLabel = new JLabel("• PAUSED • Đã khóa nhận giá");
        roomStatusLabel.setFont(FONT_SMALL);
        roomStatusLabel.setForeground(COLOR_MUTED);
        roomStatusLabel.setAlignmentX(Component.LEFT_ALIGNMENT);

        panel.add(roomIdLabel);
        panel.add(Box.createVerticalStrut(4));
        panel.add(roomLocationLabel);
        panel.add(Box.createVerticalStrut(2));
        panel.add(roomStatusLabel);

        return panel;
    }

    private Component createControlPanel() {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setOpaque(false);
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);

        // 1. Label + ComboBox chọn phòng
        JLabel roomLabel = new JLabel("ID phòng mục tiêu");
        roomLabel.setFont(FONT_NORMAL);
        roomLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        panel.add(roomLabel);
        panel.add(Box.createVerticalStrut(4));

        roomComboBox = new JComboBox<>(new String[] {
                "AUC-1021", "AUC-1022", "AUC-1023", "AUC-1024",
                "AUC-1025", "AUC-1026", "AUC-1019", "AUC-1018"
        });
        roomComboBox.setSelectedIndex(2);
        roomComboBox.setFont(FONT_NORMAL);
        roomComboBox.setAlignmentX(Component.LEFT_ALIGNMENT);
        roomComboBox.setMaximumSize(new Dimension(Short.MAX_VALUE, 32));
        panel.add(roomComboBox);
        panel.add(Box.createVerticalStrut(12));

        // 2. Label + Input field KICK
        JLabel kickLabel = new JLabel("ID tài khoản cần ngắt kết nối");
        kickLabel.setFont(FONT_NORMAL);
        kickLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        panel.add(kickLabel);
        panel.add(Box.createVerticalStrut(4));

        kickAccountField = new JTextField("U-0842");
        kickAccountField.setFont(FONT_NORMAL);
        kickAccountField.setAlignmentX(Component.LEFT_ALIGNMENT);
        kickAccountField.setMaximumSize(new Dimension(Short.MAX_VALUE, 32));
        panel.add(kickAccountField);
        panel.add(Box.createVerticalStrut(16));

        // 3. Khối 4 nút + Mô tả được tổ chức lại bằng GridLayout đồng nhất
        panel.add(createButtonPanel());

        return panel;
    }

    private JPanel createButtonPanel() {
        JPanel gridPanel = new JPanel(new GridLayout(2, 2, 10, 12));
        gridPanel.setOpaque(false);
        gridPanel.setAlignmentX(Component.LEFT_ALIGNMENT);

        // FIX CUỘN: Ép cứng PreferredSize để JScrollPane luôn nhận diện được chiều cao chuẩn 240px
        gridPanel.setMinimumSize(new Dimension(280, 240));
        gridPanel.setPreferredSize(new Dimension(280, 240));
        gridPanel.setMaximumSize(new Dimension(Short.MAX_VALUE, 240));

        // FIX KÍCH THƯỚC NÚT: Sử dụng BorderLayout thay vì BoxLayout
        // BorderLayout.NORTH sẽ ép chiều cao nút bằng chính xác 36px, không bao giờ bị kéo giãn

        // --- 1. Nhóm HALT ---
        JPanel haltGroup = new JPanel(new BorderLayout(0, 4));
        haltGroup.setOpaque(false);

        haltButton = createButton("HALT", COLOR_DANGER);
        haltDescLabel = new JLabel("<html>HALT tạm dừng phiên, khóa đặt giá.<br>Đếm ngược bị đóng băng.</html>");
        haltDescLabel.setFont(FONT_SMALL);
        haltDescLabel.setForeground(COLOR_MUTED);
        haltDescLabel.setVerticalAlignment(SwingConstants.TOP); // Ép chữ sát lên trên

        haltGroup.add(haltButton, BorderLayout.NORTH);
        haltGroup.add(haltDescLabel, BorderLayout.CENTER);

        // --- 2. Nhóm RESUME ---
        JPanel resumeGroup = new JPanel(new BorderLayout(0, 4));
        resumeGroup.setOpaque(false);

        resumeButton = createButton("RESUME", COLOR_PRIMARY);
        resumeDescLabel = new JLabel("<html>RESUME mở lại đặt giá, cộng 30 giây.<br>Đếm ngược dự kiến: 02:48.</html>");
        resumeDescLabel.setFont(FONT_SMALL);
        resumeDescLabel.setForeground(COLOR_MUTED);
        resumeDescLabel.setVerticalAlignment(SwingConstants.TOP);

        resumeGroup.add(resumeButton, BorderLayout.NORTH);
        resumeGroup.add(resumeDescLabel, BorderLayout.CENTER);

        // --- 3. Nhóm KICK ---
        JPanel kickGroup = new JPanel(new BorderLayout(0, 4));
        kickGroup.setOpaque(false);

        kickButton = createButton("KICK", COLOR_DANGER);
        kickDescLabel = new JLabel("<html>KICK cưỡng chế ngắt kết nối WebSocket<br>của tài khoản.</html>");
        kickDescLabel.setFont(FONT_SMALL);
        kickDescLabel.setForeground(COLOR_MUTED);
        kickDescLabel.setVerticalAlignment(SwingConstants.TOP);

        kickGroup.add(kickButton, BorderLayout.NORTH);
        kickGroup.add(kickDescLabel, BorderLayout.CENTER);

        // --- 4. Nhóm CANCEL ---
        JPanel cancelGroup = new JPanel(new BorderLayout(0, 4));
        cancelGroup.setOpaque(false);

        cancelButton = createCancelButton("CANCEL");
        cancelDescLabel = new JLabel("<html>CANCEL hủy phiên, hoàn 100% tiền cọc.<br>Bắt buộc xác nhận trước khi gửi.</html>");
        cancelDescLabel.setFont(FONT_SMALL);
        cancelDescLabel.setForeground(COLOR_MUTED);
        cancelDescLabel.setVerticalAlignment(SwingConstants.TOP);

        cancelGroup.add(cancelButton, BorderLayout.NORTH);
        cancelGroup.add(cancelDescLabel, BorderLayout.CENTER);

        // Thêm vào lưới
        gridPanel.add(haltGroup);
        gridPanel.add(resumeGroup);
        gridPanel.add(kickGroup);
        gridPanel.add(cancelGroup);

        return gridPanel;
    }

    private JButton createButton(String text, Color bgColor) {
        JButton button = new JButton(text);
        button.setFont(FONT_NORMAL.deriveFont(Font.BOLD));
        button.setForeground(Color.WHITE);
        button.setBackground(bgColor);
        button.setOpaque(true);
        button.setBorderPainted(false);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(100, 36)); // Khóa cứng chiều cao 36px
        return button;
    }

    private JButton createCancelButton(String text) {
        JButton button = new JButton(text);
        button.setFont(FONT_NORMAL.deriveFont(Font.BOLD));
        button.setForeground(COLOR_DANGER);
        button.setOpaque(false);
        button.setContentAreaFilled(false);
        button.setBorder(BorderFactory.createLineBorder(COLOR_DANGER, 2));
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(100, 36)); // Khóa cứng chiều cao 36px
        return button;
    }

    public void updateRoom(String roomId, String location, String status) {
        roomIdLabel.setText(roomId);
        roomLocationLabel.setText(location);
        roomStatusLabel.setText(status);

        for (int i = 0; i < roomComboBox.getItemCount(); i++) {
            if (roomComboBox.getItemAt(i).equals(roomId)) {
                roomComboBox.setSelectedIndex(i);
                break;
            }
        }
    }

    public void attachButtonListeners(StyledDocument logDocument) {
        haltButton.addActionListener(e -> {
            String roomId = roomIdLabel.getText();
            LogPanel.appendTo(logDocument, LogPanel.Level.COMMAND, "> HALT " + roomId);
        });

        resumeButton.addActionListener(e -> {
            String roomId = roomIdLabel.getText();
            LogPanel.appendTo(logDocument, LogPanel.Level.COMMAND, "> RESUME " + roomId);
        });

        kickButton.addActionListener(e -> {
            String roomId = roomIdLabel.getText();
            String accountId = kickAccountField.getText();
            LogPanel.appendTo(logDocument, LogPanel.Level.COMMAND, "> KICK " + accountId + " (từ phòng " + roomId + ")");
        });

        cancelButton.addActionListener(e -> {
            String roomId = roomIdLabel.getText();
            int confirm = JOptionPane.showConfirmDialog(null, "Hủy phiên " + roomId + "?\nHoàn 100% tiền cọc cho tất cả mọi người.",
                    "Xác nhận Cancel", JOptionPane.OK_CANCEL_OPTION, JOptionPane.WARNING_MESSAGE);
            if (confirm == JOptionPane.OK_OPTION) {
                LogPanel.appendTo(logDocument, LogPanel.Level.COMMAND, "> CANCEL " + roomId);
            }
        });
    }
}