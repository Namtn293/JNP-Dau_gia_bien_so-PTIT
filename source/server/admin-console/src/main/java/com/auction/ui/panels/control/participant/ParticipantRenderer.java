package com.auction.ui.panels.control.participant;

import static com.auction.ui.common.Theme.*;

import java.awt.Color;
import java.awt.Component;

import javax.swing.BorderFactory;
import javax.swing.JTable;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableCellRenderer;

import com.auction.model.ConnectionState;

/** Cột và kiểu hiển thị của bảng người tham gia. */
public class ParticipantRenderer extends DefaultTableCellRenderer {
    public static final String[] COLUMNS = {
            "ID tài khoản", "Họ và tên", "Kết nối", "Giá cuối (VNĐ)"
    };
    public static final int COL_CONN = 2;
    public static final int COL_PRICE = 3;

    @Override
    public Component getTableCellRendererComponent(JTable table, Object value, boolean selected,
                                                   boolean focus, int row, int column) {
        super.getTableCellRendererComponent(table, value, selected, focus, row, column);

        setText(textOf(value, column));
        setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 10));
        setHorizontalAlignment(column >= COL_PRICE ? SwingConstants.RIGHT : SwingConstants.LEFT);

        ConnectionState connection = (ConnectionState) table.getValueAt(row, COL_CONN);
        setOpaque(selected);
        setForeground(rowTextColor(connection));
        return this;
    }

    private static Color rowTextColor(ConnectionState connection) {
        return switch (connection) {
            case CONNECTED -> COLOR_PRIMARY;
            case DISCONNECTED -> COLOR_CRIMSON;
        };
    }

    private static String textOf(Object value, int column) {
        return switch (column) {
            case COL_CONN -> "● " + value;
            case COL_PRICE -> formatVnd((Long) value);
            default -> String.valueOf(value);
        };
    }
}
