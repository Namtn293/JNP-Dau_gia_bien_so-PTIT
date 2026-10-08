package com.auction.ui.panels.monitoring;

import static com.auction.ui.Theme.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.lang.management.ManagementFactory;

import javax.swing.*;

import com.sun.management.OperatingSystemMXBean;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.plot.XYPlot;
import org.jfree.chart.renderer.xy.XYLineAndShapeRenderer;
import org.jfree.data.time.Second;
import org.jfree.data.time.TimeSeries;
import org.jfree.data.time.TimeSeriesCollection;

public class MetricCardsPanel extends JPanel {
    // Các series chứa dữ liệu chạy chart (tối đa 60 giây)
    private final TimeSeries cpuSeries = new TimeSeries("CPU");
    private final TimeSeries ramSeries = new TimeSeries("RAM");
    private final TimeSeries pingSeries = new TimeSeries("Ping");

    // Các nhãn hiển thị real data từ local
    private JLabel cpuValueLabel;
    private JLabel ramValueLabel;
    private JLabel pingValueLabel;
    private JLabel ramCaptionLabel;
    private JLabel pingStatusLabel;

    private JProgressBar cpuProgressBar;
    private JProgressBar ramProgressBar;

    // Công cụ đọc thông số
    private final OperatingSystemMXBean osBean;

    public MetricCardsPanel() {
        osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();

        // Giới hạn biểu đồ 60s
        cpuSeries.setMaximumItemAge(60);
        ramSeries.setMaximumItemAge(60);
        pingSeries.setMaximumItemAge(60);

        setLayout(new GridLayout(1, 4, 12, 0));
        setOpaque(false);

        add(createCpuCard());
        add(createRamCard());
        add(createPingCard());
        add(createActivityCard());

        // Khởi động luồng chạy ngầm cập nhật dữ liệu mỗi giây (1000ms)
        startRealtimeMetrics();
    }

    private void startRealtimeMetrics() {
        Timer timer = new Timer(1000, e -> {
            Second currentSecond = new Second();

            // Cập nhật CPU
            try {
                double cpuLoad = osBean.getSystemCpuLoad();
                if (cpuLoad < 0) {
                    cpuLoad = 0;
                }
                double cpuPercent = cpuLoad * 100.0;
                cpuSeries.addOrUpdate(currentSecond, cpuPercent);
                cpuValueLabel.setText(String.format("%.1f%%", cpuPercent));
                cpuProgressBar.setValue((int) cpuPercent);
            } catch (Exception ex) {
                // Fallback
            }

            // Cập nhật RAM
            try {
                long physicalTotal = osBean.getTotalMemorySize();
                long physicalFree = osBean.getFreeMemorySize();
                long physicalUsed = physicalTotal - physicalFree;

                double ramPercent = ((double) physicalUsed / physicalTotal) * 100.0;
                ramSeries.addOrUpdate(currentSecond, ramPercent);
                ramValueLabel.setText(String.format("%.1f%%", ramPercent));

                double totalRamGb = physicalTotal / (1024.0 * 1024.0 * 1024.0);
                double usedRamGb = physicalUsed / (1024.0 * 1024.0 * 1024.0);
                double freeRamGb = physicalFree / (1024.0 * 1024.0 * 1024.0);

                ramCaptionLabel.setText(String.format("%.1f / %.1f GB • Còn trống %.1f GB", usedRamGb, totalRamGb, freeRamGb));
                ramProgressBar.setValue((int) ramPercent);
            } catch (Exception ex) {
                // Fallback
            }

            // Cập nhật Ping
            new Thread(() -> {
                long startTime = System.currentTimeMillis();
                boolean reachable = false;
                try {
                    try (java.net.Socket socket = new java.net.Socket()) {
                        socket.connect(new java.net.InetSocketAddress("1.1.1.1", 80), 1000);
                        reachable = true;
                    }
                } catch (Exception ex) {
                    reachable = false;
                }

                long rtt =  System.currentTimeMillis() - startTime;
                final boolean isReachable = reachable;
                final long finalRtt = rtt;

                SwingUtilities.invokeLater(() -> {
                    if (isReachable) {
                        pingSeries.addOrUpdate(currentSecond, finalRtt);
                        pingValueLabel.setText(finalRtt + " ms");
                        pingValueLabel.setForeground(finalRtt < 50 ? COLOR_SUCCESS : (finalRtt < 100 ? COLOR_WARNING : COLOR_DANGER));
                        pingStatusLabel.setText(finalRtt < 50 ? "● Ổn định" : (finalRtt < 100 ? "● Trung bình" : "● Kém"));
                        pingStatusLabel.setForeground(pingValueLabel.getForeground());
                    } else {
                        pingSeries.addOrUpdate(currentSecond, 500);
                        pingValueLabel.setText("Timeout");
                        pingValueLabel.setForeground(COLOR_DANGER);
                        pingStatusLabel.setText("● Rớt mạng");
                        pingStatusLabel.setForeground(COLOR_DANGER);
                    }
                });
            }).start();
        });
        timer.start();
    }

