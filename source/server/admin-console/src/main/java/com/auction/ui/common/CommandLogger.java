package com.auction.ui.common;

import java.util.concurrent.CompletableFuture;

import javax.swing.SwingUtilities;
import javax.swing.text.StyledDocument;

import com.auction.model.CommandResult;

/** Ghi lệnh và kết quả vào nhật ký. Dùng chung cho mọi nút điều khiển. */
public final class CommandLogger {
    private CommandLogger() { }

    /**
     * @param onDone chạy trên EDT sau khi có kết quả (ví dụ làm mới dữ liệu), có thể null
     */
    public static void dispatch(StyledDocument log, String commandLine,
                                CompletableFuture<CommandResult> future, Runnable onDone) {
        LogPanel.appendTo(log, LogPanel.Level.COMMAND, commandLine);

        future.thenAccept(result -> SwingUtilities.invokeLater(() -> {
            LogPanel.appendTo(log,
                    result.success() ? LogPanel.Level.SUCCESS : LogPanel.Level.ERROR,
                    result.message());
            if (onDone != null) {
                onDone.run();
            }
        })).exceptionally(ex -> {
            SwingUtilities.invokeLater(() ->
                    LogPanel.appendTo(log, LogPanel.Level.ERROR,
                            "Không gửi được lệnh: " + ex.getMessage()));
            return null;
        });
    }
}