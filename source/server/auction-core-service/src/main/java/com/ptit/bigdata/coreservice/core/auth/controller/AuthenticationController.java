package com.ptit.bigdata.coreservice.core.auth.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.bigdata.coreservice.core.auth.model.dto.CompleteRegistrationDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.GoogleLoginDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.LoginDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.RegisterDTO;
import com.ptit.bigdata.coreservice.core.auth.model.vo.GoogleAuthResponse;
import com.ptit.bigdata.coreservice.core.auth.service.AuthenticationService;
import com.ptit.bigdata.coreservice.core.auth.service.GoogleAuthService;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final GoogleAuthService googleAuthService;

    @Value("${spring.google.frontend-callback:http://localhost:5173/auth/google/callback}")
    private String defaultFrontendCallback;

    @Autowired
    public AuthenticationController(AuthenticationService authenticationService, GoogleAuthService googleAuthService) {
        this.authenticationService = authenticationService;
        this.googleAuthService = googleAuthService;
    }

    @GetMapping("/google/redirect")
    public void googleRedirect(
            @RequestParam(required = false) String state,
            HttpServletResponse response
    ) throws IOException {
        String authUrl = googleAuthService.buildAuthorizationUrl(state != null ? state : "");
        response.sendRedirect(authUrl);
    }

    @GetMapping("/google/callback")
    public void googleCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpServletResponse response
    ) throws IOException {
        // Giải mã state để lấy frontendCallback URL
        String frontendCallback = defaultFrontendCallback;
        if (state != null && !state.isBlank()) {
            try {
                String decodedState = new String(Base64.getDecoder().decode(state), StandardCharsets.UTF_8);
                ObjectMapper mapper = new ObjectMapper();
                JsonNode jsonNode = mapper.readTree(decodedState);
                if (jsonNode.has("frontendCallback")) {
                    String candidate = jsonNode.get("frontendCallback").asText();
                    if (candidate != null && (candidate.startsWith("http://localhost:") || candidate.startsWith("http://127.0.0.1:"))) {
                        frontendCallback = candidate;
                    }
                }
            } catch (Exception ignored) {
                // state không phải Base64/JSON → dùng default
            }
        }

        // Nếu Google trả lỗi
        if (error != null) {
            response.sendRedirect(frontendCallback
                    + "?error=" + URLEncoder.encode(error, StandardCharsets.UTF_8));
            return;
        }

        if (code == null || code.isBlank()) {
            response.sendRedirect(frontendCallback + "?error=missing_code");
            return;
        }

        try {
            // Đổi code → id_token
            String idToken = googleAuthService.exchangeCodeForIdToken(code);

            // Tận dụng hàm xác thực Google đã có sẵn trong AuthenticationService
            GoogleLoginDTO loginDTO = new GoogleLoginDTO();
            loginDTO.setIdToken(idToken);
            GoogleAuthResponse authResponse = authenticationService.authenticateGoogle(loginDTO);

            String redirectTarget;
            if (authResponse.isNewUser()) {
                // Người dùng mới → FE hiển thị form hoàn thiện hồ sơ
                redirectTarget = String.format(
                        "%s?isNewUser=true&email=%s&fullName=%s&tempToken=%s",
                        frontendCallback,
                        URLEncoder.encode(authResponse.getEmail(), StandardCharsets.UTF_8),
                        URLEncoder.encode(authResponse.getFullName() != null ? authResponse.getFullName() : "", StandardCharsets.UTF_8),
                        URLEncoder.encode(authResponse.getTempToken(), StandardCharsets.UTF_8));
            } else {
                // Người dùng cũ → FE lưu token và chuyển hướng
                redirectTarget = String.format(
                        "%s?isNewUser=false&token=%s&email=%s&fullName=%s",
                        frontendCallback,
                        URLEncoder.encode(authResponse.getToken(), StandardCharsets.UTF_8),
                        URLEncoder.encode(authResponse.getEmail(), StandardCharsets.UTF_8),
                        URLEncoder.encode(authResponse.getFullName() != null ? authResponse.getFullName() : "", StandardCharsets.UTF_8));
            }
            response.sendRedirect(redirectTarget);

        } catch (Exception ex) {
            response.sendRedirect(frontendCallback
                    + "?error=" + URLEncoder.encode(ex.getMessage() != null ? ex.getMessage() : "Authentication error", StandardCharsets.UTF_8));
        }
    }

    @PostMapping("/register")
    public SuccessResponse<Void> register(@Valid @RequestBody RegisterDTO dto) {
        authenticationService.register(dto);
        return ResponseUtil.ok();
    }

    @PostMapping("/login")
    public SuccessResponse<String> login(@Valid @RequestBody LoginDTO dto) {
        return ResponseUtil.ok(authenticationService.login(dto));
    }

    @PostMapping("/google")
    public SuccessResponse<GoogleAuthResponse> googleLogin(@Valid @RequestBody GoogleLoginDTO dto) {
        GoogleAuthResponse response = authenticationService.authenticateGoogle(dto);
        return ResponseUtil.ok(response);
    }

    @PostMapping("/google/complete-registration")
    public SuccessResponse<String> completeGoogleRegistration(@Valid @RequestBody CompleteRegistrationDTO dto) {
        String token = authenticationService.completeGoogleRegistration(dto);
        return ResponseUtil.ok(token);
    }

    @PostMapping("/logout")
    public SuccessResponse<Void> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.contains("Bearer")) {
            throw new BusinessException(ErrorCode.TOKEN_NOT_CORRECT);
        }
        authHeader = authHeader.substring(7);
        authenticationService.logout(authHeader);
        return ResponseUtil.ok();
    }

    @PostMapping("/set-admin/{userName}")
    public SuccessResponse<Void> setAdminRole(@PathVariable String userName) {
        authenticationService.setAdminRole(userName);
        return ResponseUtil.ok();
    }
}
