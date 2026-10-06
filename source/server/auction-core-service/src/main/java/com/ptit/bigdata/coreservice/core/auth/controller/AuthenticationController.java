package com.ptit.bigdata.coreservice.core.auth.controller;

import com.ptit.bigdata.coreservice.core.auth.model.dto.CompleteRegistrationDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.GoogleLoginDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.LoginDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.RegisterDTO;
import com.ptit.bigdata.coreservice.core.auth.model.vo.GoogleAuthResponse;
import com.ptit.bigdata.coreservice.core.auth.service.AuthenticationService;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @Autowired
    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
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
