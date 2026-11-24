package com.auction.ui.panels.control;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.swing.BorderFactory;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;
import javax.swing.Timer;
import javax.swing.text.StyledDocument;
import javax.swing.JScrollPane;

import com.auction.gateway.AdminGateway;
import com.auction.model.ParticipantInfo;
import com.auction.model.RoomInfo;
import com.auction.model.ServerMetrics;
import com.auction.ui.common.CommandLogger;
import com.auction.ui.common.RoomSelection;
import com.auction.ui.common.LogPanel;
import com.auction.ui.panels.control.intervention.InterventionPanel;
import com.auction.ui.panels.control.participant.ParticipantsPanel;
import com.auction.ui.panels.control.session.SessionHeader;
import com.auction.ui.panels.control.session.SessionInfoCard;

/**
 * Tab "Điều khiển phiên": điều phối các thành phần con và làm mới dữ liệu mỗi
 * giây.
 * Chỉ lớp này biết gateway và RoomSelection; các thành phần con nhận dữ liệu và
 * báo sự kiện qua callback.
 */
public class SessionControlPanel extends JPanel implements InterventionPanel.Listener {
    private static final int REFRESH_MS = 1000;

    private final AdminGateway gateway;
    private final StyledDocument logDocument;
    private final RoomSelection selection;

    // Thành phần con
    private final SessionHeader header = new SessionHeader();
    private final SessionInfoCard sessionCard = new SessionInfoCard();
    private final InterventionPanel intervention = new InterventionPanel(this);
    private final ParticipantsPanel participantsPanel = new ParticipantsPanel(
            userId -> intervention.setKickAccount(userId));

    private String loadedRoomId;
    private long participantRequestId;
    private final Map<String, List<ParticipantInfo>> participantCache = new ConcurrentHashMap<>();

    private volatile boolean metricsFetchFailed;
    private boolean refreshErrorLogged;

    public SessionControlPanel(AdminGateway gateway, StyledDocument logDocument, RoomSelection selection) {
        this.gateway = gateway;
        this.logDocument = logDocument;
        this.selection = selection;

        setLayout(new BorderLayout(0, 12));
        setBorder(BorderFactory.createEmptyBorder(14, 18, 12, 18));

        add(header, BorderLayout.NORTH);
        add(createBody(), BorderLayout.CENTER);

        LogPanel logPanel = new LogPanel(logDocument);
        logPanel.setPreferredSize(new Dimension(0, 140));
        add(logPanel, BorderLayout.SOUTH);

        selection.addListener(this::onRoomSelectionChanged);
        onRoomSelectionChanged(selection.room());
        refresh();
        new Timer(REFRESH_MS, e -> refresh()).start();
    }

    // ===== Bố cục =====
    private JPanel createBody() {
        JPanel left = new JPanel(new BorderLayout(0, 12));
        left.setOpaque(false);
        left.add(sessionCard, BorderLayout.NORTH);
        left.add(participantsPanel, BorderLayout.CENTER);

        // Khung can thiệp cuộn riêng, giống QuickControlPanel trên tab Giám sát
        JScrollPane interventionScroll = new JScrollPane(intervention);
        interventionScroll.setPreferredSize(new Dimension(360, 0));
        interventionScroll.setBorder(BorderFactory.createEmptyBorder());
        interventionScroll.setOpaque(false);
        interventionScroll.getViewport().setOpaque(false);
        interventionScroll.getVerticalScrollBar().setUnitIncrement(16);
        interventionScroll.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);

