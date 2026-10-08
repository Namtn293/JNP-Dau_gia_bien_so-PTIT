package com.auction.ui.panels.monitoring;

import static com.auction.ui.Theme.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.Dimension;
import java.util.regex.PatternSyntaxException;

import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.ListSelectionModel;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableRowSorter;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.JTextField;
import javax.swing.JComboBox;
import javax.swing.RowFilter;
import javax.swing.Box;

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

    private final JTable roomTable;
    private final TableRowSorter<DefaultTableModel> rowSorter;
    private final JTextField searchField;
    private final JComboBox<String> statusFilterCombo;
    private final JLabel filterInfoLabel;

    public RoomTablePanel() {
        setLayout(new BorderLayout(0, 8));

        DefaultTableModel model = createRoomModel();
        rowSorter = new TableRowSorter<>(model);

        // HEADER: LỌC + TÌM KIẾM
        JPanel headerPanel = new JPanel(new BorderLayout());

        // Tiêu đề bên trái
        JPanel titlePanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        JLabel title = new JLabel("Danh sách phòng đấu giá");
        title.setFont(FONT_NORMAL.deriveFont(Font.BOLD, 15f));
        JLabel count = new JLabel(String.format("%02d phòng", model.getRowCount()));
        count.setFont(FONT_SMALL);
        count.setForeground(COLOR_MUTED);
        count.setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 0));
        titlePanel.add(title);
        titlePanel.add(count);

        // Bộ lọc bên phải
        JPanel filterPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));

        searchField = new JTextField(15);
        searchField.setToolTipText("Tìm mã phòng / biển số");

        String[] statusOptions = {"Tất cả trạng thái", "Đang đấu giá", "Đang gia hạn", "Tạm dừng", "Phòng chờ", "Đã đóng", "Đã quyết toán", "Đã lên lịch"};
        statusFilterCombo = new JComboBox<>(statusOptions);

        filterPanel.add(new JLabel("Tìm kiếm:"));
        filterPanel.add(searchField);
        filterPanel.add(Box.createHorizontalStrut(10));
        filterPanel.add(new JLabel("Lọc:"));
        filterPanel.add(statusFilterCombo);

        headerPanel.add(titlePanel, BorderLayout.WEST);
        headerPanel.add(filterPanel, BorderLayout.EAST);

        // KHUNG BẢNG
        roomTable = new JTable(model);
        roomTable.setRowSorter(rowSorter);
        roomTable.setFont(FONT_NORMAL);
        roomTable.setRowHeight(40);
        roomTable.setGridColor(COLOR_BORDER);
        roomTable.setShowVerticalLines(false);
        roomTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        roomTable.setDefaultRenderer(Object.class, new RoomCellRenderer());
        roomTable.getTableHeader().setFont(FONT_LABEL);
        roomTable.getTableHeader().setPreferredSize(new Dimension(0, 40));
        roomTable.getTableHeader().setReorderingAllowed(false);
        roomTable.setRowSelectionInterval(2, 2);

        JScrollPane scrollPane = new JScrollPane(roomTable);
        scrollPane.setBorder(BorderFactory.createLineBorder(COLOR_BORDER));
        scrollPane.getViewport().setBackground(Color.WHITE);

        // FOOTER
        JPanel footerPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 8));
        filterInfoLabel = new JLabel();
        filterInfoLabel.setFont(FONT_SMALL);
        filterInfoLabel.setForeground(COLOR_MUTED);
        footerPanel.add(filterInfoLabel);
        footerPanel.setBorder(BorderFactory.createMatteBorder(0, 0, 1, 0, COLOR_BORDER));

        // Thêm vào Panel chính
        add(headerPanel, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);
        add(footerPanel, BorderLayout.SOUTH);

        // Đăng ký sự kiện
        attachFilterListeners();
        attachSelectionListener();

        // Cập nhật nhãn footer lần đầu
        updateFilterInfo();
    }

    private DefaultTableModel createRoomModel() {
        return new DefaultTableModel(ROOM_DATA, ROOM_COLUMNS) {
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

            String statusValue = String.valueOf(table.getValueAt(row, 2));
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

    public JTable getRoomTable() {
        return roomTable;
    }

    // Logic tìm kiếm bảng
    private void attachFilterListeners() {
        searchField.getDocument().addDocumentListener(new DocumentListener() {
            public void insertUpdate(DocumentEvent e) { applyFilter(); }
            public void removeUpdate(DocumentEvent e) { applyFilter(); }
            public void changedUpdate(DocumentEvent e) { applyFilter(); }
        });

        statusFilterCombo.addActionListener(e -> applyFilter());
    }

    private void applyFilter() {
        String searchText = searchField.getText().trim();
        String status = (String) statusFilterCombo.getSelectedItem();

        java.util.List<RowFilter<Object, Object>> filters = new java.util.ArrayList<>();

        // 1. Filter theo chuỗi tìm kiếm
        if (!searchText.isEmpty()) {
            try {
                filters.add(RowFilter.regexFilter("(?i)" + searchText, 0, 1)); // Bỏ qua in hoa in đậm
            } catch (PatternSyntaxException e) {
                // Bỏ qua nếu nhập regex không hợp lệ
            }
        }

        // 2. Filter theo Dropdown Trạng thái
        if (status != null && !status.equals("Tất cả trạng thái")) {
            filters.add(RowFilter.regexFilter("^" + status + "$", 2));
        }

        // Áp dụng gộp cả 2 Filter
        if (filters.isEmpty()) {
            rowSorter.setRowFilter(null);
        } else {
            rowSorter.setRowFilter(RowFilter.andFilter(filters));
        }

        updateFilterInfo();
    }

    // Cập nhật info khi select 1 hàng nào đó
    private void attachSelectionListener() {
        roomTable.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                updateFilterInfo();
            }
        });
    }

    private void updateFilterInfo() {
        int totalRows = roomTable.getModel().getRowCount();
        int visibleRows = roomTable.getRowCount(); // Số hàng sau khi bộ lọc có tác dụng
        int selectedViewRow = roomTable.getSelectedRow();

        String info = String.format("Hiển thị %d / %d phòng.", visibleRows, totalRows);

        if (selectedViewRow >= 0) {
            // Rất quan trọng: Convert index từ UI (View) sang Data (Model) khi bảng bị lọc
            int modelRow = roomTable.convertRowIndexToModel(selectedViewRow);
            String selectedRoomId = String.valueOf(roomTable.getModel().getValueAt(modelRow, 0));
            info += " Đã chọn " + selectedRoomId;
        }

        filterInfoLabel.setText(info);
    }
}