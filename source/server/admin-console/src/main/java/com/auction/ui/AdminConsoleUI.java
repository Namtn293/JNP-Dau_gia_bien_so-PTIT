package com.auction.ui;

import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

import com.auction.mail.MailConfig;
import com.auction.mail.MailMessage;
import com.auction.mail.MailService;
import com.auction.mail.MailTemplates;

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
import com.auction.AdminConfig;

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
        LogPanel.loadSampleLog(logDocument);

        UdpAdminGateway udpGateway = new UdpAdminGateway();
        udpGateway.addAlertListener(new AlertLogger(logDocument));
        AdminGateway gateway = udpGateway;
        RoomSelection selection = new RoomSelection();

        // 2 tab
        tabbedPane = new JTabbedPane(JTabbedPane.TOP);
        tabbedPane.addTab("Giám sát đấu giá", new MonitoringPanel(gateway, logDocument, selection));
        tabbedPane.addTab("Điều khiển phiên", new SessionControlPanel(gateway, logDocument, selection));

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

        JLabel userName = new JLabel(AdminConfig.OPERATOR_NAME);
        userName.setFont(FONT_NORMAL);

        JLabel userRole = new JLabel(AdminConfig.OPERATOR_ROLE);
        userRole.setFont(FONT_SMALL);
        userRole.setForeground(COLOR_MUTED);

        user.add(userName);
        user.add(userRole);

        right.add(connection);
        right.add(user);
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

        JButton mailButton = new JButton("Gửi email mẫu");
        mailButton.setFont(FONT_SMALL);
        mailButton.setFocusPainted(false);
        mailButton.addActionListener(e -> sendSampleMail());

        JLabel version = new JLabel("Chỉ quản trị viên • Phiên bản 1.0");
        version.setFont(FONT_SMALL);
        version.setForeground(COLOR_MUTED);

        right.add(mailButton);
        right.add(version);
        statusBar.add(right, BorderLayout.EAST);

        return statusBar;
    }

    // ===== Gửi email mẫu =====

    /**
     * Hỏi địa chỉ người nhận, gửi email mẫu trên luồng nền và ghi kết quả vào nhật
     * ký.
     */
    private void sendSampleMail() {
        String input = JOptionPane.showInputDialog(this,
                "Nhập email người nhận:", "Gửi email mẫu", JOptionPane.QUESTION_MESSAGE);
        if (input == null || input.isBlank()) {
            return;
        }
        String to = input.trim();

        LogPanel.appendTo(logDocument, LogPanel.Level.COMMAND, "> MAIL " + to);
        try {
            if (mailService == null) {
                mailService = new MailService(MailConfig.fromEnv());
            }
            // Dữ liệu mẫu theo phiên AUC-1023 trong thiết kế
            MailMessage message = MailTemplates.winnerNotice(
                    to, "AUC-1023", "30K - 999.99", 245_000_000L, 40_000_000L);

            mailService.send(message).whenComplete((ignored, ex) -> SwingUtilities.invokeLater(() -> {
                if (ex == null) {
                    LogPanel.appendTo(logDocument, LogPanel.Level.SUCCESS, "Đã gửi email mẫu tới " + to);
                } else {
                    LogPanel.appendTo(logDocument, LogPanel.Level.ERROR,
                            "Gửi email thất bại: " + rootMessage(ex));
                }
            }));
        } catch (IllegalStateException | IllegalArgumentException ex) {
            LogPanel.appendTo(logDocument, LogPanel.Level.ERROR, ex.getMessage());
        }
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
}