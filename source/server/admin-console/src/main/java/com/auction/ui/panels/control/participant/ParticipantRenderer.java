package com.auction.ui.panels.control.participant;

import static com.auction.ui.common.Theme.*;

import java.awt.Color;
import java.awt.Component;

import javax.swing.BorderFactory;
import javax.swing.JTable;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableCellRenderer;

import com.auction.AdminConfig;
import com.auction.model.ConnectionState;

/** Cột và kiểu hiển thị của bảng người tham gia. */
public class ParticipantRenderer extends DefaultTableCellRenderer {
    public static final String[] COLUMNS = {
            "ID tài khoản", "Họ và tên", "Kết nối", "Đặt giá¹", "Giá cuối (VNĐ)", "RTT"
    };
    public static final int COL_CONN = 2;
    public static final int COL_BIDS = 3;
    public static final int COL_PRICE = 4;
    public static final int COL_RTT = 5;

    @Override
    public Component getTableCellRendererComponent(JTable table, Object value, boolean selected,
                                                   boolean focus, int row, int column) {
        super.getTableCellRendererComponent(table, value, selected, focus, row, column);

        setText(textOf(value, column));
        setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 10));
        setHorizontalAlignment(column >= COL_BIDS ? SwingConstants.RIGHT : SwingConstants.LEFT);

        if (!selected) {
            setForeground(colorOf(value, column));
        }
        return this;
    }

    private static String textOf(Object value, int column) {
        return switch (column) {
            case COL_CONN -> "● " + value;
            case COL_BIDS -> value + " / 5s";
            case COL_PRICE -> formatVnd((Long) value);
            case COL_RTT -> value + " ms";
            default -> String.valueOf(value);
        };
    }

    private static Color colorOf(Object value, int column) {
        return switch (column) {
            case COL_CONN -> switch ((ConnectionState) value) {
                case CONNECTED -> COLOR_SUCCESS;
                case CHECK_NEEDED -> COLOR_WARNING;
                default -> COLOR_DANGER;
            };
            case COL_BIDS -> (Integer) value >= AdminConfig.BID_WARNING_THRESHOLD
                    ? COLOR_DANGER
                    : COLOR_TEXT;
            case COL_RTT -> rttColor((Integer) value);
            default -> COLOR_TEXT;
        };
    }
}