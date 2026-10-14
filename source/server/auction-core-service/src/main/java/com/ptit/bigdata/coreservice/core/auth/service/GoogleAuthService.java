package com.ptit.bigdata.coreservice.core.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Service
public class GoogleAuthService {

    @Value("${spring.google.client-id:}")
    private String clientId;

    @Value("${spring.google.client-secret:}")
    private String clientSecret;

    @Value("${spring.google.redirect-uri:http://localhost:8080/api/auth/google/callback}")
    private String redirectUri;

    private final RestTemplate restTemplate;

    @Autowired
    public GoogleAuthService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Sinh URL chuyển hướng sang cổng xác thực Google chính thức.
     * state: chuỗi Base64 JSON chứa { "frontendCallback": "...", "redirectTo": "..." }
     * để bảo vệ CSRF và giữ context sau khi đăng nhập.
     */
    public String buildAuthorizationUrl(String state) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid profile email")
                .queryParam("access_type", "offline");

        if (state != null && !state.isBlank()) {
            builder.queryParam("state", state);
        }

        return builder.build().encode().toUriString();
    }

    /**
     * Gửi Authorization Code lên Google để đổi lấy ID Token (Server-to-Server).
     * Client Secret không bao giờ tiếp xúc với Frontend.
     */
    @SuppressWarnings("unchecked")
    public String exchangeCodeForIdToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://oauth2.googleapis.com/token", request, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            String idToken = (String) response.getBody().get("id_token");
            if (idToken != null) return idToken;
        }
        throw new RuntimeException("Không thể đổi Authorization Code lấy Google ID Token");
    }
}
