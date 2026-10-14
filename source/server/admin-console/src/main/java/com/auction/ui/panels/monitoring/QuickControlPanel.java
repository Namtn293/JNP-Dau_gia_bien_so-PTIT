package com.auction.ui.panels.monitoring;

import static com.auction.ui.Theme.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridLayout;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.concurrent.CompletableFuture;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.BorderFactory;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.text.StyledDocument;

import com.auction.AdminConfig;
import com.auction.gateway.AdminGateway;
import com.auction.model.CommandResult;
import com.auction.model.RoomInfo;
import com.auction.ui.panels.LogPanel;

public class QuickControlPanel extends JPanel {
    private final AdminGateway gateway;
    private final StyledDocument logDocument;

    private final List<Consumer<String>> roomPickedListeners = new ArrayList<>();
    private Runnable commandCompletedListener;
    private List<String> roomOptions = List.of();
    // true khi đang đồng bộ combo bằng code: bỏ qua sự kiện do chính code tạo ra
    private boolean syncing;

    private JLabel plateLabel;
    private JLabel roomInfoLabel;
    private JLabel statusLabel;
    private JComboBox<String> roomComboBox;
    private JTextField kickAccountField;

    private JButton haltButton;
    private JButton resumeButton;
    private JButton kickButton;
    private JButton cancelButton;

    public QuickControlPanel(AdminGateway gateway, StyledDocument logDocument) {
        this.gateway = gateway;
        this.logDocument = logDocument;

        initializeUI();
        attachListeners();

        // Chưa có phòng nào được chọn: tắt các nút điều khiển
        setButtonEnabled(haltButton, false, COLOR_DANGER);
        setButtonEnabled(resumeButton, false, COLOR_PRIMARY);
        setCancelEnabled(false);
        refreshKickButton();
    }

    // ===== API cho MonitoringPanel =====

    /** Hiển thị thông tin phòng và bật/tắt nút theo trạng thái phòng đó. */
    public void showRoom(RoomInfo room) {
        plateLabel.setText(room.plate());
        roomInfoLabel.setText(room.id() + " • " + room.region());
        statusLabel.setText("• " + room.status().label());

        syncing = true;
        try {
            roomComboBox.setSelectedItem(room.id());
        } finally {
            syncing = false;
        }

        setButtonEnabled(haltButton, room.status().canHalt(), COLOR_DANGER);
        setButtonEnabled(resumeButton, room.status().canResume(), COLOR_PRIMARY);
        setCancelEnabled(!room.status().isFinished());
    }

    /** Cập nhật danh sách mã phòng trong combo, giữ nguyên lựa chọn hiện tại. */
    public void setRoomOptions(List<String> roomIds) {
        if (roomIds.equals(roomOptions)) {
            return;
        }
        roomOptions = List.copyOf(roomIds);
        String current = selectedRoomId();

        syncing = true;
        try {
            roomComboBox.setModel(new DefaultComboBoxModel<>(roomOptions.toArray(new String[0])));
            if (current != null) {
                roomComboBox.setSelectedItem(current);
            }
        } finally {
            syncing = false;
        }
    }

    /** Người dùng đổi phòng trong combo. */
    public void addRoomPickedListener(Consumer<String> listener) {
        roomPickedListeners.add(listener);
    }

    /** Gọi sau khi một lệnh có kết quả, để MonitoringPanel làm mới dữ liệu. */
    public void setOnCommandCompleted(Runnable listener) {
        this.commandCompletedListener = listener;
    }

    // ===== Giao diện =====

    private void initializeUI() {
        setLayout(new BorderLayout());
        setBackground(Color.WHITE);
        setBorder(BorderFactory.createEmptyBorder(12, 16, 12, 16));

        JPanel contentWrapper = new JPanel();
        contentWrapper.setLayout(new BoxLayout(contentWrapper, BoxLayout.Y_AXIS));
        contentWrapper.setOpaque(false);

        contentWrapper.add(createRoomInfoPanel());
        contentWrapper.add(Box.createVerticalStrut(16));
        contentWrapper.add(createControlPanel());

        add(contentWrapper, BorderLayout.NORTH);
    }

    private JPanel createRoomInfoPanel() {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setOpaque(false);
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);

