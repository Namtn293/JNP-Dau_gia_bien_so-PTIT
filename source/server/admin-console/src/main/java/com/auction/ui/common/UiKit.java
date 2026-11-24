package com.auction.ui.common;

import static com.auction.ui.common.Theme.*;

import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.LayoutManager;
import java.awt.Rectangle;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.BorderFactory;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.JButton;
import javax.swing.JProgressBar;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.JPanel;
import javax.swing.JTable;
import javax.swing.Scrollable;
import javax.swing.table.TableColumn;
import javax.swing.table.TableColumnModel;

/** Hàm tiện ích tạo component giao diện, dùng chung cho các panel. */
public final class UiKit {
    /** Ngăn khởi tạo lớp tiện ích chỉ chứa thành viên tĩnh. */
    private UiKit() {
    }

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

    /** Thiết lập chiều rộng ưu tiên và tối thiểu cho các cột của JTable. */
    public static void configureTableColumns(JTable table, int[] prefWidths, int[] minWidths) {
        TableColumnModel cols = table.getColumnModel();
        int count = Math.min(cols.getColumnCount(), prefWidths.length);
        for (int i = 0; i < count; i++) {
            TableColumn col = cols.getColumn(i);
            col.setPreferredWidth(prefWidths[i]);
            if (minWidths != null && i < minWidths.length) {
                col.setMinWidth(minWidths[i]);
            }
        }
    }

    /** Nút phân trang có cùng font và trạng thái focus như hai bảng cũ. */
    public static JButton pagerButton(String text) {
        JButton button = new JButton(text);
        button.setFont(FONT_NORMAL);
        button.setFocusPainted(false);
        return button;
    }

    /** Thanh phần trăm 6px; chiều rộng ưu tiên do từng panel quyết định. */
    public static JProgressBar thinBar(int preferredWidth) {
        JProgressBar bar = new JProgressBar(0, 100);
        bar.setValue(0);
        bar.setStringPainted(false);
        bar.setForeground(COLOR_PRIMARY);
        bar.setBackground(new Color(230, 230, 230));
        bar.setBorderPainted(false);
        bar.setPreferredSize(new Dimension(preferredWidth, 6));
        bar.setMaximumSize(new Dimension(Integer.MAX_VALUE, 6));
        bar.setAlignmentX(Component.LEFT_ALIGNMENT);
        return bar;
    }

    /** Chạy cùng callback khi nội dung Document Swing thay đổi. */
    public static DocumentListener onDocumentChange(Runnable callback) {
        return new DocumentListener() {
            /** Xử lý sự kiện văn bản được chèn vào Swing Document. */
            @Override
            public void insertUpdate(DocumentEvent e) {
                callback.run();
            }

            /** Xử lý sự kiện văn bản bị xóa khỏi Swing Document. */
            @Override
            public void removeUpdate(DocumentEvent e) {
                callback.run();
            }

            /** Xử lý sự kiện thay đổi thuộc tính của Swing Document. */
            @Override
            public void changedUpdate(DocumentEvent e) {
                callback.run();
            }
        };
    }

    /** JPanel tự khớp chiều rộng với JScrollPane, ngăn tràn ngang. */
    public static class ScrollablePanel extends JPanel implements Scrollable {
        /** Trả về kích thước ưu tiên cho vùng cuộn. */
        @Override
        public Dimension getPreferredScrollableViewportSize() {
            return getPreferredSize();
        }

        /** Trả về bước cuộn nhỏ. */
        @Override
        public int getScrollableUnitIncrement(Rectangle visibleRect, int orientation, int direction) {
            return 16;
        }

        /** Trả về bước cuộn lớn. */
        @Override
        public int getScrollableBlockIncrement(Rectangle visibleRect, int orientation, int direction) {
            return 64;
        }

        /** Cho panel khớp chiều rộng viewport. */
        @Override
        public boolean getScrollableTracksViewportWidth() {
            return true;
        }

        /** Cho panel giữ chiều cao nội dung để cuộn dọc. */
        @Override
        public boolean getScrollableTracksViewportHeight() {
            return false;
        }
    }
}