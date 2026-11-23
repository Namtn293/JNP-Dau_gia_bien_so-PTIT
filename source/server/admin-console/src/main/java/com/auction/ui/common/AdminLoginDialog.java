package com.auction.ui.common;

import com.auction.gateway.AdminGateway;
import com.auction.model.AdminSession;

import javax.swing.*;
import java.awt.*;
import java.util.concurrent.CompletionException;

import static com.auction.ui.common.Theme.*;

public final class AdminLoginDialog extends JDialog {

    private final AdminGateway gateway;
    private final JTextField usernameField = new JTextField(22);
    private final JPasswordField passwordField = new JPasswordField(22);
    private final JLabel statusLabel = new JLabel(" ");
    private final JButton loginButton = new JButton("Đăng nhập");
    private final JButton cancelButton = new JButton("Thoát");

    private AdminSession authenticatedSession;

    private AdminLoginDialog(AdminGateway gateway) {
        super((Frame) null, "Đăng nhập Quản trị viên", true);
        this.gateway = gateway;
        initUi();
    }

    public static AdminSession showLogin(AdminGateway gateway) {
        AdminLoginDialog dialog = new AdminLoginDialog(gateway);
        dialog.setVisible(true);
        return dialog.authenticatedSession;
    }

    private void initUi() {
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setResizable(false);

        JPanel root = new JPanel(new BorderLayout(0, 14));
        root.setBorder(BorderFactory.createEmptyBorder(20, 24, 18, 24));

        JPanel header = new JPanel();
        header.setLayout(new BoxLayout(header, BoxLayout.Y_AXIS));
        JLabel title = new JLabel("ĐĂNG NHẬP ADMIN CONSOLE");
        title.setFont(FONT_TITLE);
        JLabel subtitle = new JLabel("Sử dụng tài khoản có quyền ADMIN để quản trị hệ thống");
        subtitle.setFont(FONT_SMALL);
        subtitle.setForeground(COLOR_MUTED);
        header.add(title);
        header.add(Box.createVerticalStrut(4));
        header.add(subtitle);

        JPanel form = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(6, 4, 6, 4);
        gbc.anchor = GridBagConstraints.WEST;

        gbc.gridx = 0;
        gbc.gridy = 0;
        form.add(new JLabel("Tài khoản / Email:"), gbc);

        gbc.gridx = 1;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1.0;
        form.add(usernameField, gbc);

        gbc.gridx = 0;
        gbc.gridy = 1;
        gbc.fill = GridBagConstraints.NONE;
        gbc.weightx = 0;
        form.add(new JLabel("Mật khẩu:"), gbc);

        gbc.gridx = 1;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1.0;
        form.add(passwordField, gbc);

        statusLabel.setFont(FONT_SMALL);
        statusLabel.setForeground(COLOR_DANGER);

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        cancelButton.addActionListener(e -> {
            authenticatedSession = null;
            dispose();
        });
        loginButton.addActionListener(e -> submitLogin());
        actions.add(cancelButton);
        actions.add(loginButton);

        JPanel footer = new JPanel(new BorderLayout(0, 10));
        footer.add(statusLabel, BorderLayout.NORTH);
        footer.add(actions, BorderLayout.SOUTH);

        root.add(header, BorderLayout.NORTH);
        root.add(form, BorderLayout.CENTER);
        root.add(footer, BorderLayout.SOUTH);

        setContentPane(root);
        getRootPane().setDefaultButton(loginButton);
        pack();
        setLocationRelativeTo(null);
    }

    private void submitLogin() {
        String username = usernameField.getText().trim();
        String password = new String(passwordField.getPassword());

        if (username.isEmpty() || password.isEmpty()) {
            statusLabel.setForeground(COLOR_DANGER);
            statusLabel.setText("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
            return;
        }

        setBusy(true);
        statusLabel.setForeground(COLOR_MUTED);
        statusLabel.setText("Đang xác thực...");

        gateway.login(username, password).whenComplete((session, error) -> SwingUtilities.invokeLater(() -> {
            setBusy(false);
            if (error != null) {
                Throwable cause = error instanceof CompletionException && error.getCause() != null
                        ? error.getCause()
                        : error;
                statusLabel.setForeground(COLOR_DANGER);
                statusLabel.setText(cause.getMessage() != null ? cause.getMessage() : "Đăng nhập thất bại");
                passwordField.selectAll();
                passwordField.requestFocusInWindow();
                return;
            }
            this.authenticatedSession = session;
            dispose();
        }));
    }

    private void setBusy(boolean busy) {
        usernameField.setEnabled(!busy);
        passwordField.setEnabled(!busy);
        loginButton.setEnabled(!busy);
        cancelButton.setEnabled(!busy);
    }
}
