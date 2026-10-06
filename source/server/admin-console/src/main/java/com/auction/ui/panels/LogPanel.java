package com.auction.ui.panels;

import static com.auction.ui.Theme.*;

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

    public static StyledDocument createDocument() {
        return new DefaultStyledDocument();
    }

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
            @Override
            public void insertUpdate(DocumentEvent e) {
                scrollToEndIfNeed();
            }

            @Override
            public void removeUpdate(DocumentEvent e) {
                // ...
            }

            @Override
            public void changedUpdate(DocumentEvent e) {
                // ...
            }
        });
    }

    private void scrollToEndIfNeed() {
        if (!autoScroll) {
            return;
        }

        SwingUtilities.invokeLater(() -> textPane.setCaretPosition(textPane.getDocument().getLength()));
    }

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

    private void copyToClipboard() {
        StringSelection selection = new StringSelection(textPane.getText());
        Toolkit.getDefaultToolkit().getSystemClipboard().setContents(selection, null);
    }

    private void clearDocument() {
        try {
            document.remove(0, document.getLength());
        } catch (BadLocationException e) {
            throw new IllegalStateException(e);
        }
    }

    public void append(Level level, String message) {
        appendTo(document, level, message);
    }

    public void append(String time ,Level level, String message) {
        appendTo(document, time, level, message);
    }

    public static void appendTo(StyledDocument doc, Level level, String message) {
        appendTo(doc, LocalTime.now().format(TIME_FORMAT), level, message);
    }

    public static void appendTo(StyledDocument doc, String time, Level level, String message) {
        if (SwingUtilities.isEventDispatchThread()) {
            write(doc, time, level, message);
        } else {
            SwingUtilities.invokeLater(() -> write(doc, time, level, message));
        }
    }

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

    private static SimpleAttributeSet style(Color color, boolean bold) {
        SimpleAttributeSet set = new SimpleAttributeSet();
        StyleConstants.setForeground(set, color);
        StyleConstants.setBold(set, bold);

        return set;
    }

    public static void loadSampleLog(StyledDocument doc) {
        appendTo(doc, "14:00:00", Level.INFO,
                "Admin Console đã khởi động");

        appendTo(doc, "14:00:01", Level.SUCCESS,
                "Kết nối tới server thành công");

        appendTo(doc, "14:00:05", Level.COMMAND,
                "Gửi yêu cầu xem danh sách phiên đấu giá");

        appendTo(doc, "14:00:06", Level.INFO,
                "Nhận danh sách phiên đấu giá từ server");

        appendTo(doc, "14:00:10", Level.WARNING,
                "Một phiên đấu giá sắp kết thúc");

        appendTo(doc, "14:00:15", Level.ERROR,
                "Không thể gửi lệnh: kết nối bị gián đoạn");
    }
}