        plateLabel = createLeftLabel("—", FONT_VALUE.deriveFont(20f), COLOR_TEXT);
        roomInfoLabel = createLeftLabel("", FONT_NORMAL, COLOR_TEXT);
        statusLabel = createLeftLabel("", FONT_SMALL, COLOR_MUTED);

        panel.add(plateLabel);
        panel.add(Box.createVerticalStrut(4));
        panel.add(roomInfoLabel);
        panel.add(Box.createVerticalStrut(2));
        panel.add(statusLabel);

        return panel;
    }

    private Component createControlPanel() {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setOpaque(false);
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);

        panel.add(createLeftLabel("ID phòng mục tiêu", FONT_NORMAL, COLOR_TEXT));
        panel.add(Box.createVerticalStrut(4));

        roomComboBox = new JComboBox<>();
        roomComboBox.setFont(FONT_NORMAL);
        roomComboBox.setAlignmentX(Component.LEFT_ALIGNMENT);
        roomComboBox.setMaximumSize(new Dimension(Short.MAX_VALUE, 32));
        panel.add(roomComboBox);
        panel.add(Box.createVerticalStrut(12));

        panel.add(createLeftLabel("ID tài khoản cần ngắt kết nối", FONT_NORMAL, COLOR_TEXT));
        panel.add(Box.createVerticalStrut(4));

        kickAccountField = new JTextField(AdminConfig.DEFAULT_KICK_ACCOUNT);
        kickAccountField.setFont(FONT_NORMAL);
        kickAccountField.setAlignmentX(Component.LEFT_ALIGNMENT);
        kickAccountField.setMaximumSize(new Dimension(Short.MAX_VALUE, 32));
        panel.add(kickAccountField);
        panel.add(Box.createVerticalStrut(16));

        panel.add(createButtonPanel());

        return panel;
    }

    private JPanel createButtonPanel() {
        JPanel gridPanel = new JPanel(new GridLayout(2, 2, 10, 12));
        gridPanel.setOpaque(false);
        gridPanel.setAlignmentX(Component.LEFT_ALIGNMENT);
        gridPanel.setMinimumSize(new Dimension(280, 240));
        gridPanel.setPreferredSize(new Dimension(280, 240));
        gridPanel.setMaximumSize(new Dimension(Short.MAX_VALUE, 240));

        haltButton = createButton("HALT", COLOR_DANGER);
        resumeButton = createButton("RESUME", COLOR_PRIMARY);
        kickButton = createButton("KICK", COLOR_DANGER);
        cancelButton = createCancelButton("CANCEL");

        gridPanel.add(createActionGroup(haltButton,
                "<html>HALT tạm dừng phiên, khóa đặt giá.<br>Đếm ngược bị đóng băng.</html>"));
        gridPanel.add(createActionGroup(resumeButton,
                "<html>RESUME mở lại đặt giá, cộng " + AdminConfig.EXTENSION_SECONDS
                        + " giây.<br>Đếm ngược được cập nhật sau lệnh.</html>"));
        gridPanel.add(createActionGroup(kickButton,
                "<html>KICK cưỡng chế ngắt kết nối WebSocket<br>của tài khoản.</html>"));
        gridPanel.add(createActionGroup(cancelButton,
                "<html>CANCEL hủy phiên, hoàn 100% tiền cọc.<br>Bắt buộc xác nhận trước khi gửi.</html>"));

        return gridPanel;
    }

    private JPanel createActionGroup(JButton button, String descHtml) {
        JPanel group = new JPanel(new BorderLayout(0, 4));
        group.setOpaque(false);

        JLabel desc = new JLabel(descHtml);
        desc.setFont(FONT_SMALL);
        desc.setForeground(COLOR_MUTED);
        desc.setVerticalAlignment(SwingConstants.TOP);

        group.add(button, BorderLayout.NORTH);
        group.add(desc, BorderLayout.CENTER);
        return group;
    }

    private JLabel createLeftLabel(String text, Font font, Color color) {
        JLabel label = new JLabel(text);
        label.setFont(font);
        label.setForeground(color);
        label.setAlignmentX(Component.LEFT_ALIGNMENT);
        return label;
    }

    private JButton createButton(String text, Color bgColor) {
        JButton button = new JButton(text);
        button.setFont(FONT_NORMAL.deriveFont(Font.BOLD));
        button.setForeground(Color.WHITE);
        button.setBackground(bgColor);
        button.setOpaque(true);
        button.setBorderPainted(false);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(100, 36));
        return button;
    }

    private JButton createCancelButton(String text) {
        JButton button = new JButton(text);
        button.setFont(FONT_NORMAL.deriveFont(Font.BOLD));
        button.setOpaque(false);
        button.setContentAreaFilled(false);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(100, 36));
        return button;
    }

    /** Nút đặc: nền màu khi bật, nền xám khi tắt. */
    private void setButtonEnabled(JButton button, boolean enabled, Color activeColor) {
        button.setEnabled(enabled);
        button.setBackground(enabled ? activeColor : COLOR_BORDER);
        button.setForeground(enabled ? Color.WHITE : COLOR_MUTED);
    }

    /** Nút viền: viền và chữ đỏ khi bật, xám khi tắt. */
    private void setCancelEnabled(boolean enabled) {
        Color color = enabled ? COLOR_DANGER : COLOR_BORDER;
        cancelButton.setEnabled(enabled);
        cancelButton.setForeground(enabled ? COLOR_DANGER : COLOR_MUTED);
        cancelButton.setBorder(BorderFactory.createLineBorder(color, 2));
    }

    private void refreshKickButton() {
        boolean hasAccount = !kickAccountField.getText().trim().isEmpty();
        setButtonEnabled(kickButton, hasAccount, COLOR_DANGER);
    }

    private String selectedRoomId() {
        return (String) roomComboBox.getSelectedItem();
    }

    // ===== Sự kiện =====

    private void attachListeners() {
        roomComboBox.addActionListener(e -> {
            if (syncing) {
                return;
            }
            String roomId = selectedRoomId();
            if (roomId != null) {
                for (Consumer<String> listener : roomPickedListeners) {
                    listener.accept(roomId);
                }
            }
        });

        haltButton.addActionListener(e -> {
            String roomId = selectedRoomId();
            sendCommand("> HALT " + roomId, gateway.halt(roomId));
        });

        resumeButton.addActionListener(e -> {
            String roomId = selectedRoomId();
            sendCommand("> RESUME " + roomId, gateway.resume(roomId));
        });

        kickButton.addActionListener(e -> {
            String roomId = selectedRoomId();
            String account = kickAccountField.getText().trim();
            sendCommand("> KICK " + account + " (từ phòng " + roomId + ")",
                    gateway.kick(account, roomId));
        });

        cancelButton.addActionListener(e -> confirmAndCancel());

        kickAccountField.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) {
                refreshKickButton();
            }

            @Override
            public void removeUpdate(DocumentEvent e) {
                refreshKickButton();
            }

            @Override
            public void changedUpdate(DocumentEvent e) {
                refreshKickButton();
            }
        });
    }

    private void confirmAndCancel() {
        String roomId = selectedRoomId();
        int confirm = JOptionPane.showConfirmDialog(
                SwingUtilities.getWindowAncestor(this),
                "Hủy phiên " + roomId + "?\nHoàn 100% tiền cọc cho tất cả mọi người.",
                "Xác nhận Cancel",
                JOptionPane.OK_CANCEL_OPTION,
                JOptionPane.WARNING_MESSAGE);

        if (confirm == JOptionPane.OK_OPTION) {
            sendCommand("> CANCEL " + roomId, gateway.cancel(roomId));
        }
    }

    /**
     * Ghi lệnh vào nhật ký, chờ kết quả từ gateway rồi ghi kết quả.
     * Mọi cập nhật giao diện đều được chuyển về EDT.
     */
    private void sendCommand(String commandLog, CompletableFuture<CommandResult> future) {
        LogPanel.appendTo(logDocument, LogPanel.Level.COMMAND, commandLog);

        future.thenAccept(result -> SwingUtilities.invokeLater(() -> {
            LogPanel.appendTo(logDocument,
                    result.success() ? LogPanel.Level.SUCCESS : LogPanel.Level.ERROR,
                    result.message());
            if (commandCompletedListener != null) {
                commandCompletedListener.run();
            }
        })).exceptionally(ex -> {
            SwingUtilities.invokeLater(() ->
                    LogPanel.appendTo(logDocument, LogPanel.Level.ERROR,
                            "Không gửi được lệnh: " + ex.getMessage()));
            return null;
        });
    }
}