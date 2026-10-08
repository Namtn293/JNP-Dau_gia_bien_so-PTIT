package com.auction.ui.panels.monitoring;

import static com.auction.ui.Theme.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.regex.Pattern;

import javax.swing.Box;
import javax.swing.BorderFactory;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.RowFilter;
import javax.swing.SwingConstants;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableRowSorter;

import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;

public class RoomTablePanel extends JPanel {
    private static final String[] COLUMNS = {
            "ID phòng", "Biển số", "Trạng thái", "Số người",
            "Giá hiện tại (VNĐ)", "Còn lại", "RTT"
    };

    private static final int COL_ID = 0;
    private static final int COL_STATUS = 2;
    private static final int COL_PRICE = 4;
    private static final int COL_RTT = 6;

    private static final String ALL_STATUS = "Tất cả trạng thái";

    private final DefaultTableModel model;
    private final TableRowSorter<DefaultTableModel> rowSorter;
    private final JTable roomTable;
    private final JTextField searchField;
    private final JComboBox<String> statusFilterCombo;
    private final JLabel countLabel;
    private final JLabel filterInfoLabel;
    private final List<Consumer<RoomInfo>> selectionListeners = new ArrayList<>();

    private List<RoomInfo> rooms = List.of();
    // true khi đang nạp lại dữ liệu: bỏ qua sự kiện chọn dòng để không gửi nhầm
    private boolean updating;

    public RoomTablePanel() {
        setLayout(new BorderLayout(0, 8));

        model = new DefaultTableModel(COLUMNS, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        rowSorter = new TableRowSorter<>(model);

        // HEADER: tiêu đề + bộ lọc
        JPanel headerPanel = new JPanel(new BorderLayout());

        JPanel titlePanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        JLabel title = new JLabel("Danh sách phòng đấu giá");
        title.setFont(FONT_NORMAL.deriveFont(Font.BOLD, 15f));
        countLabel = new JLabel("00 phòng");
        countLabel.setFont(FONT_SMALL);
        countLabel.setForeground(COLOR_MUTED);
        countLabel.setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 0));
        titlePanel.add(title);
        titlePanel.add(countLabel);

        JPanel filterPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        searchField = new JTextField(15);
        searchField.setToolTipText("Tìm mã phòng / biển số");

        List<String> statusOptions = new ArrayList<>();
        statusOptions.add(ALL_STATUS);
        for (RoomStatus status : RoomStatus.values()) {
            statusOptions.add(status.label());
        }
        statusFilterCombo = new JComboBox<>(statusOptions.toArray(new String[0]));

        filterPanel.add(new JLabel("Tìm kiếm:"));
        filterPanel.add(searchField);
        filterPanel.add(Box.createHorizontalStrut(10));
        filterPanel.add(new JLabel("Lọc:"));
        filterPanel.add(statusFilterCombo);

        headerPanel.add(titlePanel, BorderLayout.WEST);
        headerPanel.add(filterPanel, BorderLayout.EAST);

        // BẢNG
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

        add(headerPanel, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);
        add(footerPanel, BorderLayout.SOUTH);

