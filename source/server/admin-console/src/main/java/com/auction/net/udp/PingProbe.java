package com.auction.net.udp;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Đo RTT tới UDP server: gửi PING định kỳ, nhận PONG trên cùng socket, RTT =
 * now - ts.
 * Callback chạy trên luồng nền. Khi cập nhật giao diện, cần chuyển về EDT bằng
 * SwingUtilities.invokeLater.
 */
public final class PingProbe implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(PingProbe.class);

    /** Nhận kết quả đo */
    public interface Listener {
        /** Nhận kết quả RTT tính tại client sau khi đối chiếu PONG với PING. */
        void onRtt(int rttMs);

        /** Xử lý PING không nhận được PONG trong thời hạn. */
        void onTimeout(long seq);
    }

    /** PONG đến sau khoảng này coi như mất. */
    private static final long TIMEOUT_MS = 2000;
    private static final int MAX_PACKET = 1400;

    private final InetSocketAddress target;
    private final Listener listener;
    private final DatagramSocket socket;
    private final Map<Long, Long> pending = new ConcurrentHashMap<>(); // seq -> thời điểm gửi
    private final AtomicLong nextSeq = new AtomicLong();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "ping-probe-send");
        t.setDaemon(true);
        return t;
    });

    private volatile boolean running;

    /** Khởi tạo cấu hình, callback và tài nguyên cần thiết cho kênh UDP. */
    public PingProbe(InetSocketAddress target, Listener listener) throws SocketException {
        this.target = target;
        this.listener = listener;
        this.socket = new DatagramSocket();
    }

    /** Khởi động luồng nhận hoặc tác vụ định kỳ của thành phần. */
    public void start(long intervalMS) {
        running = true;

        Thread receiver = new Thread(this::receiveLoop, "ping-probe-recv");
        receiver.setDaemon(true);
        receiver.start();

        scheduler.scheduleAtFixedRate(this::tick, 0, intervalMS, TimeUnit.MILLISECONDS);
        log.info("Đo RTT tới {} mỗi {} ms", target, intervalMS);
    }

    /** Thực hiện một chu kỳ xử lý; không để lỗi làm dừng scheduler. */
    private void tick() {
        // Bắt mọi lỗi: nếu task ném exception, scheduleAtFixedRate sẽ dừng hẳn
        try {
            long seq = nextSeq.incrementAndGet();
            long now = System.currentTimeMillis();
            pending.put(seq, now);

            byte[] data = ("PING seq=" + seq + " ts=" + now).getBytes(StandardCharsets.UTF_8);
            expireOld(now);
            try {
                socket.send(new DatagramPacket(data, data.length, target));
            } catch (IOException e) {
                pending.remove(seq);
                throw e;
            }
        } catch (IOException e) {
            log.warn("Không gửi được PING: {}", e.getMessage());
        } catch (RuntimeException e) {
            log.error("Lỗi trong chu kỳ đo RTT", e);
        }
    }

    /** Loại bỏ PING đã hết hạn và thông báo timeout. */
    private void expireOld(long now) {
        Iterator<Map.Entry<Long, Long>> it = pending.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<Long, Long> entry = it.next();
            if (now - entry.getValue() > TIMEOUT_MS) {
                // Chỉ báo timeout nếu luồng nhận PONG chưa xóa seq này.
                if (pending.remove(entry.getKey(), entry.getValue())) {
                    listener.onTimeout(entry.getKey());
                }
            }
        }
    }

    /** Nhận UDP PONG trên socket gửi PING; đối chiếu địa chỉ nguồn. */
    private void receiveLoop() {
        byte[] buffer = new byte[MAX_PACKET];

        while (running) {
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
            try {
                socket.receive(packet);
            } catch (IOException e) {
                if (running) {
                    log.warn("Lỗi nhận PING: {}", e.getMessage());
                }
                continue;
            }

            String text = new String(packet.getData(), packet.getOffset(), packet.getLength(), StandardCharsets.UTF_8)
                    .trim();
            // Chỉ nhận PONG từ đúng địa chỉ và cổng server đã cấu hình.
            if (target.equals(packet.getSocketAddress())) {
                handle(text);
            }
        }
    }

    /** Phân loại hoặc xử lý thông điệp ứng dụng vừa nhận. */
    private void handle(String text) {
        if (!text.startsWith("PONG ")) {
            return;
        }
        long seq = field(text, "seq");
        if (seq < 0) {
            return;
        }

        // remove trả về null nếu PONG đến muộn (đã quá hạn) hoặc trùng lặp
        Long sentAt = pending.remove(seq);
        if (sentAt == null) {
            log.debug("Bỏ PONG seq={} vì không còn chờ", seq);
            return;
        }
        long rtt = System.currentTimeMillis() - sentAt;
        if (rtt > TIMEOUT_MS) {
            listener.onTimeout(seq);
            return;
        }
        listener.onRtt((int) Math.max(0, rtt));
    }

    /**
     * Lấy giá trị số của một trường "key=value" trong dòng text, trả về -1 nếu
     * không có.
     */
    private static long field(String line, String key) {
        for (String part : line.split("\\s+")) {
            if (part.startsWith(key + "=")) {
                try {
                    return Long.parseLong(part.substring(key.length() + 1));
                } catch (NumberFormatException e) {
                    return -1;
                }
            }
        }
        return -1;
    }

    /** Dừng tác vụ và giải phóng tài nguyên mạng thuộc thành phần. */
    @Override
    public void close() {
        running = false;
        scheduler.shutdownNow();
        socket.close();
    }
}