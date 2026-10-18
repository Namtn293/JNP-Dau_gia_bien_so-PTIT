package com.auction.udp.receiver;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.udp.protocol.Message;
import com.auction.udp.protocol.MessageParser;
import com.auction.udp.protocol.ProtocolException;

/**
 * Lắng nghe UDP trên một cổng, mỗi gói là một dòng text.
 * Gói sai định dạng được ghi log và bỏ qua, không làm dừng luồng nhận.
 */
public final class UdpReceiver implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(UdpReceiver.class);

    /** Kích thước tối đa một gói, giữ dưới MTU để tránh bị phân mảnh. */
    private static final int MAX_PACKET = 1400;

    private final int port;
    private final MessageHandler handler;

    private DatagramSocket socket;
    private Thread thread;
    private volatile boolean running;

    public UdpReceiver(int port, MessageHandler handler) {
        this.port = port;
        this.handler = handler;
    }

    public void start() throws SocketException {
        socket = new DatagramSocket(port);
        running = true;
        thread = new Thread(this::loop, "udp-receiver-" + port);
        thread.setDaemon(true);
        thread.start();
        log.info("Đang nghe UDP cổng {}", port);
    }

    private void loop() {
        byte[] buffer = new byte[MAX_PACKET];
        while (running) {
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
            try {
                socket.receive(packet);
            } catch (IOException e) {
                if (running) {
                    log.warn("Lỗi nhận gói trên cổng {}: {}", port, e.getMessage());
                }
                continue;
            }

            InetSocketAddress from = new InetSocketAddress(packet.getAddress(), packet.getPort());
            String text = new String(packet.getData(), packet.getOffset(), packet.getLength(),
                    StandardCharsets.UTF_8).trim();

            try {
                Message message = MessageParser.parse(text);
                handler.handle(message, from);
            } catch (ProtocolException e) {
                log.warn("Bỏ gói lỗi từ {} (cổng {}): {}", from, port, e.getMessage());
            } catch (RuntimeException e) {
                log.error("Lỗi khi xử lý gói từ {}", from, e);
            }
        }
    }

    @Override
    public void close() {
        running = false;
        if (socket != null) {
            socket.close();
        }
    }
}