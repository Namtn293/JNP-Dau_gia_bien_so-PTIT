package com.auction.udp.receiver;

import java.net.InetSocketAddress;

import com.auction.udp.protocol.Message;

/**
 * Xử lý một gói đã parse thành công.
 * @param from    địa chỉ nguồn của gói
 * @param channel kênh nhận gói, dùng channel.send(...) để trả lời về "from"
 */
@FunctionalInterface
public interface MessageHandler {
    void handle(Message message, InetSocketAddress from, UdpReceiver channel);
}