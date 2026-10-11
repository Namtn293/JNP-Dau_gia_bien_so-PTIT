package com.auction.ui.panels.control.participant;

import static com.auction.ui.common.Theme.*;
import static com.auction.ui.common.UiKit.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.Dimension;

import java.util.List;
import java.util.function.Consumer;


import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.table.DefaultTableModel;

import com.auction.model.ParticipantInfo;

/**
 * Danh sách người tham gia: ô tìm kiếm, bảng và phân trang.
 * Khi người dùng chọn một dòng, báo ID tài khoản qua userPickedListener.
 */
public class ParticipantsPanel extends JPanel {
    private static final int PAGE_SIZE = 5;
    private static final String FOOTNOTE = "¹ Số yêu cầu trong 5 giây trước HALT; hiện không nhận giá mới.";

    private final Consumer<String> userPickedListener;

    private List<ParticipantInfo> participants = List.of();
    private List<ParticipantInfo> visible = List.of();
    private int page;

    // true khi đang nạp lại bảng bằng code: bỏ qua sự kiện chọn dòng để không ghi đè ô KICK
    private boolean rebuilding;

    private JLabel countLabel;
    private JTextField searchField;
    private DefaultTableModel tableModel;
    private JTable table;
    private JLabel pageLabel;
    private JButton prevButton;
    private JButton nextButton;

    public ParticipantsPanel(Consumer<String> userPickedListener) {
        this.userPickedListener = userPickedListener;

        setLayout(new BorderLayout(0, 8));
        applyCardStyle(this);

        add(buildTop(), BorderLayout.NORTH);
        add(buildTable(), BorderLayout.CENTER);
        add(buildFooter(), BorderLayout.SOUTH);

        applyView();
    }

    // ===== API cho SessionControlPanel =====

    /**
     * Thay danh sách người tham gia.
     * @param resetPaging true khi chuyển sang phòng khác, để quay về trang đầu
     */
    public void setParticipants(List<ParticipantInfo> people, boolean resetPaging) {
        participants = List.copyOf(people);
        if (resetPaging) {
            page = 0;
        }
        applyView();
    }

    // ===== Bố cục =====

    private JPanel buildTop() {
        JLabel title = new JLabel("Người tham gia");
        title.setFont(FONT_NORMAL.deriveFont(Font.BOLD, 15f));

        countLabel = caption("0 tài khoản");
        countLabel.setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 0));

        JPanel titleBox = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        titleBox.setOpaque(false);
        titleBox.add(title);
        titleBox.add(countLabel);

        searchField = new JTextField(16);
        searchField.setToolTipText("Tìm ID / tên người tham gia");
        searchField.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) {
                onSearchChanged();
            }

            @Override
            public void removeUpdate(DocumentEvent e) {
                onSearchChanged();
            }

            @Override
            public void changedUpdate(DocumentEvent e) {
                onSearchChanged();
            }
        });

        JPanel searchBox = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 0));
        searchBox.setOpaque(false);
        searchBox.add(new JLabel("Tìm kiếm:"));
        searchBox.add(searchField);

        JPanel top = new JPanel(new BorderLayout());
        top.setOpaque(false);
        top.add(titleBox, BorderLayout.WEST);
        top.add(searchBox, BorderLayout.EAST);
        return top;
    }

    private JScrollPane buildTable() {
        tableModel = new DefaultTableModel(ParticipantRenderer.COLUMNS, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        table = new JTable(tableModel);
        table.setFont(FONT_NORMAL);
        table.setRowHeight(36);
        table.setGridColor(COLOR_BORDER);
        table.setShowVerticalLines(false);
        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        table.setDefaultRenderer(Object.class, new ParticipantRenderer());
        table.getTableHeader().setFont(FONT_LABEL);
        table.getTableHeader().setPreferredSize(new Dimension(0, 40));
        table.getTableHeader().setReorderingAllowed(false);
        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && !rebuilding) {
                onRowPicked();
            }
        });

        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createLineBorder(COLOR_BORDER));
        scroll.getViewport().setBackground(Color.WHITE);
        return scroll;
    }

    private JPanel buildFooter() {
        prevButton = pagerButton("‹");
        nextButton = pagerButton("›");
        prevButton.addActionListener(e -> changePage(-1));
        nextButton.addActionListener(e -> changePage(1));
        pageLabel = caption("0 / 0");

        JPanel pager = new JPanel(new FlowLayout(FlowLayout.RIGHT, 6, 0));
        pager.setOpaque(false);
        pager.add(prevButton);
        pager.add(pageLabel);
        pager.add(nextButton);

        JPanel footer = new JPanel(new BorderLayout());
        footer.setOpaque(false);
        footer.add(caption(FOOTNOTE), BorderLayout.WEST);
        footer.add(pager, BorderLayout.EAST);
        return footer;
    }

    private static JButton pagerButton(String text) {
        JButton button = new JButton(text);
        button.setFont(FONT_NORMAL);
        button.setFocusPainted(false);
        return button;
    }

    // ===== Sự kiện =====

    private void onSearchChanged() {
        page = 0;
        applyView();
    }

    private void changePage(int delta) {
        page += delta;
        applyView();
    }

    /** Chọn một dòng thì báo ID tài khoản của dòng đó ra ngoài. */
    private void onRowPicked() {
        int viewRow = table.getSelectedRow();
        if (viewRow >= 0 && viewRow < visible.size()) {
            userPickedListener.accept(visible.get(viewRow).userId());
        }
    }

    // ===== Lọc, phân trang, nạp bảng =====

    /** Lọc theo ô tìm kiếm, cắt theo trang, rồi nạp lại bảng và giữ lựa chọn nếu có thể. */
    private void applyView() {
        String keepUser = selectedUserId();
        String query = searchField.getText().trim().toLowerCase();

        List<ParticipantInfo> filtered = participants.stream()
                .filter(p -> query.isEmpty()
                        || p.userId().toLowerCase().contains(query)
                        || p.fullName().toLowerCase().contains(query))
                .toList();

        int pageCount = Math.max(1, (filtered.size() + PAGE_SIZE - 1) / PAGE_SIZE);
        page = Math.max(0, Math.min(page, pageCount - 1));

        int from = page * PAGE_SIZE;
        int to = Math.min(from + PAGE_SIZE, filtered.size());
        visible = List.copyOf(filtered.subList(from, to));

        rebuilding = true;
        try {
            tableModel.setRowCount(0);
            for (ParticipantInfo p : visible) {
                tableModel.addRow(toRow(p));
            }
            restoreSelection(keepUser);
        } finally {
            rebuilding = false;
        }

        countLabel.setText(participants.size() + " tài khoản");
        pageLabel.setText(filtered.isEmpty() ? "0 / 0" : (from + 1) + "–" + to + " / " + filtered.size());
        prevButton.setEnabled(page > 0);
        nextButton.setEnabled(page < pageCount - 1);
    }

    private String selectedUserId() {
        int viewRow = table.getSelectedRow();
        return (viewRow >= 0 && viewRow < visible.size()) ? visible.get(viewRow).userId() : null;
    }

    private void restoreSelection(String userId) {
        if (userId != null) {
            for (int i = 0; i < visible.size(); i++) {
                if (visible.get(i).userId().equals(userId)) {
                    table.setRowSelectionInterval(i, i);
                    return;
                }
            }
        }
        table.clearSelection();
    }

    private static Object[] toRow(ParticipantInfo p) {
        return new Object[] {
                p.userId(),
                p.fullName(),
                p.connection(),
                p.bidsInLast5s(),
                p.lastPrice(),
                p.rttMs()
        };
    }
}