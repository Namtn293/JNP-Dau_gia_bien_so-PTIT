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

    public AdminSender(InetSocketAddress target) throws IOException {
        this.socket = new DatagramSocket();
        this.target = target;
    }

    public void send(String text) throws IOException {
        byte[] data = text.getBytes(StandardCharsets.UTF_8);
        socket.send(new DatagramPacket(data, data.length, target));
    }

    @Override
    public void close() {
        socket.close();
    }
}