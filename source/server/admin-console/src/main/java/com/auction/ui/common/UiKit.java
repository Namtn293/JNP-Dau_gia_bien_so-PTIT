package com.auction.ui.common;

import static com.auction.ui.common.Theme.*;

import java.awt.Color;
import java.awt.Component;
import java.awt.LayoutManager;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.BorderFactory;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.JPanel;

/** Hàm tiện ích tạo component giao diện, dùng chung cho các panel. */
public final class UiKit {
    private UiKit() { }

    /** Thẻ trắng có viền, bố cục do người gọi truyền vào. */
    public static JPanel cardWith(LayoutManager layout) {
        JPanel card = new JPanel(layout);
        applyCardStyle(card);
        return card;
    }

    /** Nền trắng, viền xám, lề trong. Dùng cho panel tự là một thẻ. */
    public static void applyCardStyle(JPanel panel) {
        panel.setBackground(Color.WHITE);
        panel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(COLOR_BORDER),
                BorderFactory.createEmptyBorder(14, 16, 14, 16)));
    }

    /** Xếp các thành phần theo chiều dọc, cách nhau 4px, căn trái. */
    public static JPanel stack(JComponent... parts) {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setOpaque(false);
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                panel.add(Box.createVerticalStrut(4));
            }
            parts[i].setAlignmentX(Component.LEFT_ALIGNMENT);
            panel.add(parts[i]);
        }
        return panel;
    }

    /** Chữ nhỏ màu xám, dùng cho mô tả và nhãn phụ. */
    public static JLabel caption(String text) {
        JLabel label = new JLabel(text);
        label.setFont(FONT_SMALL);
        label.setForeground(COLOR_MUTED);
        return label;
    }

    /** Nhãn của ô nhập liệu. */
    public static JLabel fieldLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(FONT_NORMAL);
        label.setAlignmentX(Component.LEFT_ALIGNMENT);
        return label;
    }

    /** Số lớn, dùng cho giá trị trong thẻ. */
    public static JLabel value(String text, float size) {
        JLabel label = new JLabel(text);
        label.setFont(FONT_VALUE.deriveFont(size));
        label.setForeground(COLOR_TEXT);
        return label;
    }

    /** Số cỡ vừa, dùng trên thanh chỉ số. */
    public static JLabel bigValue(String text) {
        JLabel label = new JLabel(text);
        label.setFont(FONT_LABEL.deriveFont(18f));
        label.setForeground(COLOR_TEXT);
        return label;
    }
}