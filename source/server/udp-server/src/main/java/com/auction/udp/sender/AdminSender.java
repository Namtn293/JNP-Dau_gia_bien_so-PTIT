package com.auction.udp.sender;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/** Gửi gói UDP text tới Admin Console. */
public final class AdminSender implements AutoCloseable {
    private final DatagramSocket socket;
    private final InetSocketAddress target;

    /** Khởi tạo cấu hình, callback và tài nguyên cần thiết cho kênh UDP. */
    public AdminSender(InetSocketAddress target) throws IOException {
        this.socket = new DatagramSocket();
        this.target = target;
    }

    /**
     * Mã hóa UTF-8 và gửi một UDP datagram tới địa chỉ admin cấu hình; UDP không
     * bảo đảm giao hàng.
     */
    public void send(String text) throws IOException {
        byte[] data = text.getBytes(StandardCharsets.UTF_8);
        socket.send(new DatagramPacket(data, data.length, target));
    }

    /** Dừng tác vụ và giải phóng tài nguyên mạng thuộc thành phần. */
    @Override
    public void close() {
        socket.close();
    }
}