package com.auction.net.core;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicReference;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Gọi REST của auction-core-service bằng tài khoản ADMIN.
 * Token giữ trong bộ nhớ. Nếu core trả 401/403 thì đăng nhập lại và thử thêm
 * một lần.
 */
public final class CoreHttpClient {
    private final String baseUrl;
    private final String user;
    private final String password;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private final ObjectMapper mapper = new ObjectMapper();
    private final AtomicReference<String> token = new AtomicReference<>();

    public CoreHttpClient(String baseUrl, String user, String password) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.user = user;
        this.password = password;
    }

    /** GET một đường dẫn và trả về JSON (mảng hoặc object). */
    public CompletableFuture<JsonNode> getJson(String path) {
        return send(path, true);
    }

    private CompletableFuture<JsonNode> send(String path, boolean retryOnAuthFailure) {
        return ensureToken().thenCompose(t -> {
            HttpRequest req = HttpRequest.newBuilder(URI.create(baseUrl + path))
                    .timeout(Duration.ofSeconds(5))
                    .header("Authorization", "Bearer " + t)
                    .GET()
                    .build();
            return http.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                    .thenCompose(res -> handle(res, path, retryOnAuthFailure));
        });
    }

    private CompletableFuture<JsonNode> handle(HttpResponse<String> res, String path, boolean retryOnAuthFailure) {
        int code = res.statusCode();

        if (code == 401 || code == 403) {
            token.set(null);
            if (retryOnAuthFailure) {
                return send(path, false);
            }
            return CompletableFuture.failedFuture(
                    new IOException("Core từ chối quyền ADMIN (Http " + code + ")"));
        }

        if (code != 200) {
            return CompletableFuture.failedFuture(
                    new IOException("Core trả về HTTP " + code));
        }

        try {
            return CompletableFuture.completedFuture(mapper.readTree(res.body()));
        } catch (IOException e) {
            return CompletableFuture.failedFuture(e);
        }
    }

    private CompletableFuture<String> ensureToken() {
        String current = token.get();

        if (current != null) {
            return CompletableFuture.completedFuture(current);
        }

        if (user == null || user.isBlank() || password == null || password.isBlank()) {
            return CompletableFuture.failedFuture(
                    new IllegalStateException("Chưa cấu hình CORE_ADMIN_USER / CORE_ADMIN_PASSWORD"));
        }

        ObjectNode body = mapper.createObjectNode().put("userName", user).put("password", password);
        HttpRequest req = HttpRequest.newBuilder(URI.create(baseUrl + "/api/auth/login"))
                .timeout(Duration.ofSeconds(5))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();

        return http.sendAsync(req, HttpResponse.BodyHandlers.ofString()).thenCompose(res -> {
            if (res.statusCode() != 200) {
                return CompletableFuture.<String>failedFuture(
                        new IOException("Đăng nhập core thất bại (HTTP " + res.statusCode() + ")"));
            }

            try {
                JsonNode root = mapper.readTree(res.body());
                JsonNode data = root.path("data");

                if (!data.isTextual() || data.asText().isBlank()) {
                    // Core trả HTTP 200 kèm body lỗi khi sai tài khoản/mật khẩu
                    String reason = root.path("message").asText("không rõ lý do");
                    return CompletableFuture.<String>failedFuture(
                            new IOException("Đăng nhập core thất bại: " + reason));
                }

                String newToken = data.asText();
                token.set(newToken);

                return CompletableFuture.completedFuture(newToken);
            } catch (IOException e) {
                return CompletableFuture.<String>failedFuture(e);
            }
        });
    }
}
