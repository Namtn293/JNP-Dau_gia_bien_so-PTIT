package com.auction.ui;

import java.awt.Color;
import java.awt.Font;

import java.util.Locale;

/*

 */
public final class Theme {
    private Theme() { }

    public static final Color COLOR_TEXT = new Color(15, 23, 42);
    public static final Color COLOR_MUTED = new Color(100, 116, 139);
    public static final Color COLOR_BORDER = new Color(226, 232, 240);
    public static final Color COLOR_PRIMARY = new Color(37, 99, 235);
    public static final Color COLOR_SUCCESS = new Color(22, 128, 61);
    public static final Color COLOR_WARNING = new Color(180, 83, 9);
    public static final Color COLOR_DANGER = new Color(185, 28, 28);

    public static final Font FONT_TITLE = new Font(Font.SANS_SERIF, Font.BOLD, 18);
    public static final Font FONT_VALUE = new Font(Font.SANS_SERIF, Font.BOLD, 28);
    public static final Font FONT_NORMAL = new Font(Font.SANS_SERIF, Font.PLAIN, 13);
    public static final Font FONT_LABEL = new Font(Font.SANS_SERIF, Font.BOLD, 13);
    public static final Font FONT_SMALL = new Font(Font.SANS_SERIF, Font.PLAIN, 11);

    public static final Color COLOR_LOG_BG = new Color(15, 23, 42);
    public static final Color COLOR_LOG_TEXT = new Color(226, 232, 240);
    public static final Color COLOR_LOG_MUTED = new Color(148, 163, 184);
    public static final Color COLOR_LOG_WARNING = new Color(251, 191, 36);
    public static final Color COLOR_LOG_COMMAND = new Color(147, 197, 253);
    public static final Color COLOR_LOG_SUCCESS = new Color(134, 239, 172);
    public static final Color COLOR_LOG_ERROR = new Color(252, 165, 165);

    public static final Font FONT_MONO = new Font(Font.MONOSPACED, Font.PLAIN, 12);

    // Ngưỡng RTT (ms) theo tổng quan dự án
    public static final int RTT_GOOD_MS = 50;
    public static final int RTT_BAD_MS = 300;

    /** Xanh dưới 50 ms, vàng từ 50 đến 300 ms, đỏ trên 300 ms. */
    public static Color rttColor(int ms) {
        if (ms < RTT_GOOD_MS) {
            return COLOR_SUCCESS;
        }
        if (ms <= RTT_BAD_MS) {
            return COLOR_WARNING;
        }
        return COLOR_DANGER;
    }

    /** Định dạng tiền VNĐ kiểu 380.000.000. */
    public static String formatVnd(long amount) {
        return String.format(Locale.US, "%,d", amount).replace(',', '.');
    }
}
