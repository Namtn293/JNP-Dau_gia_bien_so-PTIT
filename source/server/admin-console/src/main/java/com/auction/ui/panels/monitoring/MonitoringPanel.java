package com.auction.ui.panels.monitoring;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

import javax.swing.BorderFactory;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.SwingUtilities;
import javax.swing.Timer;
import javax.swing.text.StyledDocument;

import com.auction.AdminConfig;
import com.auction.gateway.AdminGateway;
import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;
import com.auction.ui.common.RoomSelection;
import com.auction.ui.common.LogPanel;
import com.auction.ui.panels.monitoring.metrics.MetricCardsPanel;
import com.auction.ui.panels.monitoring.rooms.RoomTablePanel;
import com.auction.ui.panels.monitoring.quick_control.QuickControlPanel;

import javax.swing.JOptionPane;
import com.auction.model.CreateSessionRequest;
import com.auction.ui.panels.monitoring.rooms.CreateSessionDialog;

/**
 * Điều phối các thành phần trên tab Giám sát:
 * lấy dữ liệu phòng từ gateway, đưa vào bảng, đồng bộ khung điều khiển
 * và ghi phòng đang chọn vào RoomSelection để tab Điều khiển phiên theo dõi.
 */
public class MonitoringPanel extends JPanel {
    private static final int REFRESH_MS = 1000;

    private final AdminGateway gateway;
    private final RoomSelection selection;
    private final MetricCardsPanel metricCardsPanel;
    private final RoomTablePanel roomTablePanel;
    private final QuickControlPanel quickControlPanel;
    private final Timer refreshTimer;
    private Consumer<RoomInfo> openRoomInSessionListener = room -> { };

    private final StyledDocument logDocument;

    public MonitoringPanel(AdminGateway gateway, StyledDocument logDocument, RoomSelection selection) {
        this.gateway = gateway;
        this.selection = selection;

        setLayout(new BorderLayout(0, 12));
        setBorder(BorderFactory.createEmptyBorder(14, 18, 12, 18));

        // North: thẻ chỉ số
        metricCardsPanel = new MetricCardsPanel(gateway);
        add(metricCardsPanel, BorderLayout.NORTH);

        // Center: bảng phòng + điều khiển nhanh
        roomTablePanel = new RoomTablePanel();
        quickControlPanel = new QuickControlPanel(gateway, logDocument);

        JScrollPane quickScrollPane = new JScrollPane(quickControlPanel);
        quickScrollPane.setPreferredSize(new Dimension(360, 0));
        quickScrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
        quickScrollPane.setBorder(BorderFactory.createEmptyBorder());
        quickScrollPane.setOpaque(false);
        quickScrollPane.getViewport().setOpaque(false);
        quickScrollPane.getVerticalScrollBar().setUnitIncrement(16);

        JPanel centerPanel = new JPanel(new BorderLayout(14, 0));
        centerPanel.setOpaque(false);
        centerPanel.add(roomTablePanel, BorderLayout.CENTER);
        centerPanel.add(quickScrollPane, BorderLayout.EAST);
        add(centerPanel, BorderLayout.CENTER);

        // South: nhật ký
        LogPanel logPanel = new LogPanel(logDocument);
        logPanel.setPreferredSize(new Dimension(0, 140));
        add(logPanel, BorderLayout.SOUTH);

        // Nối các thành phần
        roomTablePanel.addRoomSelectionListener(room -> {
            selection.selectRoom(room);
            quickControlPanel.showRoom(room);
        });
        roomTablePanel.addRoomDoubleClickListener(room -> {
            selection.selectRoom(room);
            quickControlPanel.showRoom(room);
            openRoomInSessionListener.accept(room);
        });
        quickControlPanel.addRoomPickedListener(this::onRoomPickedFromCombo);
        quickControlPanel.setOnCommandCompleted(this::refreshRooms);
        roomTablePanel.addCreateSessionListener(
                this::createNewSession);
        roomTablePanel.addDeleteSessionListener(this::deleteSession);

        // Tải lần đầu, sau đó làm mới mỗi giây
        refreshRooms();
        refreshTimer = new Timer(REFRESH_MS, e -> refreshRooms());
        refreshTimer.start();

        this.logDocument = logDocument;
    }

