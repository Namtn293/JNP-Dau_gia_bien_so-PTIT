package com.auction.ui.panels.monitoring;

import static com.auction.ui.Theme.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.Dimension;

import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.ListSelectionModel;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;

public class RoomTablePanel extends JPanel {
    // SAMPLE DATA
    private static final String[] ROOM_COLUMNS = {
            "ID phòng", "Biển số", "Trạng thái", "Số người",
            "Giá hiện tại (VNĐ)", "Còn lại", "RTT"
    };

    private static final Object[][] ROOM_DATA = {
            {"AUC-1021", "51L - 888.88", "Đang đấu giá", "68", "380.000.000", "04:52", "32 ms"},
            {"AUC-1022", "43A - 567.89", "Đang gia hạn", "35", "165.000.000", "00:24", "112 ms"},
            {"AUC-1023", "30K - 999.99", "Tạm dừng", "42", "245.000.000", "02:18", "32 ms"},
            {"AUC-1024", "30L - 686.86", "Đang đấu giá", "51", "120.000.000", "07:36", "326 ms"},
            {"AUC-1025", "51M - 123.45", "Phòng chờ", "29", "40.000.000", "Chưa bắt đầu", "32 ms"},
            {"AUC-1026", "43B - 888.89", "Đã lên lịch", "0", "40.000.000", "15:00 hôm nay", "32 ms"},
            {"AUC-1019", "30K - 567.89", "Đã đóng", "12", "210.000.000", "00:00", "32 ms"},
            {"AUC-1018", "51L - 666.68", "Đã quyết toán", "11", "195.000.000", "00:00", "32 ms"}
    };

    private JTable roomTable;

    public RoomTablePanel() {
        setLayout(new BorderLayout(0, 8));

        DefaultTableModel model = createRoomModel();

        // Dòng tiêu đề phía trên bảng
        JPanel header = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        JLabel title = new JLabel("Danh sách phòng đấu giá");
        title.setFont(FONT_NORMAL.deriveFont(Font.BOLD, 15f));
        JLabel count = new JLabel(String.format("%02d phòng", model.getRowCount()));
        count.setFont(FONT_SMALL);
        count.setForeground(COLOR_MUTED);
        count.setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 0));
        header.add(title);
        header.add(count);

        // Bảng
        roomTable = new JTable(model);
        roomTable.setFont(FONT_NORMAL);
        roomTable.setRowHeight(40);
        roomTable.setGridColor(COLOR_BORDER);
        roomTable.setShowVerticalLines(false);
        roomTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        roomTable.setDefaultRenderer(Object.class, new RoomCellRenderer());
        roomTable.getTableHeader().setFont(FONT_LABEL);
        roomTable.getTableHeader().setPreferredSize(new Dimension(0, 40));  // thêm: chiều cao header
        roomTable.getTableHeader().setReorderingAllowed(false);
        roomTable.setRowSelectionInterval(2, 2);

        JScrollPane scrollPane = new JScrollPane(roomTable);
        scrollPane.setBorder(BorderFactory.createLineBorder(COLOR_BORDER));
        scrollPane.getViewport().setBackground(Color.WHITE);

        add(header, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);
    }

    private DefaultTableModel createRoomModel() {
        return  new DefaultTableModel(ROOM_DATA, ROOM_COLUMNS) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
    }

    private static class RoomCellRenderer extends DefaultTableCellRenderer {
        @Override
        public Component getTableCellRendererComponent(JTable table, Object value, boolean isSelected, boolean hasFocus, int row, int column) {
            super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);

            String statusValue = String.valueOf(table.getValueAt(row, 2)); // Xác định chuỗi cột 2

            String raw = String.valueOf(value);
            setText(column == 2 ? "● " + raw : raw);

            setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 10));
            setHorizontalAlignment(column >= 3 ? SwingConstants.RIGHT : SwingConstants.LEFT);

            if (!isSelected) {
                if (column == 6) {
                    setForeground(rttColor(raw));
                } else {
                    setForeground(statusColor(statusValue));
                }
            }
            return this;
        }
    }

    private static Color statusColor(String status) {
        return switch (status) {
            case "Đang đấu giá" -> COLOR_SUCCESS;
            case "Đang gia hạn", "Phòng chờ" -> COLOR_PRIMARY;
            case "Tạm dừng" -> COLOR_WARNING;
            default -> COLOR_MUTED;
        };
    }

    private static Color rttColor(String text) {
        int ms = Integer.parseInt(text.replace("ms", "").trim());
        if (ms < 100) {
            return COLOR_SUCCESS;
        }
        if (ms < 200) {
            return COLOR_WARNING;
        }
        return COLOR_DANGER;
    }
}
