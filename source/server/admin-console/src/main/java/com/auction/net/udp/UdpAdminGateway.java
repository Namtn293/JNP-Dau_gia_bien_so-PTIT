package com.auction.net.udp;

import java.net.InetSocketAddress;
import java.net.SocketException;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.AdminConfig;
import com.auction.gateway.AdminGateway;
import com.auction.gateway.mock.MockAdminGateway;
import com.auction.model.CommandResult;
import com.auction.model.ParticipantInfo;
import com.auction.model.RoomInfo;
import com.auction.model.ServerMetrics;

/**
 * Gateway dùng số liệu thật từ UDP: CPU, RAM, người trực tuyến từ METRICS; RTT
 * từ PingProbe.
 * Danh sách phòng và các lệnh điều khiển vẫn đi qua MockAdminGateway cho tới
 * khi có TCP 9090.
 */
public final class UdpAdminGateway implements AdminGateway, AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(UdpAdminGateway.class);

    /**
     * Nhận cảnh báo từ UDP server. Gọi trên luồng nhận, cần invokeLater khi cập
     * nhật giao diện.
     */
    public interface AlertListener {
        void onAlert(String level, String metric, double value, double threshold);
    }

    private record Snapshot(ServerMetrics metrics, long receivedAt) {
    }

    private final AdminGateway mock = new MockAdminGateway();

    private final List<AlertListener> alertListeners = new CopyOnWriteArrayList<>();

    private final UdpMetricsListener metricsListener;
    private final PingProbe pingProbe;

    private volatile Snapshot latest;
    private volatile int rttMs;
    private volatile long rttAt;

    public UdpAdminGateway() {
        try {
            metricsListener = new UdpMetricsListener(AdminConfig.UDP_PORT, new UdpMetricsListener.Listener() {
                @Override
                public void onMetrics(ServerMetrics metrics, long receivedAt) {
                    latest = new Snapshot(metrics, receivedAt);
                }

                @Override
                public void onAlert(String level, String metric, double value, double threshold) {
                    log.warn("ALERT {} metric={} value={} threshold={}", level, metric, value, threshold);
                    for (AlertListener l : alertListeners) {
                        l.onAlert(level, metric, value, threshold);
                    }
                }
            });

            pingProbe = new PingProbe(
                    new InetSocketAddress(AdminConfig.UDP_SERVER_HOST, AdminConfig.UDP_PING_PORT),
                    new PingProbe.Listener() {
                        @Override
                        public void onRtt(int ms) {
                            rttMs = ms;
                            rttAt = System.currentTimeMillis();
                        }

                        @Override
                        public void onTimeout(long seq) {
                            log.debug("PING seq={} không có PONG", seq);
                        }
                    });
        } catch (SocketException e) {
            throw new IllegalStateException("Không mở được socket UDP (cổng "
                    + AdminConfig.UDP_PORT + " có thể đang được dùng): " + e.getMessage(), e);
        }

        metricsListener.start();
        pingProbe.start(AdminConfig.PING_INTERVAL_MS);
    }

    public void addAlertListener(AlertListener listener) {
        alertListeners.add(listener);
    }

    /**
     * Gộp METRICS mới nhất với RTT mới nhất. Nếu một trong hai đã quá hạn thì báo
     * lỗi,
     * giao diện sẽ hiển thị "—" như khi mất kết nối.
     */
    @Override
    public CompletableFuture<ServerMetrics> fetchMetrics() {
        return CompletableFuture.supplyAsync(() -> {
            long now = System.currentTimeMillis();
            Snapshot s = latest;

            if (s == null || now - s.receivedAt() > AdminConfig.DATA_STALE_MS) {
                throw new IllegalStateException("Không nhận được METRICS từ core");
            }
            if (now - rttAt > AdminConfig.DATA_STALE_MS) {
                throw new IllegalStateException("Không nhận được PONG từ UDP server");
            }

            ServerMetrics m = s.metrics();
            return new ServerMetrics(
                    m.cpuPercent(),
                    m.cpuCores(),
                    m.ramUsedGb(),
                    m.ramTotalGb(),
                    rttMs,
                    m.onlineUsers(),
                    m.bidsPerSecond());
        });
    }

    // ===== Phần còn lại đi qua mock =====

    @Override
    public CompletableFuture<List<RoomInfo>> fetchRooms() {
        return mock.fetchRooms();
    }

    @Override
    public CompletableFuture<List<ParticipantInfo>> fetchParticipants(String roomId) {
        return mock.fetchParticipants(roomId);
    }

    @Override
    public CompletableFuture<CommandResult> halt(String roomId) {
        return mock.halt(roomId);
    }

    @Override
    public CompletableFuture<CommandResult> resume(String roomId) {
        return mock.resume(roomId);
    }

    @Override
    public CompletableFuture<CommandResult> kick(String userId, String roomId) {
        return mock.kick(userId, roomId);
    }

    @Override
    public CompletableFuture<CommandResult> cancel(String roomId) {
        return mock.cancel(roomId);
    }

    @Override
    public void close() {
        metricsListener.close();
        pingProbe.close();
    }
}