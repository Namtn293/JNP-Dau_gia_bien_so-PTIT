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
        void onRtt(int rttMs);

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

    public PingProbe(InetSocketAddress target, Listener listener) throws SocketException {
        this.target = target;
        this.listener = listener;
        this.socket = new DatagramSocket();
    }

    public void start(long intervalMS) {
        running = true;

        Thread receiver = new Thread(this::receiveLoop, "ping-probe-recv");
        receiver.setDaemon(true);
        receiver.start();

        scheduler.scheduleAtFixedRate(this::tick, 0, intervalMS, TimeUnit.MILLISECONDS);
        log.info("Đo RTT tới {} mỗi {} ms", target, intervalMS);
    }

    private void tick() {
        // Bắt mọi lỗi: nếu task ném exception, scheduleAtFixedRate sẽ dừng hẳn
        try {
            long seq = nextSeq.incrementAndGet();
            long now = System.currentTimeMillis();
            pending.put(seq, now);

            byte[] data = ("PING seq=" + seq + " ts=" + now).getBytes(StandardCharsets.UTF_8);
            socket.send(new DatagramPacket(data, data.length, target));

            expireOld(now);
        } catch (IOException e) {
            log.warn("Không gửi được PING: {}", e.getMessage());
        } catch (RuntimeException e) {
            log.error("Lỗi trong chu kỳ đo RTT", e);
        }
    }

    private void expireOld(long now) {
        Iterator<Map.Entry<Long, Long>> it = pending.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<Long, Long> entry = it.next();
            if (now - entry.getValue() > TIMEOUT_MS) {
                it.remove();
                listener.onTimeout(entry.getKey());
            }
        }
    }

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
            handle(text);
        }
    }

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

    @Override
    public void close() {
        running = false;
        scheduler.shutdownNow();
        socket.close();
    }
}