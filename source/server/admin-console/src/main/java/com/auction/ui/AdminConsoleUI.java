package com.auction.ui;

import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

import com.auction.mail.MailConfig;
import com.auction.mail.MailMessage;
import com.auction.mail.MailService;
import com.auction.mail.MailTemplates;
import com.auction.model.AuctionResult;
import com.auction.AdminConfig;
import com.auction.gateway.mock.MockAdminGateway;
import com.auction.net.core.CoreAdminGateway;
import com.auction.net.core.CoreHttpClient;
import com.auction.net.core.CoreTcpClient;

import java.awt.BorderLayout;
import java.awt.FlowLayout;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import javax.swing.*;
import javax.swing.text.StyledDocument;

import com.auction.ui.panels.monitoring.MonitoringPanel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.auction.ui.common.Theme.*;

import com.auction.ui.common.LogPanel;
import com.auction.ui.common.RoomSelection;
import com.auction.ui.panels.control.SessionControlPanel;

import com.auction.gateway.AdminGateway;
import com.auction.net.udp.UdpAdminGateway;
import com.auction.ui.common.AlertLogger;

/**
 * AdminConsoleUI - Cửa sổ chính của Admin Console.
 * Chứa 2 tab: "Giám sát đấu giá" và "Điều khiển phiên".
 */
public class AdminConsoleUI extends JFrame {
    private static final Logger logger = LoggerFactory.getLogger(AdminConsoleUI.class);

    private JTabbedPane tabbedPane;

    private StyledDocument logDocument;
    private MailService mailService;
    private AdminGateway gateway;
    private RoomSelection roomSelection;
    private SessionControlPanel sessionControlPanel;

    public AdminConsoleUI() {
        initializeUI(); // Khởi tạo giao diện
    }

    private void initializeUI() {
        // Cấu hình cửa sổ
        setTitle("Đấu giá biển số • Quản trị viên");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1300, 920);
        setLocationRelativeTo(null);

        // Dữ liệu dùng chung
        logDocument = LogPanel.createDocument();
        LogPanel.appendTo(logDocument, LogPanel.Level.INFO, "Admin Console đã khởi động");

        AdminGateway dataGateway = createDataGateway();
        UdpAdminGateway udpGateway = new UdpAdminGateway(dataGateway);
        udpGateway.addAlertListener(new AlertLogger(logDocument));
        gateway = udpGateway;
        roomSelection = new RoomSelection();

        // 2 tab
        tabbedPane = new JTabbedPane(JTabbedPane.TOP);
        sessionControlPanel = new SessionControlPanel(gateway, logDocument, roomSelection);
        MonitoringPanel monitoringPanel = new MonitoringPanel(gateway, logDocument, roomSelection, room -> {
            roomSelection.select(room.id());
            sessionControlPanel.refreshSelectedRoom();
            tabbedPane.setSelectedComponent(sessionControlPanel);
        });
        tabbedPane.addTab("Giám sát đấu giá", monitoringPanel);
        tabbedPane.addTab("Điều khiển phiên", sessionControlPanel);

        add(createHeaderPanel(), BorderLayout.NORTH);
        add(tabbedPane, BorderLayout.CENTER);
        add(createStatusBarPanel(), BorderLayout.SOUTH);

