package com.auction.ui.panels.control.session;

import static com.auction.ui.common.Theme.*;
import static com.auction.ui.common.UiKit.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.JPanel;

import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;
import com.auction.model.ServerMetrics;

/** Tiêu đề, banner "Đã HALT" và thanh chỉ số phía trên tab Điều khiển phiên. */
public class SessionHeader extends JPanel {
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    // Thời điểm mỗi phòng bị tạm dừng, theo giờ máy Admin (không phải giờ server)
    private final Map<String, LocalTime> pausedAt = new HashMap<>();

    private final JLabel bannerLabel = new JLabel(" ");
    private final JLabel cpuLabel = bigValue("—");
    private final JLabel ramLabel = bigValue("—");
    private final JLabel pingLabel = bigValue("—");

    public SessionHeader() {
        setLayout(new BorderLayout(0, 12));
        setOpaque(false);

        JLabel title = new JLabel("Điều khiển phiên");
        title.setFont(FONT_TITLE);
        title.setForeground(COLOR_TEXT);

        JPanel titleRow = new JPanel(new BorderLayout());
        titleRow.setOpaque(false);
        titleRow.add(stack(title, caption("Kiểm tra tài khoản bất thường và can thiệp phòng đang tạm dừng.")),
                BorderLayout.WEST);

        bannerLabel.setFont(FONT_SMALL);
        bannerLabel.setForeground(COLOR_WARNING);
        bannerLabel.setVisible(false);
        titleRow.add(bannerLabel, BorderLayout.EAST);

        add(titleRow, BorderLayout.NORTH);
        add(createMetricsStrip(), BorderLayout.CENTER);
    }

    // ===== API cho SessionControlPanel =====

    public void updateMetrics(ServerMetrics m) {
        cpuLabel.setText(String.format("%.0f%%", m.cpuPercent()));
        double ramPercent = m.ramUsedGb() / m.ramTotalGb() * 100.0;
        ramLabel.setText(String.format("%.0f%%", ramPercent));
        pingLabel.setText(m.pingMs() + " ms");
        pingLabel.setForeground(rttColor(m.pingMs()));
    }

    public void showOffline() {
        cpuLabel.setText("—");
        ramLabel.setText("—");
        pingLabel.setText("—");
        pingLabel.setForeground(COLOR_DANGER);
        bannerLabel.setVisible(false);
    }

    /**
     * Hiện banner khi phòng đang tạm dừng. Truyền null khi không có phòng nào được chọn.
     */
    public void setRoom(RoomInfo room) {
        if (room == null) {
            bannerLabel.setVisible(false);
            return;
        }
        if (room.status() != RoomStatus.PAUSED) {
            pausedAt.remove(room.id());
            bannerLabel.setVisible(false);
            return;
        }
        LocalTime since = pausedAt.computeIfAbsent(room.id(), k -> LocalTime.now());
        bannerLabel.setText("Đã HALT lúc " + since.format(TIME_FORMAT)
                + " • Chờ quyết định của quản trị viên");
        bannerLabel.setVisible(true);
    }

    // ===== Bố cục =====

    private JPanel createMetricsStrip() {
        JPanel strip = new JPanel(new GridLayout(1, 4));
        strip.setBackground(Color.WHITE);
        strip.setBorder(BorderFactory.createLineBorder(COLOR_BORDER));
        strip.add(metricCell("CPU", cpuLabel));
        strip.add(metricCell("RAM", ramLabel));
        strip.add(metricCell("Ping RTT", pingLabel));
        strip.add(createChannelCell());
        return strip;
    }

    private static JPanel metricCell(String name, JLabel valueLabel) {
        JPanel cell = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 10));
        cell.setOpaque(false);
        cell.add(caption(name));
        cell.add(valueLabel);
        return cell;
    }

    private static JPanel createChannelCell() {
        JLabel ok = new JLabel("● Raw TCP 9090 • Sẵn sàng");
        ok.setFont(FONT_NORMAL);
        ok.setForeground(COLOR_SUCCESS);

        JPanel cell = stack(ok, caption("Độc lập với kênh đo lường UDP 8888"));
        cell.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        return cell;
    }
}