    public void setOpenRoomInSessionListener(Consumer<RoomInfo> listener) {
        openRoomInSessionListener = Objects.requireNonNull(listener);
    }

    private void refreshRooms() {
        gateway.fetchRooms().whenComplete((rooms, error) -> SwingUtilities.invokeLater(() -> {
            if (error == null) {
                applyRooms(rooms);
            } else {
                roomTablePanel.setLoadError("Không tải được danh sách phòng; đang thử lại...");
            }
        }));
    }

    private void applyRooms(List<RoomInfo> rooms) {
        roomTablePanel.setRooms(rooms);
        quickControlPanel.setRoomOptions(rooms.stream().map(RoomInfo::id).toList());

        // Phiên đang nhận giá: đang đấu giá hoặc đang gia hạn
        long activeRooms = rooms.stream()
                .filter(r -> r.status() == RoomStatus.ACTIVE || r.status() == RoomStatus.EXTENDING)
                .count();
        metricCardsPanel.setRoomSummary(rooms.size(), (int) activeRooms);

        RoomInfo selected = roomTablePanel.getSelectedRoom();
        if (selected == null) {
            // Lần đầu hoặc phòng đang chọn đã biến mất: ưu tiên phòng mặc định, sau đó chọn
            // phòng đang đấu / đầu danh sách
            roomTablePanel.selectRoom(AdminConfig.DEFAULT_ROOM_ID);
            selected = roomTablePanel.getSelectedRoom();
            if (selected == null && !rooms.isEmpty()) {
                String fallbackId = rooms.stream()
                        .filter(r -> r.status() == RoomStatus.ACTIVE || r.status() == RoomStatus.EXTENDING)
                        .map(RoomInfo::id)
                        .findFirst()
                        .orElse(rooms.get(0).id());
                roomTablePanel.selectRoom(fallbackId);
                selected = roomTablePanel.getSelectedRoom();
            }
        }
        if (selected != null) {
            selection.selectRoom(selected);
            quickControlPanel.showRoom(selected);
        }
    }

    private void onRoomPickedFromCombo(String roomId) {
        RoomInfo room = roomTablePanel.findRoom(roomId);
        if (room != null) {
            selection.selectRoom(room);
            roomTablePanel.selectRoom(roomId);
            quickControlPanel.showRoom(room);
        }
    }

    private void deleteSession(RoomInfo room) {
        int choice = JOptionPane.showConfirmDialog(
                this,
                "Xóa phiên " + room.id() + " khỏi cơ sở dữ liệu?\n"
                        + "Chỉ xóa được phiên chưa chạy và chưa có lượt đặt giá/đăng ký.",
                "Xác nhận xóa phiên",
                JOptionPane.YES_NO_OPTION,
                JOptionPane.WARNING_MESSAGE);
        if (choice != JOptionPane.YES_OPTION) {
            return;
        }

        roomTablePanel.setDeleteSessionBusy(true);
        gateway.deleteSession(room.id()).whenComplete((result, error) -> SwingUtilities.invokeLater(() -> {
            roomTablePanel.setDeleteSessionBusy(false);
            if (error != null) {
                Throwable cause = error instanceof java.util.concurrent.CompletionException && error.getCause() != null
                        ? error.getCause()
                        : error;
                LogPanel.appendTo(logDocument, LogPanel.Level.ERROR,
                        "Xóa phiên " + room.id() + " thất bại: " + cause.getMessage());
                JOptionPane.showMessageDialog(this, cause.getMessage(), "Không thể xóa phiên",
                        JOptionPane.ERROR_MESSAGE);
                return;
            }
            if (!result.success()) {
                LogPanel.appendTo(logDocument, LogPanel.Level.ERROR, result.message());
                JOptionPane.showMessageDialog(this, result.message(), "Không thể xóa phiên",
                        JOptionPane.WARNING_MESSAGE);
                return;
            }

            LogPanel.appendTo(logDocument, LogPanel.Level.SUCCESS, result.message());
            refreshRooms();
        }));
    }

