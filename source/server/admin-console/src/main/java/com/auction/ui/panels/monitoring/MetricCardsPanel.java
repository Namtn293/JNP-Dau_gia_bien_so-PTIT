package com.auction.ui.panels.monitoring;

import static com.auction.ui.Theme.*;

import java.awt.BasicStroke;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.GridLayout;
import java.awt.Insets;
import java.util.ArrayDeque;
import java.util.Deque;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JProgressBar;
import javax.swing.SwingUtilities;
import javax.swing.Timer;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.plot.XYPlot;
import org.jfree.chart.renderer.xy.XYLineAndShapeRenderer;
import org.jfree.data.time.Second;
import org.jfree.data.time.TimeSeries;
import org.jfree.data.time.TimeSeriesCollection;

import com.auction.gateway.AdminGateway;
import com.auction.model.ServerMetrics;

/**
 * Bốn thẻ chỉ số đầu tab Giám sát.
 * Dữ liệu lấy từ gateway (UDP 8888 khi nối thật), không đọc tài nguyên của máy đang chạy Admin Console.
 */
public class MetricCardsPanel extends JPanel {
    private static final int HISTORY_SECONDS = 60;
    private static final int REFRESH_MS = 1000;
    private static final double GB = 1024.0 * 1024.0 * 1024.0;

    private final AdminGateway gateway;

    // Tránh gửi chồng yêu cầu khi lần trước chưa về
    private boolean fetching;

    private final TimeSeries cpuSeries = new TimeSeries("CPU");
    private final TimeSeries ramSeries = new TimeSeries("RAM");
    private final Deque<Double> cpuHistory = new ArrayDeque<>();

    private JLabel cpuValueLabel;
    private JLabel cpuCaptionLabel;
    private JLabel ramValueLabel;
    private JLabel ramCaptionLabel;
    private JLabel pingValueLabel;
    private JLabel pingStatusLabel;
    private JLabel onlineValueLabel;
    private JLabel bidRateValueLabel;
    private JLabel activityCaptionLabel;

    private JProgressBar cpuProgressBar;
    private JProgressBar ramProgressBar;

    private int totalRooms;
    private int activeRooms;

    public MetricCardsPanel(AdminGateway gateway) {
        this.gateway = gateway;

        cpuSeries.setMaximumItemAge(HISTORY_SECONDS);
        ramSeries.setMaximumItemAge(HISTORY_SECONDS);

        setLayout(new GridLayout(1, 4, 12, 0));
        setOpaque(false);

        add(createCpuCard());
        add(createRamCard());
        add(createPingCard());
        add(createActivityCard());

        refreshMetrics();
        new Timer(REFRESH_MS, e -> refreshMetrics()).start();
    }

    /** Cập nhật số phòng trong thẻ hoạt động, do MonitoringPanel gọi mỗi khi có danh sách phòng mới. */
    public void setRoomSummary(int totalRooms, int activeRooms) {
        this.totalRooms = totalRooms;
        this.activeRooms = activeRooms;
        activityCaptionLabel.setText(totalRooms + " phòng • " + activeRooms + " phiên đang nhận giá");
    }

    // ===== Lấy dữ liệu =====

    /** Chạy trên EDT. Kết quả trả về được đưa lại EDT trước khi cập nhật giao diện. */
    private void refreshMetrics() {
        if (fetching) {
            return;
        }
        fetching = true;

        gateway.fetchMetrics()
                .thenAccept(metrics -> SwingUtilities.invokeLater(() -> {
                    fetching = false;
                    applyMetrics(metrics);
                }))
                .exceptionally(ex -> {
                    SwingUtilities.invokeLater(() -> {
                        fetching = false;
                        showOffline();
                    });
                    return null;
                });
    }

