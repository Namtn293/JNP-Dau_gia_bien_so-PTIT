package com.auction.ui.log;

import static com.auction.ui.common.Theme.*;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.Toolkit;
import java.awt.datatransfer.StringSelection;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextPane;
import javax.swing.SwingUtilities;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.text.BadLocationException;
import javax.swing.text.DefaultStyledDocument;
import javax.swing.text.SimpleAttributeSet;
import javax.swing.text.StyleConstants;
import javax.swing.text.StyledDocument;

public class LogPanel extends JPanel {
    public enum Level {
        INFO("THÔNG TIN", COLOR_LOG_MUTED),
        WARNING("CẢNH BÁO", COLOR_LOG_WARNING),
        COMMAND("LỆNH", COLOR_LOG_COMMAND),
        SUCCESS("THÀNH CÔNG", COLOR_LOG_SUCCESS),
        ERROR("LỖI", COLOR_LOG_ERROR);

        private final String label;
        private final Color color;

        /** Khởi tạo thành phần Swing, bố cục và trạng thái ban đầu. */
        Level(String label, Color color) {
            this.label = label;
            this.color = color;
        }
    }

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final JTextPane textPane = new JTextPane();
    private final StyledDocument document;
    private JButton autoScrollButton;
    private boolean autoScroll = true;

    /** Khởi tạo document lưu nội dung log và theo dõi thay đổi. */
    public static StyledDocument createDocument() {
        return new DefaultStyledDocument();
    }

    /** Khởi tạo thành phần Swing, bố cục và trạng thái ban đầu. */
    public LogPanel(StyledDocument sharedDocument) {
        this.document = sharedDocument;
        textPane.setDocument(sharedDocument);

        setLayout(new BorderLayout());
        setBackground(COLOR_LOG_BG);

        textPane.setEditable(false);
        textPane.setBackground(COLOR_LOG_BG);
        textPane.setFont(FONT_MONO);
        textPane.setBorder(BorderFactory.createEmptyBorder(4, 16, 8, 16));

        JScrollPane scrollPane = new JScrollPane(textPane);
        scrollPane.setBorder(null);

        add(createHeader(), BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);

        document.addDocumentListener(new DocumentListener() {
            /** Xử lý sự kiện văn bản được chèn vào Swing Document. */
            @Override
            public void insertUpdate(DocumentEvent e) {
                scrollToEndIfNeed();
            }

            /** Xử lý sự kiện văn bản bị xóa khỏi Swing Document. */
            @Override
            public void removeUpdate(DocumentEvent e) {
                // ...
            }

            /** Xử lý sự kiện thay đổi thuộc tính của Swing Document. */
            @Override
            public void changedUpdate(DocumentEvent e) {
                // ...
            }
        });
    }

    /** Cuộn đến cuối log theo điều kiện hiện tại. */
    private void scrollToEndIfNeed() {
        if (!autoScroll) {
            return;
        }

        SwingUtilities.invokeLater(() -> textPane.setCaretPosition(textPane.getDocument().getLength()));
    }

    /** Tạo tiêu đề và các thao tác của khu vực log. */
    private JPanel createHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setOpaque(false);
        header.setBorder(BorderFactory.createEmptyBorder(10, 8, 4, 8));

        JPanel left = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        left.setOpaque(false);
        JLabel title = new JLabel("Nhật ký lệnh / Kết quả");
        title.setFont(FONT_NORMAL.deriveFont(Font.BOLD));
        title.setForeground(COLOR_LOG_TEXT);
        JLabel channel = new JLabel("Raw TCP :9090");
        channel.setFont(FONT_SMALL);
        channel.setForeground(COLOR_LOG_MUTED);
        left.add(title);
        left.add(channel);

        autoScrollButton = createLinkButton("Tự cuộn: Bật");
        JButton copyButton = createLinkButton("Sao chép");
        JButton clearButton = createLinkButton("Xóa hiển thị");

        autoScrollButton.addActionListener(e -> {
            autoScroll = !autoScroll;
            autoScrollButton.setText(autoScroll ? "Tự cuộn: Bật" : "Tự cuộn: Tắt");
        });
        copyButton.addActionListener(e -> copyToClipboard());
        clearButton.addActionListener(e -> clearDocument());

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 4, 0));
        right.setOpaque(false);
        right.add(autoScrollButton);
        right.add(copyButton);
        right.add(clearButton);

        header.add(left, BorderLayout.WEST);
        header.add(right, BorderLayout.EAST);

        return header;
    }

    /** Tạo nút thao tác log theo kiểu liên kết. */
    private JButton createLinkButton(String text) {
        JButton button = new JButton(text);
        button.setFont(FONT_SMALL);
        button.setForeground(COLOR_LOG_MUTED);
        button.setFocusPainted(false);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));

        return button;
    }

    /** Sao chép nội dung log vào clipboard. */
    private void copyToClipboard() {
        StringSelection selection = new StringSelection(textPane.getText());
        Toolkit.getDefaultToolkit().getSystemClipboard().setContents(selection, null);
    }

    /** Xóa nội dung log đang hiển thị. */
    private void clearDocument() {
        try {
            document.remove(0, document.getLength());
        } catch (BadLocationException e) {
            throw new IllegalStateException(e);
        }
    }

    /** Thêm một mục log theo loại hoặc mức độ tương ứng. */
    public void append(Level level, String message) {
        appendTo(document, level, message);
    }

    /** Thêm một mục log theo loại hoặc mức độ tương ứng. */
    public void append(String time, Level level, String message) {
        appendTo(document, time, level, message);
    }

    /** Chuyển mục log đến document đích. */
    public static void appendTo(StyledDocument doc, Level level, String message) {
        appendTo(doc, LocalTime.now().format(TIME_FORMAT), level, message);
    }

    /** Chuyển mục log đến document đích. */
    public static void appendTo(StyledDocument doc, String time, Level level, String message) {
        if (SwingUtilities.isEventDispatchThread()) {
            write(doc, time, level, message);
        } else {
            SwingUtilities.invokeLater(() -> write(doc, time, level, message));
        }
    }

    /** Ghi nội dung log có định dạng vào document Swing. */
    private static void write(StyledDocument doc, String time, Level level, String message) {
        try {
            doc.insertString(doc.getLength(), time + "  ", style(COLOR_LOG_MUTED, false));
            doc.insertString(doc.getLength(),
                    String.format("%-11s", level.label) + "  ", style(level.color, true));
            doc.insertString(doc.getLength(), message + "\n", style(COLOR_LOG_TEXT, false));
        } catch (BadLocationException e) {
            throw new IllegalStateException(e);
        }
    }

    /** Tạo kiểu chữ và màu sắc theo loại log. */
    private static SimpleAttributeSet style(Color color, boolean bold) {
        SimpleAttributeSet set = new SimpleAttributeSet();
        StyleConstants.setForeground(set, color);
        StyleConstants.setBold(set, bold);

        return set;
    }

    /** Nạp nội dung log mẫu được định nghĩa trong ứng dụng. */
    public static void loadSampleLog(StyledDocument doc) {
        String now = LocalTime.now().format(TIME_FORMAT);
        appendTo(doc, now, Level.INFO, "Admin Console đã khởi động");
        appendTo(doc, now, Level.INFO, "Đang nhận UDP metrics/alert cổng 8888 & đo RTT cổng 9002");
        appendTo(doc, now, Level.SUCCESS, "Kênh điều khiển khẩn cấp Raw TCP :9090 sẵn sàng");
    }
}