    private void createNewSession() {

        // 1. Khóa nút trong lúc tải danh sách biển số hợp lệ
        roomTablePanel.setCreateSessionEnabled(false);

        LogPanel.appendTo(
                logDocument,
                LogPanel.Level.INFO,
                "Đang tải danh sách biển số xe hợp lệ...");

        gateway.fetchAvailablePlates().whenComplete((plates, loadError) -> SwingUtilities.invokeLater(() -> {
            if (loadError != null) {
                roomTablePanel.setCreateSessionEnabled(true);
                Throwable cause = loadError;
                if (loadError instanceof java.util.concurrent.CompletionException
                        && loadError.getCause() != null) {
                    cause = loadError.getCause();
                }
                LogPanel.appendTo(
                        logDocument,
                        LogPanel.Level.ERROR,
                        "Tải danh sách biển số thất bại: " + cause.getMessage());
                JOptionPane.showMessageDialog(
                        this,
                        "Không thể tải danh sách biển số hợp lệ: " + cause.getMessage(),
                        "Lỗi",
                        JOptionPane.ERROR_MESSAGE);
                return;
            }

            // 2. Mở form chọn biển số hợp lệ và nhập thông số phiên
            CreateSessionRequest data = CreateSessionDialog.show(this, plates);

            // Nhấn Hủy hoặc không có biển số khả dụng thì mở lại nút và dừng
            if (data == null) {
                roomTablePanel.setCreateSessionEnabled(true);
                return;
            }

            submitCreateSession(data);
        }));
    }

    private void submitCreateSession(CreateSessionRequest data) {
        LogPanel.appendTo(
                logDocument,
                LogPanel.Level.INFO,
                "Đang tạo phiên cho biển số " + data.plateNumber());

        // 3. Gửi request bất đồng bộ
        gateway.createSession(data).whenComplete(
                (sessionCode, error) -> {

                    SwingUtilities.invokeLater(() -> {

                        // 4. Mở lại nút
                        roomTablePanel.setCreateSessionEnabled(true);

                        // 5. Xử lý lỗi
                        if (error != null) {

                            Throwable cause = error;

                            if (error instanceof java.util.concurrent.CompletionException
                                    && error.getCause() != null) {

                                cause = error.getCause();
                            }

                            LogPanel.appendTo(
                                    logDocument,
                                    LogPanel.Level.ERROR,
                                    "Tạo phiên thất bại: " + cause.getMessage());

                            JOptionPane.showMessageDialog(
                                    this,
                                    "Không thể tạo phiên: " + cause.getMessage(),
                                    "Lỗi",
                                    JOptionPane.ERROR_MESSAGE);

                            return;
                        }

                        // 6. Server đã xác nhận tạo thành công
                        LogPanel.appendTo(
                                logDocument,
                                LogPanel.Level.SUCCESS,
                                "Đã tạo phiên: " + sessionCode);

                        // 7. Tải lại danh sách thực từ Core
                        gateway.fetchRooms().whenComplete(
                                (rooms, refreshError) -> {

                                    SwingUtilities.invokeLater(() -> {

                                        if (refreshError != null) {
                                            JOptionPane.showMessageDialog(
                                                    this,
                                                    "Đã tạo phiên " + sessionCode
                                                            + " nhưng chưa tải lại được danh sách.",
                                                    "Lưu thành công",
                                                    JOptionPane.WARNING_MESSAGE);
                                            return;
                                        }

                                        roomTablePanel.showAllRooms();
                                        applyRooms(rooms);

                                        // 8. Chọn phiên vừa tạo
                                        roomTablePanel.selectRoom(sessionCode);

                                        RoomInfo selected = roomTablePanel.findRoom(sessionCode);

                                        if (selected != null) {
                                            selection.selectRoom(selected);
                                            quickControlPanel.showRoom(selected);
                                        } else {
                                            selection.select(sessionCode);
                                        }

                                        JOptionPane.showMessageDialog(
                                                this,
                                                "Đã tạo thành công phiên "
                                                        + sessionCode,
                                                "Thành công",
                                                JOptionPane.INFORMATION_MESSAGE);
                                    });
                                });
                    });
                });
    }

}
