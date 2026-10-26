package com.auction.mail;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Gửi email bất đồng bộ trên một luồng nền riêng, không chặn giao diện. */
public final class MailService {
    private final SmtpMailClient client;

    private final ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "mail-sender");
        t.setDaemon(true);
        return t;
    });

    public MailService(MailConfig config) {
        this.client = new SmtpMailClient(config);
    }

    /** Future hoàn tất khi gửi xong, hoặc hoàn tất exceptionally kèm lỗi (CompletionException bọc IOException). */
    public CompletableFuture<Void> send(MailMessage message) {
        return CompletableFuture.runAsync(() -> {
            try {
                client.send(message);
            } catch (IOException e) {
                throw new CompletionException(e);
            }
        }, executor);
    }
}