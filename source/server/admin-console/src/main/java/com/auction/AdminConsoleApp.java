package com.auction;

import javax.swing.SwingUtilities;
import javax.swing.UIManager;

import com.auction.ui.AdminConsoleUI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * AdminConsoleApp - Main Entry Point
 * <p>
 * Ứng dụng Desktop Admin Console cho Sàn Đấu Giá Biển Số Xe
 * <p>
 * Chức năng:
 * - Giám sát các phòng đấu giá đang diễn ra
 * - Xem biểu đồ tải CPU/RAM của server
 * - Đo độ trễ mạng Ping (RTT)
 * - Phát lệnh khẩn cấp: HALT, RESUME, KICK, CANCEL
 * <p>
 * Công nghệ:
 * - Framework: Java Swing
 * - Build: Maven
 * - Java: 21+
 * <p>
 * Author: baonguyenn2302
 * Date: 05/10/2026
 */
public class AdminConsoleApp {
    private static final Logger logger = LoggerFactory.getLogger(AdminConsoleApp.class);

    public static void main(String[] args) {
        logger.info("===== Khởi động Admin Console =====");
        logger.info("Máy chủ: {} • {}", AdminConfig.SERVER_ADDRESS, AdminConfig.CLUSTER_NAME); // ifconfig để lấy ip máy chủ - hiện fixed cứng để demo test
        logger.info("Java Version: {}", System.getProperty("java.version"));

        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            logger.info("Look and feel: {}", UIManager.getLookAndFeel().getName());
        } catch (Exception e) {
            logger.warn("Không áp dụng được Look and Feel hệ thống, dùng mặc định", e);
        }

        SwingUtilities.invokeLater(() -> { // to EDT
            try {
                AdminConsoleUI adminUI = new AdminConsoleUI();
                adminUI.setVisible(true);
                logger.info("Giao diện Admin Console đã được khởi chạy");
            } catch (Exception e) {
                logger.error("Lỗi khi khởi tạo giao diện Admin Console", e);
                System.exit(1);
            }
        });
    }
}