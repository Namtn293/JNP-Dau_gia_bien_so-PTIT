package com.auction.udp.sender;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.udp.protocol.Message;
import com.auction.udp.protocol.MessageFormatter;

/** Gửi ALERT tới admin và ghi log phía server. */
public final class AlertSender {
    private static final Logger log = LoggerFactory.getLogger(AlertSender.class);

    private final AdminSender admin;

    public AlertSender(AdminSender admin) {
        this.admin = admin;
    }

    public void send(Message.Alert alert) {
        log.info("ALERT {} metric={} value={} threshold={}",
                alert.level(), alert.metric(), alert.value(), alert.threshold());
        try {
            admin.send(MessageFormatter.format(alert));
        } catch (IOException e) {
            log.warn("Không gửi được ALERT tới admin: {}", e.getMessage());
        }
    }
}