        JPanel body = new JPanel(new BorderLayout(14, 0));
        body.setOpaque(false);
        body.add(left, BorderLayout.CENTER);
        body.add(interventionScroll, BorderLayout.EAST);
        return body;
    }

    // ===== Làm mới dữ liệu =====
    private void refresh() {
        gateway.fetchMetrics().whenComplete((metrics, error) -> {
            metricsFetchFailed = error != null;
            SwingUtilities.invokeLater(() -> {
                if (error == null) {
                    header.updateMetrics(metrics);
                } else {
                    header.showOffline();
                }
            });
        });

        refreshRoomInfo();
        refreshParticipants();
    }

    private void refreshRoomInfo() {
        String roomId = selection.roomId();
        gateway.fetchRooms().whenComplete((rooms, error) -> SwingUtilities.invokeLater(() -> {
            if (error != null) {
                reportRefreshError(error);
                return;
            }
            if (!java.util.Objects.equals(roomId, selection.roomId())) {
                return;
            }
            RoomInfo room = findRoom(rooms, roomId);
            if (room == null) {
                selection.select(null);
                return;
            }
            selection.select(room);
            refreshErrorLogged = false;
        }));
    }

    private void refreshParticipants() {
        String roomId = selection.roomId();
        if (roomId == null) {
            return;
        }
        long requestId = ++participantRequestId;
        participantsPanel.setLoading(participantCache.containsKey(roomId) ? "Đang cập nhật" : "Đang tải danh sách...");
        gateway.fetchParticipants(roomId).whenComplete((people, error) -> SwingUtilities.invokeLater(() -> {
            if (requestId != participantRequestId || !roomId.equals(selection.roomId())) {
                return;
            }
            if (error != null) {
                reportRefreshError(error);
                participantsPanel.setLoading("Không tải được danh sách");
                return;
            }
            participantCache.put(roomId, people);
            participantsPanel.setParticipants(people, false);
            refreshErrorLogged = false;
        }));
    }

    private void onRoomSelectionChanged(RoomInfo room) {
        participantRequestId++;
        if (room == null) {
            clearRoom();
            return;
        }
        applyRoom(room);
        boolean roomChanged = !room.id().equals(loadedRoomId);
        loadedRoomId = room.id();
        List<ParticipantInfo> cached = participantCache.get(room.id());
        if (roomChanged) {
            participantsPanel.setParticipants(cached == null ? List.of() : cached, true);
        }
        participantsPanel.setLoading(cached == null ? "Đang tải danh sách..." : "Đang cập nhật");
        if (roomChanged) {
            refreshParticipants();
        }
    }

    private void reportRefreshError(Throwable error) {
        Throwable cause = error instanceof java.util.concurrent.CompletionException && error.getCause() != null
                ? error.getCause() : error;
        if (!refreshErrorLogged) {
            LogPanel.appendTo(logDocument, LogPanel.Level.ERROR, "Lỗi làm mới dữ liệu: " + cause.getMessage());
            refreshErrorLogged = true;
        }
    }

    private static RoomInfo findRoom(List<RoomInfo> rooms, String roomId) {
        if (roomId == null) {
            return null;
        }
        return rooms.stream()
                .filter(r -> r.id().equals(roomId))
                .findFirst()
                .orElse(null);
    }

    private void applyRoom(RoomInfo room) {
        sessionCard.setRoom(room);
        header.setRoom(room);
        intervention.setRoom(room);
    }

    private void clearRoom() {
        loadedRoomId = null;

        sessionCard.setRoom(null);
        header.setRoom(null);
        intervention.setRoom(null);
        participantsPanel.setParticipants(List.of(), true);
        participantsPanel.setLoading("");
    }

    // ===== Callback từ InterventionPanel =====

    @Override
    public void onHalt(String roomId) {
        CommandLogger.dispatch(logDocument, "> HALT " + roomId, gateway.halt(roomId), this::refresh);
    }

    @Override
    public void onResume(String roomId) {
        CommandLogger.dispatch(logDocument, "> RESUME " + roomId, gateway.resume(roomId), this::refresh);
    }

    @Override
    public void onKick(String userId, String roomId) {
        CommandLogger.dispatch(logDocument,
                "> KICK " + userId + " (từ phòng " + roomId + ")",
                gateway.kick(userId, roomId), this::refresh);
    }

    @Override
    public void onUnkick(String userId, String roomId) {
        CommandLogger.dispatch(logDocument,
                "> UNKICK " + userId + " (cho phép vào lại phòng " + roomId + ")",
                gateway.unkick(userId, roomId), this::refresh);
    }

    @Override
    public void onCancel(String roomId) {
        CommandLogger.dispatch(logDocument, "> CANCEL " + roomId, gateway.cancel(roomId), this::refresh);
    }
}
