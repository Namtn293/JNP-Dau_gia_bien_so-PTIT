package com.auction.ui.panels.monitoring.rooms;

import com.auction.AdminConfig;
import com.auction.model.AvailablePlateInfo;
import com.auction.model.CreateSessionRequest;

import javax.swing.*;
import java.awt.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.List;
import java.util.Locale;

public final class CreateSessionDialog {

    private static final DateTimeFormatter FORMAT = DateTimeFormatter
            .ofPattern("uuuu-MM-dd HH:mm")
            .withResolverStyle(ResolverStyle.STRICT);

    private CreateSessionDialog() {
    }

    public static CreateSessionRequest show(
            Component parent,
            List<AvailablePlateInfo> availablePlates) {

        if (availablePlates == null || availablePlates.isEmpty()) {
            JOptionPane.showMessageDialog(
                    parent,
                    "Hiện không có biển số xe hợp lệ nào khả dụng để tạo phiên mới.",
                    "Không có biển số khả dụng",
                    JOptionPane.INFORMATION_MESSAGE);
            return null;
        }

        LocalDateTime startDefault = LocalDateTime.now()
                .plusHours(1)
                .withSecond(0)
                .withNano(0);

        // 1. Khởi tạo các trường nhập liệu
        JComboBox<AvailablePlateInfo> plateCombo = new JComboBox<>(
                availablePlates.toArray(new AvailablePlateInfo[0]));

        JTextField priceField = new JTextField(
                String.valueOf(AdminConfig.START_PRICE_VND));

        JTextField depositField = new JTextField(
                String.valueOf(AdminConfig.DEPOSIT_VND));

        JTextField startField = new JTextField(
                startDefault.format(FORMAT));

        JTextField endField = new JTextField(
                startDefault.plusHours(1).format(FORMAT));

        // 2. Tạo form
        JPanel form = new JPanel(
                new GridLayout(0, 2, 10, 10));

        form.add(new JLabel("Biển số xe:"));
        form.add(plateCombo);

        form.add(new JLabel("Giá khởi điểm (VNĐ):"));
        form.add(priceField);

        form.add(new JLabel("Tiền đặt cọc (VNĐ):"));
        form.add(depositField);

        form.add(new JLabel("Bắt đầu (yyyy-MM-dd HH:mm):"));
        form.add(startField);

        form.add(new JLabel("Kết thúc (yyyy-MM-dd HH:mm):"));
        form.add(endField);

        // 3. Hiển thị và kiểm tra dữ liệu
        while (true) {

            int choice = JOptionPane.showConfirmDialog(
                    parent,
                    form,
                    "Tạo phiên đấu giá mới",
                    JOptionPane.OK_CANCEL_OPTION,
                    JOptionPane.PLAIN_MESSAGE);

            if (choice != JOptionPane.OK_OPTION) {
                return null;
            }

            try {
                AvailablePlateInfo selectedPlate = (AvailablePlateInfo) plateCombo.getSelectedItem();
                if (selectedPlate == null || selectedPlate.plateNumber() == null
                        || selectedPlate.plateNumber().isBlank()) {
                    throw new IllegalArgumentException(
                            "Vui lòng chọn biển số");
                }
                String plate = selectedPlate.plateNumber()
                        .trim()
                        .toUpperCase(Locale.ROOT);

                long startPrice = Long.parseLong(
                        priceField.getText().trim());

                long deposit = Long.parseLong(
                        depositField.getText().trim());

                if (startPrice <= 0 || deposit <= 0) {
                    throw new IllegalArgumentException(
                            "Giá tiền phải lớn hơn 0");
                }

                LocalDateTime start = LocalDateTime.parse(
                        startField.getText().trim(),
                        FORMAT);

                LocalDateTime end = LocalDateTime.parse(
                        endField.getText().trim(),
                        FORMAT);

                if (!start.isAfter(LocalDateTime.now())) {
                    throw new IllegalArgumentException(
                            "Thời gian bắt đầu phải ở tương lai");
                }

                if (!end.isAfter(start)) {
                    throw new IllegalArgumentException(
                            "Thời gian kết thúc phải sau thời gian bắt đầu");
                }

                // 4. Trả dữ liệu đã nhập
                return new CreateSessionRequest(
                        plate,
                        startPrice,
                        deposit,
                        start,
                        end);

            } catch (RuntimeException ex) {

                JOptionPane.showMessageDialog(
                        parent,
                        "Dữ liệu không hợp lệ: " + ex.getMessage(),
                        "Kiểm tra lại",
                        JOptionPane.WARNING_MESSAGE);
            }
        }
    }
}
