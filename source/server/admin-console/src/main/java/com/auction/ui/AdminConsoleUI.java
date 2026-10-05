package com.auction.ui;

import java.awt.BorderLayout;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTabbedPane;
import javax.swing.SwingConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

        // Tạo 2 tab
        tabbedPane = new JTabbedPane(JTabbedPane.TOP);
        tabbedPane.addTab("Giám sát đấu giá", createPlaceholderPanel("Tab 1: Giám sát đấu giá"));
        tabbedPane.addTab("Điều khiển phiên", createPlaceholderPanel("Tab 2: Điều khiển phiên"));

        add(tabbedPane, BorderLayout.CENTER);

        logger.info("AdminConsoleUI đã khởi tạo thành công");
    }

    private JPanel createPlaceholderPanel(String text) {
        JPanel panel = new JPanel(new BorderLayout());
        JLabel label = new JLabel(text, SwingConstants.CENTER);

        panel.add(label, BorderLayout.CENTER);

        return panel;
    }
}