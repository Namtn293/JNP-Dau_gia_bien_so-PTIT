package com.auction.ui.panels.monitoring;

import com.auction.ui.panels.LogPanel;

import static com.auction.ui.Theme.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridLayout;

import javax.swing.*;
import javax.swing.text.StyledDocument;

public class MonitoringPanel extends JPanel {
    private LogPanel logPanel;

    // ==== BẢNG THÔNG SỐ KĨ THUẬT ====
    public MonitoringPanel(StyledDocument logDocument) {
        setLayout(new BorderLayout(0, 16));
        setBorder(BorderFactory.createEmptyBorder(16, 20, 16, 20));

        add(createMetricCards(), BorderLayout.NORTH);
        add(new RoomTablePanel(), BorderLayout.CENTER);

        logPanel = new LogPanel(logDocument);
        logPanel.setPreferredSize(new Dimension(0, 190));
        add(logPanel, BorderLayout.SOUTH);
    }

    // GENERATE METRIC BLOCKS
    private JPanel createMetricCards() {
        JPanel row = new JPanel(new GridLayout(1, 4, 12, 0));
        row.add(createCpuCard());
        row.add(createRamCard());
        row.add(createPingCard());
        row.add(createActivityCard());
        return row;
    }

    private JPanel createCard(String title) {
        JPanel card = new JPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(COLOR_BORDER),
                BorderFactory.createEmptyBorder(14, 16, 14, 16)
            )
        );

        JLabel titleLabel = new JLabel(title);
        titleLabel.setFont(FONT_LABEL);
        titleLabel.setForeground(COLOR_MUTED);
        addToCard(card, titleLabel);
        card.add(Box.createVerticalStrut(8));

        return card;
    }

    private void addToCard(JPanel card, JComponent component) {
        component.setAlignmentX(Component.LEFT_ALIGNMENT);
        component.setMaximumSize(new Dimension(Integer.MAX_VALUE, component.getPreferredSize().height));
        card.add(component);
    }

    private JLabel createValueLabel(String text, Color color) {
        JLabel label = new JLabel(text);
        label.setFont(FONT_VALUE);
        label.setForeground(color);

        return label;
    }

    private JLabel createCaptionLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(FONT_SMALL);
        label.setForeground(COLOR_MUTED);

        return label;
    }

    private JProgressBar createProgressBar(int percent) {
        JProgressBar progressBar = new JProgressBar(0,100);
        progressBar.setValue(percent);
        progressBar.setForeground(COLOR_PRIMARY);

        return progressBar;
    }

    private JPanel createCpuCard() {
        JPanel card = createCard("Đã sử dụng CPU");
        addToCard(card, createValueLabel("38%", COLOR_TEXT));
        card.add(Box.createVerticalStrut(8));
        addToCard(card, createProgressBar(38));
        card.add(Box.createVerticalStrut(8));
        addToCard(card, createCaptionLabel("8 lõi • Trung bình 60s: 35%"));

        return card;
    }

    private JPanel createRamCard() {
        JPanel card = createCard("SỬ DỤNG RAM");
        addToCard(card, createValueLabel("62%", COLOR_TEXT));
        card.add(Box.createVerticalStrut(6));
        addToCard(card, createProgressBar(62));
        card.add(Box.createVerticalStrut(6));
        addToCard(card, createCaptionLabel("9,9 / 16,0 GB • Còn trống 6,1 GB"));

        return card;
    }

    private JPanel createPingCard() {
        JPanel card = createCard("PING RTT • UDP 8888");

        JPanel valueRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 0 , 0));
        valueRow.setOpaque(false);
        valueRow.add(createValueLabel("32 ms", COLOR_SUCCESS));
        JLabel status = new JLabel("● Ổn định");
        status.setFont(FONT_SMALL);
        status.setForeground(COLOR_SUCCESS);
        status.setBorder(BorderFactory.createEmptyBorder(0, 8, 0, 0));
        valueRow.add(status);
        addToCard(card, valueRow);

        card.add(Box.createVerticalStrut(8));
        addToCard(card, createCaptionLabel("Mẫu RTT tham chiếu"));

        JPanel samples = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        samples.setOpaque(false);
        samples.add(createSampleLabel("32ms", COLOR_SUCCESS));
        samples.add(createSampleLabel("112ms", COLOR_WARNING));
        samples.add(createSampleLabel("326ms", COLOR_DANGER));
        addToCard(card, samples);

        return card;
    }

    private JLabel createSampleLabel(String text, Color color) {
        JLabel label = new JLabel("● " + text);
        label.setForeground(color);
        label.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 12));

        return label;
    }

    private JPanel createActivityCard() {
        JPanel card = createCard("HOẠT ĐỘNG TOÀN HỆ THỐNG");

        JPanel stats = new JPanel(new GridLayout(1, 2, 12, 0));
        stats.setOpaque(false);
        stats.add(createStat("248", "Người trực tuyến"));
        stats.add(createStat("12,4", "Lượt đặt giá/giây"));
        addToCard(card, stats);

        card.add(Box.createVerticalStrut(6));
        addToCard(card, createCaptionLabel("8 phòng • 3 phiên đang nhận giá"));

        return card;
    }

    private JPanel createStat(String value, String caption) {
        JPanel stat = new JPanel();
        stat.setLayout(new BoxLayout(stat, BoxLayout.Y_AXIS));
        stat.setOpaque(false);

        JLabel valueLabel = createValueLabel(value, COLOR_TEXT);
        valueLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        JLabel captionLabel = createCaptionLabel(caption);
        captionLabel.setAlignmentX(Component.LEFT_ALIGNMENT);

        stat.add(valueLabel);
        stat.add(captionLabel);

        return stat;
    }
}
