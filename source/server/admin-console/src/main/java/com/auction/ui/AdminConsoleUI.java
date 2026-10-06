package com.auction.ui;

import java.awt.BorderLayout;
import java.awt.FlowLayout;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import javax.swing.*;
import javax.swing.text.StyledDocument;

import com.auction.ui.panels.monitoring.MonitoringPanel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.auction.ui.Theme.*;
import com.auction.ui.panels.LogPanel;


/**
 * AdminConsoleUI - Cửa sổ chính của Admin Console.
 * Chứa 2 tab: "Giám sát đấu giá" và "Điều khiển phiên".
 */
public class AdminConsoleUI extends JFrame {
    private static final Logger logger = LoggerFactory.getLogger(AdminConsoleUI.class);

    private JTabbedPane tabbedPane;

    public AdminConsoleUI() {
        initializeUI(); // Khởi tạo giao diện
    }

    private void initializeUI() {
        // Cấu hình cửa sổ
        setTitle("Đấu giá biển số • Quản trị viên");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1300, 920);
        setLocationRelativeTo(null);

        // load data mẫu
        StyledDocument logDocument = LogPanel.createDocument();
        LogPanel.loadSampleLog(logDocument);

        // Tạo 2 tab
        tabbedPane = new JTabbedPane(JTabbedPane.TOP);
        tabbedPane.addTab("Giám sát đấu giá", new MonitoringPanel(logDocument));
        tabbedPane.addTab("Điều khiển phiên", createPlaceholderPanel("Tab 2: Điều khiển phiên"));

        add(createHeaderPanel(), BorderLayout.NORTH);
        add(tabbedPane, BorderLayout.CENTER);
        add(createStatusBarPanel(), BorderLayout.SOUTH);

        logger.info("AdminConsoleUI đã khởi tạo thành công");
    }

    // GENERATE 2 TABS
    private JPanel createPlaceholderPanel(String text) {
        JPanel panel = new JPanel(new BorderLayout());
        JLabel label = new JLabel(text, SwingConstants.CENTER);

        panel.add(label, BorderLayout.CENTER);

        return panel;
    }

    // GENERATE HEADER
    private JPanel createHeaderPanel() {
        // header
        JPanel header = new JPanel(new BorderLayout());
        header.setBorder(BorderFactory.createCompoundBorder(
                        BorderFactory.createMatteBorder(0, 0, 1, 0, COLOR_BORDER),
                        BorderFactory.createEmptyBorder(12, 20, 12, 20)
                )
        );

        // left
        JPanel left = new JPanel();
        left.setLayout(new BoxLayout(left, BoxLayout.Y_AXIS));
        left.setOpaque(false);

        JLabel title = new JLabel("QUẢN TRỊ ĐẤU GIÁ BIỂN SỐ");
        title.setFont(FONT_TITLE);

        JLabel serverInfo = new JLabel("Máy chủ: 192.168.1.7 • Cụm Hà Nội");
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

        JLabel userName = new JLabel("Nguyễn Gia Bảo");
        userName.setFont(FONT_NORMAL);

        JLabel userRole = new JLabel("Quản trị viên • Ca trực 14:00–22:00");
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
                        BorderFactory.createEmptyBorder(6, 16, 6, 16)
                )
        );

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

        JLabel version = new JLabel("Chỉ quản trị viên • Phiên bản 1.0");
        version.setFont(FONT_SMALL);
        version.setForeground(COLOR_MUTED);
        statusBar.add(version, BorderLayout.EAST);

        return statusBar;
    }
}