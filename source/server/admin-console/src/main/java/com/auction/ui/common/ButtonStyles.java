package com.auction.ui.common;

import static com.auction.ui.common.Theme.*;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;

import javax.swing.BorderFactory;
import javax.swing.JButton;

/** Kiểu nút dùng chung: nút đặc (HALT, RESUME, KICK) và nút viền (CANCEL). */
public final class ButtonStyles {
    private static final Dimension SIZE = new Dimension(100, 36);

    private ButtonStyles() { }

    public static JButton filled(String text, Color color) {
        JButton button = new JButton(text);
        button.setFont(FONT_NORMAL.deriveFont(Font.BOLD));
        button.setForeground(Color.WHITE);
        button.setBackground(color);
        button.setOpaque(true);
        button.setBorderPainted(false);
        button.setFocusPainted(false);
        button.setPreferredSize(SIZE);
        return button;
    }

    public static JButton outline(String text) {
        JButton button = new JButton(text);
        button.setFont(FONT_NORMAL.deriveFont(Font.BOLD));
        button.setOpaque(false);
        button.setContentAreaFilled(false);
        button.setFocusPainted(false);
        button.setPreferredSize(SIZE);
        return button;
    }

    /** Nút đặc: nền màu khi bật, nền xám khi tắt. */
    public static void setFilled(JButton button, boolean enabled, Color color) {
        button.setEnabled(enabled);
        button.setBackground(enabled ? color : COLOR_BORDER);
        button.setForeground(enabled ? Color.WHITE : COLOR_MUTED);
    }

    /** Nút viền: viền và chữ đỏ khi bật, xám khi tắt. */
    public static void setOutline(JButton button, boolean enabled) {
        button.setEnabled(enabled);
        button.setForeground(enabled ? COLOR_DANGER : COLOR_MUTED);
        button.setBorder(BorderFactory.createLineBorder(enabled ? COLOR_DANGER : COLOR_BORDER, 2));
    }
}