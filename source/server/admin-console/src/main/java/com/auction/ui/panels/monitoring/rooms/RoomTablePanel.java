package com.auction.ui.panels.monitoring.rooms;

import static com.auction.ui.common.Theme.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import javax.swing.Box;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.SwingConstants;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableRowSorter;

import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;

/**
 * Bảng danh sách phòng: tìm kiếm, lọc trạng thái, phân trang.
 * Lựa chọn được giữ theo ID phòng, nên vẫn còn khi phòng đang chọn nằm ở trang khác.
 */
public class RoomTablePanel extends JPanel {
    /** Số phòng mỗi trang. Đổi giá trị này để thay đổi phân trang. */
    private static final int PAGE_SIZE = 10;

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
    private final JLabel pageLabel;
    private final JButton prevButton;
    private final JButton nextButton;
    private final List<Consumer<RoomInfo>> selectionListeners = new ArrayList<>();

    private List<RoomInfo> rooms = List.of();     // toàn bộ phòng
    private List<RoomInfo> filtered = List.of();  // sau khi lọc
    private List<RoomInfo> visible = List.of();   // trang hiện tại
    private String selectedRoomId;
    private int page;

    // true khi đang nạp lại bảng bằng code: bỏ qua sự kiện chọn dòng
    private boolean rebuilding;

    public RoomTablePanel() {
        setLayout(new BorderLayout(0, 8));

        model = new DefaultTableModel(COLUMNS, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        rowSorter = new TableRowSorter<>(model);

        // HEADER: tiêu đề + tìm kiếm + lọc
        JPanel titlePanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        JLabel title = new JLabel("Danh sách phòng đấu giá");
        title.setFont(FONT_NORMAL.deriveFont(Font.BOLD, 15f));
        countLabel = new JLabel("00 phòng");
        countLabel.setFont(FONT_SMALL);
        countLabel.setForeground(COLOR_MUTED);
        countLabel.setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 0));
        titlePanel.add(title);
        titlePanel.add(countLabel);

        searchField = new JTextField(15);
        searchField.setToolTipText("Tìm mã phòng / biển số");

        List<String> statusOptions = new ArrayList<>();
        statusOptions.add(ALL_STATUS);
        for (RoomStatus status : RoomStatus.values()) {
            statusOptions.add(status.label());
        }
        statusFilterCombo = new JComboBox<>(statusOptions.toArray(new String[0]));

        JPanel filterPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        filterPanel.add(new JLabel("Tìm kiếm:"));
        filterPanel.add(searchField);
        filterPanel.add(Box.createHorizontalStrut(10));
        filterPanel.add(new JLabel("Lọc:"));
        filterPanel.add(statusFilterCombo);

        JPanel headerPanel = new JPanel(new BorderLayout());
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

        // FOOTER: thông tin bên trái, phân trang bên phải
        filterInfoLabel = new JLabel();
        filterInfoLabel.setFont(FONT_SMALL);
        filterInfoLabel.setForeground(COLOR_MUTED);

        prevButton = pagerButton("‹");
        nextButton = pagerButton("›");
        pageLabel = new JLabel("0 / 0");
        pageLabel.setFont(FONT_SMALL);
        pageLabel.setForeground(COLOR_MUTED);
        prevButton.addActionListener(e -> changePage(-1));
        nextButton.addActionListener(e -> changePage(1));

        JPanel pager = new JPanel(new FlowLayout(FlowLayout.RIGHT, 6, 0));
        pager.setOpaque(false);
        pager.add(prevButton);
        pager.add(pageLabel);
        pager.add(nextButton);