    private void applyMetrics(ServerMetrics m) {
        Second now = new Second();

        // CPU
        cpuSeries.addOrUpdate(now, m.cpuPercent());
        cpuValueLabel.setText(String.format("%.0f%%", m.cpuPercent()));
        cpuProgressBar.setValue((int) Math.round(m.cpuPercent()));
        pushHistory(cpuHistory, m.cpuPercent());
        cpuCaptionLabel.setText(String.format("%d lõi • Trung bình 60s: %.0f%%",
                m.cpuCores(), average(cpuHistory)));

        // RAM
        double ramPercent = m.ramUsedGb() / m.ramTotalGb() * 100.0;
        double freeGb = m.ramTotalGb() - m.ramUsedGb();
        ramSeries.addOrUpdate(now, ramPercent);
        ramValueLabel.setText(String.format("%.0f%%", ramPercent));
        ramProgressBar.setValue((int) Math.round(ramPercent));
        ramCaptionLabel.setText(String.format("%.1f / %.1f GB • Còn trống %.1f GB",
                m.ramUsedGb(), m.ramTotalGb(), freeGb));

        // Ping
        int rtt = m.pingMs();
        Color rttColor = rttColor(rtt);
        pingValueLabel.setText(rtt + " ms");
        pingValueLabel.setForeground(rttColor);
        pingStatusLabel.setText("● " + rttStatusText(rtt));
        pingStatusLabel.setForeground(rttColor);

        // Hoạt động toàn hệ thống
        onlineValueLabel.setText(String.valueOf(m.onlineUsers()));
        bidRateValueLabel.setText(String.format("%.1f", m.bidsPerSecond()).replace('.', ','));
    }

    private void showOffline() {
        cpuValueLabel.setText("—");
        cpuCaptionLabel.setText("Không có dữ liệu");
        ramValueLabel.setText("—");
        ramCaptionLabel.setText("Không có dữ liệu");
        pingValueLabel.setText("—");
        pingValueLabel.setForeground(COLOR_DANGER);
        pingStatusLabel.setText("● Mất kết nối");
        pingStatusLabel.setForeground(COLOR_DANGER);
    }

    private static void pushHistory(Deque<Double> history, double value) {
        history.addLast(value);
        while (history.size() > HISTORY_SECONDS) {
            history.removeFirst();
        }
    }

    private static double average(Deque<Double> values) {
        return values.stream().mapToDouble(Double::doubleValue).average().orElse(0);
    }

    /** Chữ hiển thị kèm RTT, dùng cùng ngưỡng với màu. */
    private static String rttStatusText(int ms) {
        if (ms < RTT_GOOD_MS) {
            return "Ổn định";
        }
        if (ms <= RTT_BAD_MS) {
            return "Trung bình";
        }
        return "Kém";
    }

    // ===== Xây dựng giao diện =====

