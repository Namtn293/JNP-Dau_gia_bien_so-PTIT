package com.auction.udp.receiver;

import java.net.InetSocketAddress;

import com.auction.udp.protocol.Message;

/** Xử lý một gói đã parse thành công. "from" là địa chỉ nguồn, dùng để trả lời (ví dụ PONG). */
@FunctionalInterface
public interface MessageHandler {
    void handle(Message message, InetSocketAddress from);
}