        JPanel footerPanel = new JPanel(new BorderLayout());
        footerPanel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(0, 0, 1, 0, COLOR_BORDER),
                BorderFactory.createEmptyBorder(8, 0, 8, 0)));
        footerPanel.add(filterInfoLabel, BorderLayout.WEST);
        footerPanel.add(pager, BorderLayout.EAST);

        add(headerPanel, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);
        add(footerPanel, BorderLayout.SOUTH);

        attachFilterListeners();
        attachSelectionListener();
        applyView();
    }

    // ===== API cho MonitoringPanel =====

    /** Nạp lại toàn bộ danh sách phòng, giữ lựa chọn hiện tại. */
    public void setRooms(List<RoomInfo> newRooms) {
        rooms = List.copyOf(newRooms);
        applyView();
    }

    public RoomInfo findRoom(String roomId) {
        return rooms.stream()
                .filter(r -> r.id().equals(roomId))
                .findFirst()
                .orElse(null);
    }

    /** Phòng đang chọn, không phụ thuộc vào trang hay bộ lọc hiện tại. */
    public RoomInfo getSelectedRoom() {
        return selectedRoomId == null ? null : findRoom(selectedRoomId);
    }

    /**
     * Chọn một phòng theo ID và chuyển tới trang chứa phòng đó.
     * @return false nếu phòng không tồn tại hoặc đang bị bộ lọc ẩn.
     */
    public boolean selectRoom(String roomId) {
        if (findRoom(roomId) == null) {
            return false;
        }
        selectedRoomId = roomId;

        for (int i = 0; i < filtered.size(); i++) {
            if (filtered.get(i).id().equals(roomId)) {
                page = i / PAGE_SIZE;
                applyView();
                return true;
            }
        }
        // Phòng bị lọc ẩn: vẫn giữ lựa chọn, bảng không hiển thị dòng nào
        applyView();
        return false;
    }

    /** Đăng ký nhận sự kiện khi người dùng chọn một phòng trên bảng. */
    public void addRoomSelectionListener(Consumer<RoomInfo> listener) {
        selectionListeners.add(listener);
    }

    // ===== Lọc, phân trang, nạp bảng =====

    private void onFilterChanged() {
        page = 0;
        applyView();
    }

    private void changePage(int delta) {
        page += delta;
        applyView();
    }

    private boolean matchesFilter(RoomInfo room) {
        String query = searchField.getText().trim().toLowerCase();
        String status = (String) statusFilterCombo.getSelectedItem();

        boolean matchesText = query.isEmpty()
                || room.id().toLowerCase().contains(query)
                || room.plate().toLowerCase().contains(query);
        boolean matchesStatus = status == null
                || status.equals(ALL_STATUS)
                || room.status().label().equals(status);
        return matchesText && matchesStatus;
    }

    /** Lọc, cắt theo trang, nạp lại bảng và cập nhật các nhãn. */
    private void applyView() {
        filtered = rooms.stream().filter(this::matchesFilter).toList();

        int pageCount = Math.max(1, (filtered.size() + PAGE_SIZE - 1) / PAGE_SIZE);
        page = Math.max(0, Math.min(page, pageCount - 1));

        int from = page * PAGE_SIZE;
        int to = Math.min(from + PAGE_SIZE, filtered.size());
        visible = List.copyOf(filtered.subList(from, to));

        rebuilding = true;
        try {
            model.setRowCount(0);
            for (RoomInfo room : visible) {
                model.addRow(toRow(room));
            }
            restoreSelection();
        } finally {
            rebuilding = false;
        }

        countLabel.setText(String.format("%02d phòng", rooms.size()));
        pageLabel.setText(filtered.isEmpty()
                ? "0 / 0"
                : (from + 1) + "–" + to + " / " + filtered.size());
        prevButton.setEnabled(page > 0);
        nextButton.setEnabled(page < pageCount - 1);
        updateFilterInfo();
    }

    /** Chọn lại dòng của phòng đang được chọn nếu nó nằm trong trang hiện tại. */
    private void restoreSelection() {
        for (int i = 0; i < visible.size(); i++) {
            if (visible.get(i).id().equals(selectedRoomId)) {
                // Chỉ số trong model, cần đổi sang chỉ số trên view vì có thể đã sắp xếp
                int viewRow = roomTable.convertRowIndexToView(i);
                if (viewRow >= 0) {
                    roomTable.setRowSelectionInterval(viewRow, viewRow);
                }
                return;
            }
        }
        roomTable.clearSelection();
    }

    private void updateFilterInfo() {
        String info = String.format("Hiển thị %d / %d phòng.", filtered.size(), rooms.size());
        if (selectedRoomId != null) {
            info += " Đã chọn " + selectedRoomId;
        }
        filterInfoLabel.setText(info);
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

    private static JButton pagerButton(String text) {
        JButton button = new JButton(text);
        button.setFont(FONT_NORMAL);
        button.setFocusPainted(false);
        return button;
    }

    // ===== Sự kiện =====

    private void attachFilterListeners() {
        searchField.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) {
                onFilterChanged();
            }

            @Override
            public void removeUpdate(DocumentEvent e) {
                onFilterChanged();
            }

            @Override
            public void changedUpdate(DocumentEvent e) {
                onFilterChanged();
            }
        });

        statusFilterCombo.addActionListener(e -> onFilterChanged());
    }

    private void attachSelectionListener() {
        roomTable.getSelectionModel().addListSelectionListener(e -> {
            if (e.getValueIsAdjusting() || rebuilding) {
                return;
            }
            int viewRow = roomTable.getSelectedRow();
            if (viewRow < 0) {
                return;
            }
            int modelRow = roomTable.convertRowIndexToModel(viewRow);
            selectedRoomId = (String) model.getValueAt(modelRow, COL_ID);
            updateFilterInfo();

            RoomInfo room = findRoom(selectedRoomId);
            if (room != null) {
                for (Consumer<RoomInfo> listener : selectionListeners) {
                    listener.accept(room);
                }
            }
        });
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
}