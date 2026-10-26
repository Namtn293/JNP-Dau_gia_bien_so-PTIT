package com.auction.ui.panels.control;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

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
 * Tab "Điều khiển phiên": điều phối các thành phần con và làm mới dữ liệu mỗi giây.
 * Chỉ lớp này biết gateway và RoomSelection; các thành phần con nhận dữ liệu và báo sự kiện qua callback.
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
    private final ParticipantsPanel participantsPanel =
            new ParticipantsPanel(userId -> intervention.setKickAccount(userId));

    private boolean busy;
    private String loadedRoomId;

    /** Dữ liệu của một lần làm mới, lấy đồng thời từ gateway. */
    private record Snapshot(String roomId, List<RoomInfo> rooms, ServerMetrics metrics, List<ParticipantInfo> people) {
    }

    public SessionControlPanel(AdminGateway gateway, StyledDocument logDocument, RoomSelection selection) {
        this.gateway = gateway;
        this.logDocument = logDocument;
        this.selection = selection;

        setLayout(new BorderLayout(0, 12));
        setBorder(BorderFactory.createEmptyBorder(16, 20, 16, 20));

        add(header, BorderLayout.NORTH);
        add(createBody(), BorderLayout.CENTER);

        LogPanel logPanel = new LogPanel(logDocument);
        logPanel.setPreferredSize(new Dimension(0, 190));
        add(logPanel, BorderLayout.SOUTH);

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
        interventionScroll.setPreferredSize(new Dimension(330, 0));
        interventionScroll.setBorder(BorderFactory.createEmptyBorder());
        interventionScroll.setOpaque(false);
        interventionScroll.getViewport().setOpaque(false);
        interventionScroll.getVerticalScrollBar().setUnitIncrement(16);
        interventionScroll.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);

        JPanel body = new JPanel(new BorderLayout(16, 0));
        body.setOpaque(false);
        body.add(left, BorderLayout.CENTER);
        body.add(interventionScroll, BorderLayout.EAST);
        return body;
    }

    // ===== Làm mới dữ liệu =====
    /** Bỏ qua nếu lần làm mới trước chưa xong, tránh gửi chồng yêu cầu. */
    private void refresh() {
        if (busy) {
            return;
        }
        busy = true;

        fetchSnapshot()
                .thenAccept(snapshot -> SwingUtilities.invokeLater(() -> {
                    busy = false;
                    apply(snapshot);
                }))
                .exceptionally(ex -> {
                    SwingUtilities.invokeLater(() -> {
                        busy = false;
                        header.showOffline();
                    });
                    return null;
                });
    }

    /** Lấy phòng, chỉ số và người tham gia cùng lúc. Người tham gia chỉ lấy khi đã chọn phòng. */
    private CompletableFuture<Snapshot> fetchSnapshot() {
        String roomId = selection.roomId();

        CompletableFuture<List<RoomInfo>> rooms = gateway.fetchRooms();
        CompletableFuture<ServerMetrics> metrics = gateway.fetchMetrics();
        CompletableFuture<List<ParticipantInfo>> people = roomId == null
                ? CompletableFuture.<List<ParticipantInfo>>completedFuture(List.of())
                : gateway.fetchParticipants(roomId);

        return CompletableFuture.allOf(rooms, metrics, people)
                .thenApply(ignored -> new Snapshot(roomId, rooms.join(), metrics.join(), people.join()));
    }

    /** Chạy trên EDT. */
    private void apply(Snapshot snapshot) {
        header.updateMetrics(snapshot.metrics());

        // Người dùng đã chọn phòng khác trong lúc chờ: bỏ dữ liệu cũ của phòng trước
        if (!Objects.equals(snapshot.roomId(), selection.roomId())) {
            return;
        }

        RoomInfo room = findRoom(snapshot.rooms(), snapshot.roomId());
        if (room == null) {
            clearRoom();
            return;
        }

        applyRoom(room);

        boolean roomChanged = !snapshot.roomId().equals(loadedRoomId);
        loadedRoomId = snapshot.roomId();
        participantsPanel.setParticipants(snapshot.people(), roomChanged);
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
    public void onCancel(String roomId) {
        CommandLogger.dispatch(logDocument, "> CANCEL " + roomId, gateway.cancel(roomId), this::refresh);
    }
}