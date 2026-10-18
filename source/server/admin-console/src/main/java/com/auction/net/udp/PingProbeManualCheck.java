package com.auction.net.udp;

import java.net.InetSocketAddress;

/** Chạy main để xem RTT trong 15 giây. Cần UDP server đang chạy ở cổng 9002. */
public final class PingProbeManualCheck {
    public static void main(String[] args) throws Exception {
        InetSocketAddress target = new InetSocketAddress("127.0.0.1", 9002);

        PingProbe.Listener printer = new PingProbe.Listener() {
            @Override
            public void onRtt(int rttMs) {
                System.out.println("RTT = " + rttMs + " ms");
            }

            @Override
            public void onTimeout(long seq) {
                System.out.println("Timeout seq=" + seq);
            }
        };

        try (PingProbe probe = new PingProbe(target, printer)) {
            probe.start(1000);
            Thread.sleep(15_000);
        }
    }
}