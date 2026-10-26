package com.auction.ui.panels.control.intervention;

import static com.auction.ui.common.Theme.*;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.GridLayout;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;

import com.auction.AdminConfig;
import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;
import com.auction.ui.common.ButtonStyles;
import com.auction.ui.common.UiKit;

/**
 * Khung "Can thiệp phiên" bên phải tab Điều khiển phiên.
 * Panel chỉ quản lý giao diện và kiểm tra điều kiện bật tắt nút.
 * Việc gửi lệnh được chuyển cho Listener.
 */
public class InterventionPanel extends JPanel {

    public interface Listener {
        void onHalt(String roomId);

        void onResume(String roomId);

        void onKick(String userId, String roomId);

        void onCancel(String roomId);
    }

    private final Listener listener;
    private RoomInfo room;

    private final JLabel targetRoomLabel = new JLabel("—");
    private final JTextField kickField = new JTextField(AdminConfig.DEFAULT_KICK_ACCOUNT);
    private final JButton haltButton = ButtonStyles.filled("HALT", COLOR_DANGER);
    private final JButton resumeButton = ButtonStyles.filled("RESUME", COLOR_PRIMARY);
    private final JButton kickButton = ButtonStyles.filled("KICK", COLOR_DANGER);
    private final JButton cancelButton = ButtonStyles.outline("CANCEL");

    public InterventionPanel(Listener listener) {
        this.listener = listener;

        setLayout(new BorderLayout());
        UiKit.applyCardStyle(this);

        add(buildColumn(), BorderLayout.NORTH);
        wireListeners();
        setRoom(null);
    }

    // ===== API cho SessionControlPanel =====

    /** Đặt phòng mục tiêu. Truyền null khi không có phòng nào được chọn. */
    public void setRoom(RoomInfo room) {
        this.room = room;
        targetRoomLabel.setText(room == null ? "—" : room.id());
        updateButtons();
    }

    /** Điền ID tài khoản cho KICK, thường là dòng vừa chọn trong bảng người tham gia. */
    public void setKickAccount(String userId) {
        kickField.setText(userId);
    }

    // ===== Bố cục =====

    private JPanel buildColumn() {
        JPanel column = new JPanel();
        column.setLayout(new BoxLayout(column, BoxLayout.Y_AXIS));
        column.setOpaque(false);

        column.add(createHead());
        column.add(Box.createVerticalStrut(12));

        column.add(UiKit.fieldLabel("ID phòng mục tiêu"));
        column.add(Box.createVerticalStrut(4));
        targetRoomLabel.setFont(FONT_NORMAL);
        targetRoomLabel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(COLOR_BORDER),
                BorderFactory.createEmptyBorder(6, 8, 6, 8)));
        targetRoomLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        targetRoomLabel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 32));
        column.add(targetRoomLabel);
        column.add(UiKit.caption("Chọn phòng ở tab Giám sát để đổi mục tiêu."));
        column.add(Box.createVerticalStrut(12));

        JPanel controls = new JPanel(new GridLayout(1, 2, 10, 0));
        controls.setOpaque(false);
        controls.setAlignmentX(Component.LEFT_ALIGNMENT);
                controls.add(actionGroup(haltButton,
                "<html>HALT khóa đặt giá.<br>Đếm ngược<br>bị đóng băng.</html>"));
                controls.add(actionGroup(resumeButton,
                "<html>RESUME mở lại<br>đặt giá,<br>cộng " + AdminConfig.EXTENSION_SECONDS + " giây.</html>"));
        column.add(controls);
        column.add(Box.createVerticalStrut(16));

        column.add(UiKit.fieldLabel("ID tài khoản cho KICK"));
        column.add(Box.createVerticalStrut(4));
        kickField.setFont(FONT_NORMAL);
        kickField.setAlignmentX(Component.LEFT_ALIGNMENT);
        kickField.setMaximumSize(new Dimension(Integer.MAX_VALUE, 32));
        column.add(kickField);
        column.add(Box.createVerticalStrut(8));

               column.add(actionGroup(kickButton,
                "<html>KICK cưỡng chế ngắt kết nối WebSocket của tài khoản.</html>"));
        column.add(Box.createVerticalStrut(16));

        column.add(actionGroup(cancelButton,
                "<html>CANCEL hủy phiên, hoàn 100% tiền cọc.<br>Bắt buộc xác nhận trước khi gửi.</html>"));

        return column;
    }

    private JPanel createHead() {
        JPanel head = new JPanel(new BorderLayout());
        head.setOpaque(false);
        head.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel title = new JLabel("Can thiệp phiên");
        title.setFont(FONT_LABEL.deriveFont(15f));
        title.setForeground(COLOR_TEXT);

        head.add(title, BorderLayout.WEST);
        head.add(UiKit.caption("TCP :9090"), BorderLayout.EAST);
        return head;
    }

    private static JPanel actionGroup(JButton button, String descHtml) {
        JPanel group = new JPanel(new BorderLayout(0, 4));
        group.setOpaque(false);
        group.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel desc = new JLabel(descHtml);
        desc.setFont(FONT_SMALL);
        desc.setForeground(COLOR_MUTED);
        desc.setVerticalAlignment(SwingConstants.TOP);

        group.add(button, BorderLayout.NORTH);
        group.add(desc, BorderLayout.CENTER);
        return group;
    }

    // ===== Sự kiện =====

    private void wireListeners() {
        haltButton.addActionListener(e -> {
            if (room != null) {
                listener.onHalt(room.id());
            }
        });
        resumeButton.addActionListener(e -> {
            if (room != null) {
                listener.onResume(room.id());
            }
        });
        kickButton.addActionListener(e -> {
            if (room != null) {
                listener.onKick(kickField.getText().trim(), room.id());
            }
        });
        cancelButton.addActionListener(e -> confirmCancel());

        kickField.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) {
                updateButtons();
            }

            @Override
            public void removeUpdate(DocumentEvent e) {
                updateButtons();
            }

            @Override
            public void changedUpdate(DocumentEvent e) {
                updateButtons();
            }
        });
    }

    private void confirmCancel() {
        if (room == null) {
            return;
        }
        int confirm = JOptionPane.showConfirmDialog(
                SwingUtilities.getWindowAncestor(this),
                "Hủy phiên " + room.id() + "?\nHoàn 100% tiền cọc cho tất cả mọi người.",
                "Xác nhận Cancel",
                JOptionPane.OK_CANCEL_OPTION,
                JOptionPane.WARNING_MESSAGE);
        if (confirm == JOptionPane.OK_OPTION) {
            listener.onCancel(room.id());
        }
    }

    /** Nút bật hay tắt theo phòng đang chọn và ô KICK. */
    private void updateButtons() {
        boolean hasRoom = room != null;
        RoomStatus status = hasRoom ? room.status() : null;
        boolean hasKickTarget = hasRoom && !kickField.getText().trim().isEmpty();

        ButtonStyles.setFilled(haltButton, hasRoom && status.canHalt(), COLOR_DANGER);
        ButtonStyles.setFilled(resumeButton, hasRoom && status.canResume(), COLOR_PRIMARY);
        ButtonStyles.setFilled(kickButton, hasKickTarget, COLOR_DANGER);
        ButtonStyles.setOutline(cancelButton, hasRoom && !status.isFinished());
    }
}