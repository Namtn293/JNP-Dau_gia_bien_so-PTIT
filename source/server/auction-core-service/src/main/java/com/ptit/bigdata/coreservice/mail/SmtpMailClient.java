package com.ptit.bigdata.coreservice.mail;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

/**
 * SMTP client tự viết trên TCP socket thuần.
 * Luồng: EHLO -> STARTTLS -> nâng lên TLS -> EHLO -> AUTH -> MAIL FROM -> RCPT TO -> DATA -> QUIT.
 * Hỗ trợ AUTH PLAIN và AUTH LOGIN, tương thích Mailtrap (587) và Gmail (587, App Password).
 */
public final class SmtpMailClient {
    private static final int TIMEOUT_MS = 10_000;
    private static final String EHLO_NAME = "auction-core.local";

    private final MailConfig config;

    public SmtpMailClient(MailConfig config) {
        this.config = config;
    }

    /** Gửi một email. Ném IOException nếu lỗi mạng hoặc server từ chối. */
    public void send(MailMessage message) throws IOException {
        try (Socket plain = new Socket()) {
            plain.connect(new InetSocketAddress(config.getHost(), config.getPort()), TIMEOUT_MS);
            plain.setSoTimeout(TIMEOUT_MS);

            Conn conn = new Conn(plain);
            conn.expect(220);
            conn.exchange("EHLO " + EHLO_NAME, 250);
            conn.exchange("STARTTLS", 220);

            // Nâng kết nối lên TLS, sau đó chào lại server (RFC 3207)
            SSLSocketFactory sslFactory = (SSLSocketFactory) SSLSocketFactory.getDefault();
            try (SSLSocket tls = (SSLSocket) sslFactory.createSocket(plain, config.getHost(), config.getPort(), true)) {
                tls.startHandshake();
                tls.setSoTimeout(TIMEOUT_MS);

                conn = new Conn(tls);
                Reply ehlo = conn.exchange("EHLO " + EHLO_NAME, 250);
                authenticate(conn, ehlo);

                conn.exchange("MAIL FROM:<" + config.getFrom() + ">", 250);
                conn.exchange("RCPT TO:<" + message.to() + ">", 250, 251);
                conn.exchange("DATA", 354);
                conn.sendData(buildMessage(message));
                conn.expect(250);
                conn.exchange("QUIT", 221);
            }
        }
    }

    private void authenticate(Conn conn, Reply ehlo) throws IOException {
        Set<String> mechanisms = new HashSet<>();
        for (String line : ehlo.lines()) {
            String body = line.length() > 4 ? line.substring(4) : "";
            if (body.startsWith("AUTH ")) {
                mechanisms.addAll(Arrays.asList(body.substring(5).trim().split("\\s+")));
            }
        }

        if (mechanisms.contains("PLAIN")) {
            String token = "\0" + config.getUsername() + "\0" + config.getPassword();
            conn.exchange("AUTH PLAIN " + base64(token), 235);
        } else if (mechanisms.contains("LOGIN")) {
            conn.exchange("AUTH LOGIN", 334);
            conn.exchange(base64(config.getUsername()), 334);
            conn.exchange(base64(config.getPassword()), 235);
        } else {
            throw new IOException("Server không hỗ trợ AUTH PLAIN hoặc AUTH LOGIN");
        }
    }

    private String buildMessage(MailMessage m) {
        StringBuilder sb = new StringBuilder();
        sb.append("From: ").append(encodeHeader(config.getFromName()))
                .append(" <").append(config.getFrom()).append(">\r\n");
        sb.append("To: ").append(m.to()).append("\r\n");
        sb.append("Subject: ").append(encodeHeader(m.subject())).append("\r\n");
        sb.append("Date: ").append(DateTimeFormatter.RFC_1123_DATE_TIME.format(ZonedDateTime.now())).append("\r\n");
        sb.append("Message-ID: <").append(UUID.randomUUID()).append("@").append(EHLO_NAME).append(">\r\n");
        sb.append("MIME-Version: 1.0\r\n");
        sb.append("Content-Type: text/plain; charset=UTF-8\r\n");
        sb.append("Content-Transfer-Encoding: base64\r\n");
        sb.append("\r\n");
        sb.append(Base64.getMimeEncoder().encodeToString(m.body().getBytes(StandardCharsets.UTF_8)));
        sb.append("\r\n");
        return sb.toString();
    }

    static String encodeHeader(String text) {
        final int maxBytes = 45;
        List<String> words = new ArrayList<>();
        ByteArrayOutputStream chunk = new ByteArrayOutputStream();

        for (int cp : text.codePoints().toArray()) {
            byte[] bytes = new String(Character.toChars(cp)).getBytes(StandardCharsets.UTF_8);
            if (chunk.size() + bytes.length > maxBytes) {
                words.add(encodedWord(chunk.toByteArray()));
                chunk.reset();
            }
            chunk.write(bytes, 0, bytes.length);
        }
        if (chunk.size() > 0) {
            words.add(encodedWord(chunk.toByteArray()));
        }
        return String.join("\r\n ", words);
    }

    private static String encodedWord(byte[] bytes) {
        return "=?UTF-8?B?" + Base64.getEncoder().encodeToString(bytes) + "?=";
    }

    private static String base64(String text) {
        return Base64.getEncoder().encodeToString(text.getBytes(StandardCharsets.UTF_8));
    }

    private record Reply(int code, List<String> lines) {
        String text() {
            return String.join(" | ", lines);
        }
    }

    private static final class Conn {
        private final BufferedReader in;
        private final BufferedWriter out;

        Conn(Socket socket) throws IOException {
            in = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            out = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8));
        }

        Reply exchange(String command, int... allowed) throws IOException {
            out.write(command);
            out.write("\r\n");
            out.flush();
            return expect(allowed);
        }

        Reply expect(int... allowed) throws IOException {
            Reply reply = readReply();
            for (int code : allowed) {
                if (reply.code() == code) {
                    return reply;
                }
            }
            throw new IOException("Lỗi SMTP: " + reply.text());
        }

        void sendData(String data) throws IOException {
            out.write(data);
            out.write(".\r\n");
            out.flush();
        }

        private Reply readReply() throws IOException {
            List<String> lines = new ArrayList<>();
            while (true) {
                String line = in.readLine();
                if (line == null) {
                    throw new IOException("Server đã đóng kết nối");
                }
                if (line.length() < 3) {
                    throw new IOException("Phản hồi SMTP không hợp lệ: " + line);
                }
                lines.add(line);
                if (line.length() == 3 || line.charAt(3) == ' ') {
                    return new Reply(parseCode(line), lines);
                }
            }
        }

        private static int parseCode(String line) throws IOException {
            try {
                return Integer.parseInt(line.substring(0, 3));
            } catch (NumberFormatException e) {
                throw new IOException("Phản hồi SMTP không hợp lệ: " + line, e);
            }
        }
    }
}
