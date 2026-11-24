package com.auction.net.udp;

import java.net.InetSocketAddress;
import java.net.SocketException;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.auction.AdminConfig;
import com.auction.model.ServerMetrics;

/** Thu nhận METRICS/ALERT và đo RTT qua UDP, độc lập với HTTP và TCP. */
public final class UdpMonitoringClient implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(UdpMonitoringClient.class);

    @FunctionalInterface
    public interface AlertListener {
        /** Callback luồng nền; bên giao diện phải chuyển về EDT. */
        void onAlert(String level, String metric, double value, double threshold);
    }

    private record Snapshot(ServerMetrics metrics, long receivedAt) {
    }

    private final List<AlertListener> alertListeners = new CopyOnWriteArrayList<>();
    private final RttMonitor rttMonitor = new RttMonitor(AdminConfig.RTT_WARN_MS, AdminConfig.RTT_CRIT_MS,
            this::publish);
    private final UdpMetricsListener metricsListener;
    private final PingProbe pingProbe;
    private volatile Snapshot latest;
    private volatile int rttMs;
    private volatile long rttAt;

    /** Khởi tạo thành phần và lưu các phụ thuộc cần thiết. */
    public UdpMonitoringClient() {
        UdpMetricsListener opened = null;
        try {
            opened = new UdpMetricsListener(AdminConfig.UDP_PORT, new UdpMetricsListener.Listener() {
                /** Nhận snapshot METRICS cùng thời điểm nhận trên luồng UDP. */
                @Override
                public void onMetrics(ServerMetrics metrics, long receivedAt) {
                    latest = new Snapshot(metrics, receivedAt);
                }

                /** Nhận cảnh báo trên luồng nền và chuyển tiếp đến các listener. */
                @Override
                public void onAlert(String level, String metric, double value, double threshold) {
                    log.warn("ALERT {} metric={} value={} threshold={}", level, metric, value, threshold);
                    publish(level, metric, value, threshold);
                }
            });

            metricsListener = opened;
            pingProbe = new PingProbe(
                    new InetSocketAddress(AdminConfig.UDP_SERVER_HOST, AdminConfig.UDP_PING_PORT),
                    new PingProbe.Listener() {
                        /** Nhận kết quả RTT tính tại client sau khi đối chiếu PONG với PING. */
                        @Override
                        public void onRtt(int ms) {
                            rttMs = ms;
                            rttAt = System.currentTimeMillis();
                            rttMonitor.update(ms);
                        }

                        /** Xử lý PING không nhận được PONG trong thời hạn. */
                        @Override
                        public void onTimeout(long seq) {
                            log.debug("PING seq={} không có PONG", seq);
                        }
                    });
        } catch (SocketException e) {
            if (opened != null)
                opened.close();
            throw new IllegalStateException("Không mở được socket UDP (cổng "
                    + AdminConfig.UDP_PORT + " có thể đang được dùng): " + e.getMessage(), e);
        }

        metricsListener.start();
        pingProbe.start(AdminConfig.PING_INTERVAL_MS);
    }

    /** Đăng ký callback nhận cảnh báo UDP hoặc cảnh báo RTT nội bộ. */
    public void addAlertListener(AlertListener listener) {
        alertListeners.add(listener);
    }

    /** Phát cảnh báo tới các listener đã đăng ký. */
    private void publish(String level, String metric, double value, double threshold) {
        for (AlertListener l : alertListeners) {
            l.onAlert(level, metric, value, threshold);
        }
    }

    /** Ghép snapshot METRICS với RTT; báo lỗi nếu thiếu hoặc quá hạn dữ liệu. */
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

    /** Dừng tác vụ và giải phóng tài nguyên mạng thuộc thành phần. */
    public void close() {
        metricsListener.close();
        pingProbe.close();
    }
}
