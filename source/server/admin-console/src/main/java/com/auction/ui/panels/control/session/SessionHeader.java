package com.auction.ui.panels.control.session;

import static com.auction.ui.common.Theme.*;
import static com.auction.ui.common.UiKit.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JProgressBar;

import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;
import com.auction.model.ServerMetrics;

/** Tiêu đề, banner "Đã HALT" và thanh chỉ số phía trên tab Điều khiển phiên. */
public class SessionHeader extends JPanel {
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final int METRIC_COUNT = 4;

    // Thời điểm mỗi phòng bị tạm dừng, theo giờ máy Admin (không phải giờ server)
    private final Map<String, LocalTime> pausedAt = new HashMap<>();

    private final JLabel bannerLabel = new JLabel(" ");
    private final JLabel cpuLabel = bigValue("—");
    private final JLabel ramLabel = bigValue("—");
    private final JLabel ramDetailLabel = caption(" ");
    private final JLabel pingLabel = bigValue("—");
    private final JLabel pingStatusLabel = new JLabel(" ");

    private final JProgressBar cpuBar = createThinBar();
    private final JProgressBar ramBar = createThinBar();

    public SessionHeader() {
        setLayout(new BorderLayout(0, 12));
        setOpaque(false);

        pingStatusLabel.setFont(FONT_NORMAL);
        pingStatusLabel.setForeground(COLOR_MUTED);

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
        double cpu = m.cpuPercent();
        cpuLabel.setText(String.format("%.0f%%", cpu));
        setBarValue(cpuBar, cpu);

        double ramPercent = m.ramUsedGb() / m.ramTotalGb() * 100.0;
        ramLabel.setText(String.format("%.0f%%", ramPercent));
        ramDetailLabel.setText(String.format("%.1f / %.1f GB", m.ramUsedGb(), m.ramTotalGb()));
        setBarValue(ramBar, ramPercent);

        int rtt = m.pingMs();
        Color rttColor = rttColor(rtt);
        pingLabel.setText(rtt + " ms");
        pingLabel.setForeground(rttColor);
        pingStatusLabel.setText("● " + rttStatusText(rtt));
        pingStatusLabel.setForeground(rttColor);
    }

    public void showOffline() {
        cpuLabel.setText("—");
        ramLabel.setText("—");
        ramDetailLabel.setText(" ");
        pingLabel.setText("—");
        pingLabel.setForeground(COLOR_DANGER);
        pingStatusLabel.setText("● Mất kết nối");
        pingStatusLabel.setForeground(COLOR_DANGER);
        setBarValue(cpuBar, 0);
        setBarValue(ramBar, 0);
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
        JPanel strip = new JPanel(new GridLayout(1, METRIC_COUNT));
        strip.setBackground(Color.WHITE);
        strip.setBorder(BorderFactory.createLineBorder(COLOR_BORDER));

        strip.add(withDivider(metricCell("CPU", cpuLabel, null, cpuBar)));
        strip.add(withDivider(metricCell("RAM", ramLabel, ramDetailLabel, ramBar)));
        strip.add(withDivider(metricCell("Ping RTT", pingLabel, pingStatusLabel, null)));
        strip.add(createChannelCell());
        return strip;
    }

    /**
     * Tên, số liệu, nhãn phụ (nếu có) và thanh tiến trình (nếu có).
     * Thanh nằm bên phải số liệu, giữa theo chiều dọc.
     */
    private static JPanel metricCell(String name, JLabel valueLabel, JLabel extraLabel, JProgressBar bar) {
        JPanel left = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 10));
        left.setOpaque(false);
        left.add(caption(name));
        left.add(valueLabel);
        if (extraLabel != null) {
            left.add(extraLabel);
        }

        JPanel cell = new JPanel(new BorderLayout(10, 0));
        cell.setOpaque(false);
        cell.add(left, BorderLayout.WEST);

        if (bar != null) {
            JPanel barWrap = new JPanel();
            barWrap.setLayout(new BoxLayout(barWrap, BoxLayout.Y_AXIS));
            barWrap.setOpaque(false);
            barWrap.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 16));
            barWrap.add(Box.createVerticalGlue());
            barWrap.add(bar);
            barWrap.add(Box.createVerticalGlue());
            cell.add(barWrap, BorderLayout.CENTER);
        }
        return cell;
    }

    /** Thêm đường kẻ dọc bên phải ô, dùng để ngăn cách các metric. */
    private static JPanel withDivider(JPanel cell) {
        cell.setBorder(BorderFactory.createMatteBorder(0, 0, 0, 1, COLOR_BORDER));
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

    // ===== Trạng thái ping =====

    /** Chữ hiển thị kèm RTT, cùng ngưỡng với màu trong Theme. */
    private static String rttStatusText(int ms) {
        if (ms < RTT_GOOD_MS) {
            return "Ổn định";
        }
        if (ms <= RTT_BAD_MS) {
            return "Trung bình";
        }
        return "Kém";
    }

    // ===== Thanh tiến trình =====

    /** Thanh mỏng, cùng kiểu với thanh trên thẻ CPU/RAM bên tab Giám sát. */
    private static JProgressBar createThinBar() {
        JProgressBar bar = new JProgressBar(0, 100);
        bar.setValue(0);
        bar.setStringPainted(false);
        bar.setForeground(COLOR_PRIMARY);
        bar.setBackground(new Color(230, 230, 230));
        bar.setBorderPainted(false);
        bar.setPreferredSize(new Dimension(0, 6));
        bar.setMaximumSize(new Dimension(Integer.MAX_VALUE, 6));
        bar.setAlignmentX(Component.LEFT_ALIGNMENT);
        return bar;
    }

    /** Giới hạn giá trị trong khoảng 0 đến 100 trước khi đưa vào thanh. */
    private static void setBarValue(JProgressBar bar, double percent) {
        bar.setValue((int) Math.round(Math.max(0, Math.min(100, percent))));
    }
}