        attachFilterListeners();
        attachSelectionListener();
        updateFilterInfo();
    }

    // ===== Dữ liệu =====

    /** Nạp lại toàn bộ danh sách phòng, giữ nguyên dòng đang chọn nếu còn tồn tại. */
    public void setRooms(List<RoomInfo> newRooms) {
        String previousId = selectedRoomId();
        rooms = List.copyOf(newRooms);

        updating = true;
        try {
            model.setRowCount(0);
            for (RoomInfo room : rooms) {
                model.addRow(toRow(room));
            }
            countLabel.setText(String.format("%02d phòng", rooms.size()));
            if (previousId != null) {
                selectRoom(previousId);
            }
        } finally {
            updating = false;
        }
        updateFilterInfo();
    }

    private static Object[] toRow(RoomInfo room) {
        return new Object[] {
                room.id(),
                room.plate(),
                room.status(),
                room.participantCount(),
                room.currentPrice(),
                room.remainingLabel(),
                room.rttMs()
        };
    }

    public RoomInfo findRoom(String roomId) {
        return rooms.stream()
                .filter(r -> r.id().equals(roomId))
                .findFirst()
                .orElse(null);
    }

    public RoomInfo getSelectedRoom() {
        return findRoom(selectedRoomId());
    }

    /**
     * Chọn một phòng theo ID.
     * @return false nếu phòng không có hoặc đang bị bộ lọc ẩn.
     */
    public boolean selectRoom(String roomId) {
        for (int modelRow = 0; modelRow < model.getRowCount(); modelRow++) {
            if (roomId.equals(model.getValueAt(modelRow, COL_ID))) {
                int viewRow = roomTable.convertRowIndexToView(modelRow);
                if (viewRow < 0) {
                    return false;
                }
                roomTable.setRowSelectionInterval(viewRow, viewRow);
                roomTable.scrollRectToVisible(roomTable.getCellRect(viewRow, 0, true));
                return true;
            }
        }
        return false;
    }

    private String selectedRoomId() {
        int viewRow = roomTable.getSelectedRow();
        if (viewRow < 0) {
            return null;
        }
        int modelRow = roomTable.convertRowIndexToModel(viewRow);
        return (String) model.getValueAt(modelRow, COL_ID);
    }

    /** Đăng ký nhận sự kiện khi người dùng chọn một phòng khác. */
    public void addRoomSelectionListener(Consumer<RoomInfo> listener) {
        selectionListeners.add(listener);
    }

    // ===== Hiển thị =====

    private static class RoomCellRenderer extends DefaultTableCellRenderer {
        @Override
        public Component getTableCellRendererComponent(JTable table, Object value, boolean isSelected,
                                                       boolean hasFocus, int row, int column) {
            super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);

            setText(textFor(value, column));
            setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 10));
            setHorizontalAlignment(column >= 3 ? SwingConstants.RIGHT : SwingConstants.LEFT);

            if (!isSelected) {
                RoomStatus status = (RoomStatus) table.getValueAt(row, COL_STATUS);
                setForeground(column == COL_RTT
                        ? rttColor((Integer) value)
                        : statusColor(status));
            }
            return this;
        }
    }

    private static String textFor(Object value, int column) {
        return switch (column) {
            case COL_STATUS -> "● " + value;
            case COL_PRICE -> formatVnd((Long) value);
            case COL_RTT -> value + " ms";
            default -> String.valueOf(value);
        };
    }

    private static Color statusColor(RoomStatus status) {
        return switch (status) {
            case ACTIVE -> COLOR_SUCCESS;
            case EXTENDING, WAITING -> COLOR_PRIMARY;
            case PAUSED -> COLOR_WARNING;
            default -> COLOR_MUTED;
        };
    }

    // ===== Tìm kiếm, lọc =====

    private void attachFilterListeners() {
        searchField.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) {
                applyFilter();
            }

            @Override
            public void removeUpdate(DocumentEvent e) {
                applyFilter();
            }

            @Override
            public void changedUpdate(DocumentEvent e) {
                applyFilter();
            }
        });

        statusFilterCombo.addActionListener(e -> applyFilter());
    }

    private void applyFilter() {
        String searchText = searchField.getText().trim();
        String status = (String) statusFilterCombo.getSelectedItem();

        List<RowFilter<Object, Object>> filters = new ArrayList<>();

        // Pattern.quote: nội dung người dùng gõ là chuỗi thường, không phải regex
        if (!searchText.isEmpty()) {
            filters.add(RowFilter.regexFilter("(?i)" + Pattern.quote(searchText), COL_ID, 1));
        }

        if (status != null && !status.equals(ALL_STATUS)) {
            filters.add(RowFilter.regexFilter("^" + Pattern.quote(status) + "$", COL_STATUS));
        }

        rowSorter.setRowFilter(filters.isEmpty() ? null : RowFilter.andFilter(filters));
        updateFilterInfo();
    }

    private void attachSelectionListener() {
        roomTable.getSelectionModel().addListSelectionListener(e -> {
            if (e.getValueIsAdjusting()) {
                return;
            }
            updateFilterInfo();
            if (updating) {
                return;
            }
            RoomInfo selected = getSelectedRoom();
            if (selected != null) {
                for (Consumer<RoomInfo> listener : selectionListeners) {
                    listener.accept(selected);
                }
            }
        });
    }

    private void updateFilterInfo() {
        String info = String.format("Hiển thị %d / %d phòng.",
                roomTable.getRowCount(), model.getRowCount());
        String selectedId = selectedRoomId();
        if (selectedId != null) {
            info += " Đã chọn " + selectedId;
        }
        filterInfoLabel.setText(info);
    }
}