    private JPanel createCardBase() {
        JPanel card = new JPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(COLOR_BORDER),
                BorderFactory.createEmptyBorder(14, 16, 14, 16)));
        card.setBackground(Color.WHITE);
        return card;
    }

    private JPanel createCardHeader(String title, String rightText) {
        JPanel header = new JPanel(new BorderLayout());
        header.setOpaque(false);
        header.setAlignmentX(Component.LEFT_ALIGNMENT);
        header.setMaximumSize(new Dimension(Integer.MAX_VALUE, 20));

        JLabel titleLabel = new JLabel(title);
        titleLabel.setFont(FONT_LABEL);
        titleLabel.setForeground(COLOR_MUTED);
        header.add(titleLabel, BorderLayout.WEST);

        if (rightText != null && !rightText.isEmpty()) {
            JLabel rightLabel = new JLabel(rightText);
            rightLabel.setFont(FONT_SMALL);
            rightLabel.setForeground(COLOR_MUTED);
            header.add(rightLabel, BorderLayout.EAST);
        }
        return header;
    }

    private JLabel createCaptionLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(FONT_SMALL);
        label.setForeground(COLOR_MUTED);
        label.setAlignmentX(Component.LEFT_ALIGNMENT);
        return label;
    }

    private JProgressBar createThinBar() {
        JProgressBar bar = new JProgressBar(0, 100);
        bar.setValue(0);
        bar.setStringPainted(false);
        bar.setForeground(COLOR_PRIMARY);
        bar.setBackground(new Color(230, 230, 230));
        bar.setBorderPainted(false);
        bar.setPreferredSize(new Dimension(Integer.MAX_VALUE, 6));
        bar.setMaximumSize(new Dimension(Integer.MAX_VALUE, 6));
        bar.setAlignmentX(Component.LEFT_ALIGNMENT);
        return bar;
    }

    // THẺ 1: CPU
    private JPanel createCpuCard() {
        JPanel card = createCardBase();

        card.add(createCardHeader("SỬ DỤNG CPU", HISTORY_SECONDS + " giây gần nhất"));
        card.add(Box.createVerticalStrut(12));

        JPanel midRow = new JPanel(new GridBagLayout());
        midRow.setOpaque(false);
        midRow.setAlignmentX(Component.LEFT_ALIGNMENT);
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.BOTH;

        cpuValueLabel = new JLabel("0%");
        cpuValueLabel.setFont(FONT_VALUE.deriveFont(32f));
        cpuValueLabel.setForeground(COLOR_TEXT);

        gbc.weightx = 0;
        gbc.insets = new Insets(0, 0, 0, 16);
        midRow.add(cpuValueLabel, gbc);

        gbc.weightx = 1.0;
        gbc.insets = new Insets(0, 0, 0, 0);
        midRow.add(createChartPanel(cpuSeries, COLOR_PRIMARY, 100), gbc);

        card.add(midRow);
        card.add(Box.createVerticalStrut(12));

        cpuProgressBar = createThinBar();
        card.add(cpuProgressBar);

        card.add(Box.createVerticalGlue());

        cpuCaptionLabel = createCaptionLabel("Đang tải...");
        card.add(cpuCaptionLabel);

        return card;
    }

    // THẺ 2: RAM
    private JPanel createRamCard() {
        JPanel card = createCardBase();

        card.add(createCardHeader("SỬ DỤNG RAM", HISTORY_SECONDS + " giây gần nhất"));
        card.add(Box.createVerticalStrut(12));

        JPanel midRow = new JPanel(new GridBagLayout());
        midRow.setOpaque(false);
        midRow.setAlignmentX(Component.LEFT_ALIGNMENT);
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.BOTH;

        ramValueLabel = new JLabel("0%");
        ramValueLabel.setFont(FONT_VALUE.deriveFont(32f));
        ramValueLabel.setForeground(COLOR_TEXT);

        gbc.weightx = 0;
        gbc.insets = new Insets(0, 0, 0, 16);
        midRow.add(ramValueLabel, gbc);

        gbc.weightx = 1.0;
        gbc.insets = new Insets(0, 0, 0, 0);
        midRow.add(createChartPanel(ramSeries, COLOR_PRIMARY, 100), gbc);

        card.add(midRow);
        card.add(Box.createVerticalStrut(12));

        ramProgressBar = createThinBar();
        card.add(ramProgressBar);

        card.add(Box.createVerticalGlue());

        ramCaptionLabel = createCaptionLabel("Đang tải...");
        card.add(ramCaptionLabel);

        return card;
    }

    // THẺ 3: PING
    private JPanel createPingCard() {
        JPanel card = createCardBase();

        card.add(createCardHeader("PING RTT • UDP 8888", null));
        card.add(Box.createVerticalStrut(12));

        JPanel valueRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        valueRow.setOpaque(false);
        valueRow.setAlignmentX(Component.LEFT_ALIGNMENT);
        valueRow.setMaximumSize(new Dimension(Integer.MAX_VALUE, 45));

        pingValueLabel = new JLabel("— ms");
        pingValueLabel.setFont(FONT_VALUE.deriveFont(32f));
        pingValueLabel.setForeground(COLOR_MUTED);

        pingStatusLabel = new JLabel("● Đang đo...");
        pingStatusLabel.setFont(FONT_NORMAL);
        pingStatusLabel.setForeground(COLOR_MUTED);
        pingStatusLabel.setBorder(BorderFactory.createEmptyBorder(0, 12, 6, 0));

        valueRow.add(pingValueLabel);
        valueRow.add(pingStatusLabel);
        card.add(valueRow);

        card.add(Box.createVerticalStrut(18));
        card.add(createCaptionLabel("Mẫu RTT tham chiếu"));
        card.add(Box.createVerticalGlue());

        JPanel samples = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        samples.setOpaque(false);
        samples.setAlignmentX(Component.LEFT_ALIGNMENT);
        samples.add(createSampleLabel("32ms", COLOR_SUCCESS));
        samples.add(createSampleLabel("112ms", COLOR_WARNING));
        samples.add(createSampleLabel("326ms", COLOR_DANGER));
        card.add(samples);

        return card;
    }

    private JLabel createSampleLabel(String text, Color color) {
        JLabel label = new JLabel("● " + text);
        label.setFont(FONT_SMALL);
        label.setForeground(color);
        label.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 16));
        return label;
    }

    // THẺ 4: HOẠT ĐỘNG TOÀN HỆ THỐNG
    private JPanel createActivityCard() {
        JPanel card = createCardBase();

        card.add(createCardHeader("HOẠT ĐỘNG TOÀN HỆ THỐNG", null));
        card.add(Box.createVerticalStrut(12));

        JPanel stats = new JPanel(new GridLayout(1, 2, 12, 0));
        stats.setOpaque(false);
        stats.setAlignmentX(Component.LEFT_ALIGNMENT);
        stats.setMaximumSize(new Dimension(Integer.MAX_VALUE, 65));

        onlineValueLabel = new JLabel("—");
        bidRateValueLabel = new JLabel("—");
        stats.add(createStat(onlineValueLabel, "Người trực tuyến"));
        stats.add(createStat(bidRateValueLabel, "Lượt đặt giá/giây"));
        card.add(stats);

        card.add(Box.createVerticalGlue());

        activityCaptionLabel = createCaptionLabel("Đang tải...");
        card.add(activityCaptionLabel);

        return card;
    }

    private JPanel createStat(JLabel valueLabel, String caption) {
        JPanel stat = new JPanel();
        stat.setLayout(new BoxLayout(stat, BoxLayout.Y_AXIS));
        stat.setOpaque(false);

        valueLabel.setFont(FONT_VALUE.deriveFont(32f));
        valueLabel.setForeground(COLOR_TEXT);
        valueLabel.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel captionLabel = createCaptionLabel(caption);

        stat.add(valueLabel);
        stat.add(Box.createVerticalStrut(2));
        stat.add(captionLabel);
        return stat;
    }

    // ===== Biểu đồ JFreeChart =====

    private ChartPanel createChartPanel(TimeSeries series, Color lineColor, double maxY) {
        TimeSeriesCollection dataset = new TimeSeriesCollection(series);
        JFreeChart chart = ChartFactory.createTimeSeriesChart(null, null, null, dataset, false, false, false);
        XYPlot plot = (XYPlot) chart.getXYPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);
        plot.getDomainAxis().setVisible(false);

        NumberAxis yAxis = (NumberAxis) plot.getRangeAxis();
        yAxis.setVisible(false);
        yAxis.setRange(0.0, maxY);

        XYLineAndShapeRenderer renderer = new XYLineAndShapeRenderer();
        renderer.setSeriesPaint(0, lineColor);
        renderer.setSeriesStroke(0, new BasicStroke(2.0f));
        renderer.setSeriesShapesVisible(0, false);
        plot.setRenderer(0, renderer);

        ChartPanel chartPanel = new ChartPanel(chart);
        chartPanel.setPreferredSize(new Dimension(80, 40));
        chartPanel.setOpaque(false);
        return chartPanel;
    }
}