        logger.info("AdminConsoleUI đã khởi tạo thành công");
    }

    // GENERATE 2 TABS
    // private JPanel createPlaceholderPanel(String text) {
    // JPanel panel = new JPanel(new BorderLayout());
    // JLabel label = new JLabel(text, SwingConstants.CENTER);

    // panel.add(label, BorderLayout.CENTER);

    // return panel;
    // }

    // GENERATE HEADER
    private JPanel createHeaderPanel() {
        // header
        JPanel header = new JPanel(new BorderLayout());
        header.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(0, 0, 1, 0, COLOR_BORDER),
                BorderFactory.createEmptyBorder(12, 20, 12, 20)));

        // left
        JPanel left = new JPanel();
        left.setLayout(new BoxLayout(left, BoxLayout.Y_AXIS));
        left.setOpaque(false);

        JLabel title = new JLabel("QUẢN TRỊ ĐẤU GIÁ BIỂN SỐ");
        title.setFont(FONT_TITLE);

        JLabel serverInfo = new JLabel("Máy chủ: " + AdminConfig.SERVER_ADDRESS + " • " + AdminConfig.CLUSTER_NAME);
        serverInfo.setFont(FONT_SMALL);
        serverInfo.setForeground(COLOR_MUTED);

        left.add(title);
        left.add(serverInfo);
        header.add(left, BorderLayout.WEST);

        // right
        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 16, 0));
        right.setOpaque(false);

        JLabel connection = new JLabel("● Máy chủ đã kết nối");
        connection.setFont(FONT_NORMAL);
        connection.setForeground(COLOR_SUCCESS);

        JPanel user = new JPanel();
        user.setLayout(new BoxLayout(user, BoxLayout.Y_AXIS));
        user.setOpaque(false);

        JLabel userName = new JLabel(AdminConfig.CORE_ADMIN_USER.isBlank() ? "Quản trị viên" : AdminConfig.CORE_ADMIN_USER);
        userName.setFont(FONT_NORMAL);

        JLabel userRole = new JLabel("Quản trị viên");
        userRole.setFont(FONT_SMALL);
        userRole.setForeground(COLOR_MUTED);

        user.add(userName);
        user.add(userRole);

        right.add(connection);
        right.add(user);
        if ("mock".equalsIgnoreCase(AdminConfig.DATA_SOURCE)) {
            JLabel mockLabel = new JLabel("DỮ LIỆU MẪU");
            mockLabel.setForeground(COLOR_DANGER);
            mockLabel.setFont(FONT_SMALL.deriveFont(java.awt.Font.BOLD));
            right.add(mockLabel);
        }
        header.add(right, BorderLayout.EAST);

        // output
        return header;
    }

    // GENERATE STATUS BAR
    private JPanel createStatusBarPanel() {
        JPanel statusBar = new JPanel(new BorderLayout());
        statusBar.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(1, 0, 0, 0, COLOR_BORDER),
                BorderFactory.createEmptyBorder(6, 16, 6, 16)));

        JPanel left = new JPanel(new FlowLayout(FlowLayout.LEFT, 16, 0));
        left.setOpaque(false);

        JLabel udp = new JLabel("● UDP 8888: đang nhận");
        udp.setFont(FONT_SMALL);
        udp.setForeground(COLOR_SUCCESS);

        JLabel tcp = new JLabel("● Raw TCP 9090: sẵn sàng");
        tcp.setFont(FONT_SMALL);
        tcp.setForeground(COLOR_SUCCESS);

        String now = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        JLabel lastUpdate = new JLabel("Cập nhật gần nhất: " + now + " • Chu kỳ 1 giây");
        lastUpdate.setFont(FONT_SMALL);
        lastUpdate.setForeground(COLOR_MUTED);

        left.add(udp);
        left.add(tcp);
        left.add(lastUpdate);
        statusBar.add(left, BorderLayout.WEST);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 0));
        right.setOpaque(false);

        JButton mailButton = new JButton("Gửi email biên bản");
        mailButton.setFont(FONT_SMALL);
        mailButton.setFocusPainted(false);
        mailButton.addActionListener(e -> sendWinnerNotice());

        JButton announceButton = new JButton("Phát thông báo phòng");
        announceButton.setFont(FONT_SMALL);
        announceButton.addActionListener(e -> announceToRoom());

        JLabel version = new JLabel("Chỉ quản trị viên • Phiên bản 1.0");
        version.setFont(FONT_SMALL);
        version.setForeground(COLOR_MUTED);

        right.add(announceButton);
        right.add(mailButton);
        right.add(version);
        statusBar.add(right, BorderLayout.EAST);

        return statusBar;
    }

    // ===== Gửi email biên bản thật =====

    /**
     * Lấy biên bản từ core, xác nhận địa chỉ nhận, gửi email trên luồng nền và ghi kết quả vào nhật
     * ký.
     */
    private void sendWinnerNotice() {
        String roomId = JOptionPane.showInputDialog(this,
                "Mã phiên đã kết thúc:", "Gửi email biên bản", JOptionPane.QUESTION_MESSAGE);
        if (roomId == null || roomId.isBlank()) {
            return;
        }
        String normalizedRoomId = roomId.trim();
        gateway.fetchResult(normalizedRoomId).whenComplete((result, fetchError) -> SwingUtilities.invokeLater(() -> {
            if (fetchError != null) {
                LogPanel.appendTo(logDocument, LogPanel.Level.ERROR,
                        "Không lấy được biên bản: " + rootMessage(fetchError));
                return;
            }
            confirmAndSendResult(result);
        }));
    }

    private void confirmAndSendResult(AuctionResult result) {
        String defaultEmail = result.winnerEmail() == null ? "" : result.winnerEmail();
        String to = (String) JOptionPane.showInputDialog(this,
                "Người thắng: " + result.winnerName() + " (ID " + result.winnerUserId() + ")\n" +
                        "Biển " + result.plate() + " • Giá " + result.finalPrice() + " VNĐ\nEmail nhận (có thể đổi để demo):",
                "Xác nhận gửi biên bản " + result.sessionCode(), JOptionPane.QUESTION_MESSAGE, null, null, defaultEmail);
        if (to == null || to.isBlank()) return;
        try {
            if (mailService == null) mailService = new MailService(MailConfig.fromEnv());
            MailMessage message = MailTemplates.winnerNotice(to.trim(), result.winnerName(), result.winnerUserId(),
                    result.sessionCode(), result.plate(), result.finalPrice(), result.depositAmount(), result.endTime());
            LogPanel.appendTo(logDocument, LogPanel.Level.COMMAND, "> MAIL RESULT " + result.sessionCode() + " -> " + to.trim());
            mailService.send(message).whenComplete((ignored, ex) -> SwingUtilities.invokeLater(() -> {
                if (ex == null) LogPanel.appendTo(logDocument, LogPanel.Level.SUCCESS, "Đã gửi biên bản tới " + to.trim());
                else LogPanel.appendTo(logDocument, LogPanel.Level.ERROR, "Gửi email thất bại: " + rootMessage(ex));
            }));
        } catch (IllegalStateException | IllegalArgumentException ex) {
            LogPanel.appendTo(logDocument, LogPanel.Level.ERROR, ex.getMessage());
        }
    }

    private void announceToRoom() {
        String roomId = roomSelection.roomId();
        if (roomId == null || roomId.isBlank()) {
            roomId = JOptionPane.showInputDialog(this, "Mã phòng:", "Phát thông báo", JOptionPane.QUESTION_MESSAGE);
        }
        if (roomId == null || roomId.isBlank()) return;
        String message = JOptionPane.showInputDialog(this, "Nội dung thông báo:", "Phát thông báo vào " + roomId,
                JOptionPane.QUESTION_MESSAGE);
        if (message == null || message.isBlank()) return;
        String targetRoom = roomId.trim();
        gateway.announce(targetRoom, message.trim()).whenComplete((result, error) -> SwingUtilities.invokeLater(() -> {
            if (error != null) LogPanel.appendTo(logDocument, LogPanel.Level.ERROR, "Không gửi được thông báo: " + rootMessage(error));
            else LogPanel.appendTo(logDocument, result.success() ? LogPanel.Level.SUCCESS : LogPanel.Level.ERROR, result.message());
        }));
    }

    /**
     * Lấy thông báo lỗi gốc, bỏ các lớp bọc CompletionException /
     * ExecutionException.
     */
    private static String rootMessage(Throwable t) {
        Throwable cur = t;
        while ((cur instanceof CompletionException || cur instanceof ExecutionException)
                && cur.getCause() != null) {
            cur = cur.getCause();
        }
        return cur.getMessage() == null ? cur.toString() : cur.getMessage();
    }

    /** core (mặc định) hoặc mock khi ADMIN_DATA_SOURCE=mock. */
    private static AdminGateway createDataGateway() {
        if ("mock".equalsIgnoreCase(AdminConfig.DATA_SOURCE)) {
            logger.warn("Đang dùng dữ liệu MOCK (ADMIN_DATA_SOURCE=mock)");
            return new MockAdminGateway();
        }

        logger.info("Lấy dữ liệu từ core {} và lệnh qua TCP {}:{}",
                AdminConfig.CORE_BASE_URL, AdminConfig.CORE_TCP_HOST, AdminConfig.CORE_TCP_PORT);

        return new CoreAdminGateway(
                new CoreHttpClient(AdminConfig.CORE_BASE_URL,
                        AdminConfig.CORE_ADMIN_USER, AdminConfig.CORE_ADMIN_PASSWORD),
                new CoreTcpClient(AdminConfig.CORE_TCP_HOST, AdminConfig.CORE_TCP_PORT, AdminConfig.TCP_CONTROL_SECRET));
    }
}
