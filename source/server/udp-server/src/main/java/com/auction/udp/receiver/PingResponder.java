package com.auction.udp.receiver;

import java.io.IOException;
import java.net.InetSocketAddress;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.udp.protocol.Message;
import com.auction.udp.protocol.MessageFormatter;

/** Trả PONG cho mỗi PING, giữ nguyên seq và ts để phía admin tính RTT. */
public class PingResponder implements MessageHandler {
    private static final Logger log = LoggerFactory.getLogger(PingResponder.class);


    public void handle(Message message, InetSocketAddress from, UdpReceiver channel) {
        if (!(message instanceof Message.Ping ping)) {
            log.warn("Bỏ gói {} nhận trên cổng ping từ {}", message.getClass().getSimpleName(), from);
            return;
        }

        String pong = MessageFormatter.format(new Message.Pong(ping.seq(), ping.ts()));

        try {
            channel.send(pong, from);
        } catch (IOException e) {
            log.warn("Không gửi được PONG tới {}: {}", from, e.getMessage());
        }
    }
}