    // ==== CÁC HÀM XÂY DỰNG GIAO DIỆN MỚI TƯƠNG ĐƯƠNG BẢN THIẾT KẾ ====

    private JPanel createCardBase() {
        JPanel card = new JPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(COLOR_BORDER),
                BorderFactory.createEmptyBorder(14, 16, 14, 16)
        ));
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
        return label;
    }

    // THẺ 1: CPU
    private JPanel createCpuCard() {
        JPanel card = createCardBase();

        card.add(createCardHeader("SỬ DỤNG CPU", "60 giây gần nhất"));
        card.add(Box.createVerticalStrut(12));

        JPanel midRow = new JPanel(new java.awt.GridBagLayout());
        midRow.setOpaque(false);
        midRow.setAlignmentX(Component.LEFT_ALIGNMENT);
        java.awt.GridBagConstraints gbc = new java.awt.GridBagConstraints();
        gbc.fill = java.awt.GridBagConstraints.BOTH;

        cpuValueLabel = new JLabel("0%");
        cpuValueLabel.setFont(FONT_VALUE.deriveFont(32f));
        cpuValueLabel.setForeground(COLOR_TEXT);

        // Thêm label số %, không cho nó giãn
        gbc.weightx = 0;
        gbc.insets = new java.awt.Insets(0, 0, 0, 16);
        midRow.add(cpuValueLabel, gbc);

        ChartPanel chartPanel = createChartPanel(cpuSeries, COLOR_PRIMARY, 100);
        gbc.weightx = 1.0;
        gbc.insets = new java.awt.Insets(0, 0, 0, 0);
        midRow.add(chartPanel, gbc);

        card.add(midRow);
        card.add(Box.createVerticalStrut(12));

        cpuProgressBar = new JProgressBar(0, 100);
        cpuProgressBar.setValue(0);
        cpuProgressBar.setStringPainted(false);
        cpuProgressBar.setForeground(COLOR_PRIMARY);
        cpuProgressBar.setBackground(new Color(230, 230, 230));
        cpuProgressBar.setBorderPainted(false);
        cpuProgressBar.setPreferredSize(new Dimension(Integer.MAX_VALUE, 6));
        cpuProgressBar.setMaximumSize(new Dimension(Integer.MAX_VALUE, 6));
        cpuProgressBar.setAlignmentX(Component.LEFT_ALIGNMENT);
        card.add(cpuProgressBar);

        card.add(Box.createVerticalGlue());

        int cores = osBean.getAvailableProcessors();
        JLabel captionLabel = createCaptionLabel(cores + " lõi • Trung bình 60s: Đang đo...");
        captionLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        card.add(captionLabel);

        return card;
    }

    // THẺ 2: RAM
    private JPanel createRamCard() {
        JPanel card = createCardBase();

        card.add(createCardHeader("SỬ DỤNG RAM", "60 giây gần nhất"));
        card.add(Box.createVerticalStrut(12));

        JPanel midRow = new JPanel(new java.awt.GridBagLayout());
        midRow.setOpaque(false);
        midRow.setAlignmentX(Component.LEFT_ALIGNMENT);
        java.awt.GridBagConstraints gbc = new java.awt.GridBagConstraints();
        gbc.fill = java.awt.GridBagConstraints.BOTH;

        ramValueLabel = new JLabel("0%");
        ramValueLabel.setFont(FONT_VALUE.deriveFont(32f));
        ramValueLabel.setForeground(COLOR_TEXT);

        gbc.weightx = 0;
        gbc.insets = new java.awt.Insets(0, 0, 0, 16);
        midRow.add(ramValueLabel, gbc);

        ChartPanel chartPanel = createChartPanel(ramSeries, COLOR_PRIMARY, 100);
        gbc.weightx = 1.0; // Biểu đồ RAM giãn theo không gian
        gbc.insets = new java.awt.Insets(0, 0, 0, 0);
        midRow.add(chartPanel, gbc);

        card.add(midRow);
        card.add(Box.createVerticalStrut(12));

        ramProgressBar = new JProgressBar(0, 100);
        ramProgressBar.setValue(0);
        ramProgressBar.setStringPainted(false);
        ramProgressBar.setForeground(COLOR_PRIMARY);
        ramProgressBar.setBackground(new Color(230, 230, 230));
        ramProgressBar.setBorderPainted(false);
        ramProgressBar.setPreferredSize(new Dimension(Integer.MAX_VALUE, 6));
        ramProgressBar.setMaximumSize(new Dimension(Integer.MAX_VALUE, 6));
        ramProgressBar.setAlignmentX(Component.LEFT_ALIGNMENT);
        card.add(ramProgressBar);

        card.add(Box.createVerticalGlue());

        ramCaptionLabel = createCaptionLabel("Đang tính toán...");
        ramCaptionLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
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

        pingValueLabel = new JLabel("0 ms");
        pingValueLabel.setFont(FONT_VALUE.deriveFont(32f));
        pingValueLabel.setForeground(COLOR_SUCCESS);

        pingStatusLabel = new JLabel("● Đang đo...");
        pingStatusLabel.setFont(FONT_NORMAL);
        pingStatusLabel.setForeground(COLOR_SUCCESS);
        pingStatusLabel.setBorder(BorderFactory.createEmptyBorder(0, 12, 6, 0)); // Căn lề chữ ổn định xuống

        valueRow.add(pingValueLabel);
        valueRow.add(pingStatusLabel);
        card.add(valueRow);

        card.add(Box.createVerticalStrut(18));

        JLabel caption = createCaptionLabel("Mẫu RTT tham chiếu");
        caption.setAlignmentX(Component.LEFT_ALIGNMENT);
        card.add(caption);

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

    // THẺ 4: ACTIVITY
    private JPanel createActivityCard() {
        JPanel card = createCardBase();

        card.add(createCardHeader("HOẠT ĐỘNG TOÀN HỆ THỐNG", null));
        card.add(Box.createVerticalStrut(12));

        JPanel stats = new JPanel(new GridLayout(1, 2, 12, 0));
        stats.setOpaque(false);
        stats.setAlignmentX(Component.LEFT_ALIGNMENT);
        stats.setMaximumSize(new Dimension(Integer.MAX_VALUE, 65));

        stats.add(createStat("248", "Người trực tuyến"));
        stats.add(createStat("12,4", "Lượt đặt giá/giây"));
        card.add(stats);

        card.add(Box.createVerticalGlue());

        JLabel caption = createCaptionLabel("8 phòng • 3 phiên đang nhận giá");
        caption.setAlignmentX(Component.LEFT_ALIGNMENT);
        card.add(caption);

        return card;
    }

    private JPanel createStat(String value, String caption) {
        JPanel stat = new JPanel();
        stat.setLayout(new BoxLayout(stat, BoxLayout.Y_AXIS));
        stat.setOpaque(false);

        JLabel valueLabel = new JLabel(value);
        valueLabel.setFont(FONT_VALUE.deriveFont(32f));
        valueLabel.setForeground(COLOR_TEXT);
        valueLabel.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel captionLabel = createCaptionLabel(caption);
        captionLabel.setAlignmentX(Component.LEFT_ALIGNMENT);

        stat.add(valueLabel);
        stat.add(Box.createVerticalStrut(2));
        stat.add(captionLabel);

        return stat;
    }

    // Công cụ JFreeChart
    private ChartPanel createChartPanel(TimeSeries series, Color lineColor, double maxY) {
        TimeSeriesCollection dataset = new TimeSeriesCollection(series);
        JFreeChart chart = ChartFactory.createTimeSeriesChart(null, null, null, dataset, false, false, false);
        XYPlot plot = (XYPlot) chart.getXYPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);
        plot.getDomainAxis().setVisible(false);

        NumberAxis yAxis = (NumberAxis) plot.getRangeAxis();
        yAxis.setVisible(false);
        if (maxY > 0) {
            yAxis.setRange(0.0, maxY);
        } else {
            yAxis.setAutoRangeIncludesZero(true);
        }

        XYLineAndShapeRenderer renderer = new XYLineAndShapeRenderer();
        renderer.setSeriesPaint(0, lineColor);
        renderer.setSeriesStroke(0, new java.awt.BasicStroke(2.0f));
        renderer.setSeriesShapesVisible(0, false);
        plot.setRenderer(0, renderer);

        ChartPanel chartPanel = new ChartPanel(chart);
        chartPanel.setPreferredSize(new Dimension(80, 40));
        chartPanel.setOpaque(false);

        return chartPanel;
    }
}