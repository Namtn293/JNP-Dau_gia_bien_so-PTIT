package com.ptit.bigdata.coreservice.core.auth.service;

import com.ptit.bigdata.coreservice.core.auth.entity.Token;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.model.dto.CompleteRegistrationDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.GoogleLoginDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.LoginDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.RegisterDTO;
import com.ptit.bigdata.coreservice.core.auth.model.vo.GoogleAuthResponse;
import com.ptit.bigdata.coreservice.core.auth.repository.TokenRepository;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.AuthProvider;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.RoleEnum;
import com.ptit.bigdata.coreservice.enumration.StatusEnum;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserInfoRepository userInfoRepository;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public AuthenticationService(TokenRepository tokenRepository,
                                 JwtService jwtService,
                                 UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 UserInfoRepository userInfoRepository,
                                 RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userInfoRepository = userInfoRepository;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional
    public void register(RegisterDTO registerDTO) throws BusinessException {
        if (userRepository.existsByUserName(registerDTO.getUserName())) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXIST);
        }
        User user = new User();
        user.setUserName(registerDTO.getUserName());
        user.setRoleEnum(RoleEnum.USER);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        userRepository.save(user);

        if (userInfoRepository.existsByEmail(registerDTO.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_EXISTS);
        }

        UserInfo userInfo = new UserInfo();
        userInfo.setUserName(registerDTO.getUserName());
        userInfo.setEmail(registerDTO.getEmail());
        userInfo.setFullName(registerDTO.getFullName());
        userInfo.setStatus(StatusEnum.ACTIVE);

        userInfoRepository.save(userInfo);
    }

    public String login(LoginDTO dto) throws BusinessException {
        User user = userRepository.findByUserName(dto.getUserName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_ALREADY_EXIST));
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_NOT_CORRECT);
        }

        UserInfo userInfo = userInfoRepository.findByUserName(dto.getUserName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_ALREADY_EXIST));
        if (userInfo.getStatus().equals(StatusEnum.BANNED)) {
            throw new BusinessException(ErrorCode.ACCOUNT_BANNED);
        }
        String token = jwtService.buildAccessToken(user);
        revokedToken(user.getId());

        Token token1 = Token.builder()
                .token(token)
                .userId(user.getId())
                .revoked(false)
                .expired(false)
                .build();
        tokenRepository.save(token1);
        return token;
    }

    @Transactional
    public GoogleAuthResponse authenticateGoogle(GoogleLoginDTO dto) throws BusinessException {
        String email;
        String name;

        // Hỗ trợ Mock token để test trên Postman (VD: mock:testuser@gmail.com:Nguyen Van A)
        if (dto.getIdToken().startsWith("mock:")) {
            String[] parts = dto.getIdToken().split(":");
            email = parts.length > 1 ? parts[1] : "testuser@gmail.com";
            name = parts.length > 2 ? parts[2] : "Google User";
        } else {
            // Xác thực Google ID Token thực tế qua Google TokenInfo endpoint
            try {
                String googleVerifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + dto.getIdToken();
                @SuppressWarnings("unchecked")
                Map<String, Object> payload = restTemplate.getForObject(googleVerifyUrl, Map.class);
                if (payload == null || !payload.containsKey("email")) {
                    throw new BusinessException(ErrorCode.GOOGLE_AUTH_FAILED);
                }
                email = (String) payload.get("email");
                name = (String) payload.get("name");
            } catch (Exception e) {
                throw new BusinessException(ErrorCode.GOOGLE_AUTH_FAILED);
            }
        }

        Optional<UserInfo> existingUserInfo = userInfoRepository.findByEmail(email);

        // Trường hợp 1: Đã từng đăng ký -> Đăng nhập trực tiếp và cấp JWT Token
        if (existingUserInfo.isPresent()) {
            UserInfo userInfo = existingUserInfo.get();
            if (userInfo.getStatus() == StatusEnum.BANNED) {
                throw new BusinessException(ErrorCode.ACCOUNT_BANNED);
            }

            User user = userRepository.findByUserName(userInfo.getUserName())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            String token = jwtService.buildAccessToken(user);
            revokedToken(user.getId());

            Token tokenEntity = Token.builder()
                    .token(token)
                    .userId(user.getId())
                    .revoked(false)
                    .expired(false)
                    .build();
            tokenRepository.save(tokenEntity);

            return GoogleAuthResponse.builder()
                    .isNewUser(false)
                    .email(email)
                    .fullName(userInfo.getFullName())
                    .token(token)
                    .tempToken(null)
                    .build();
        }

        // Trường hợp 2: Lần đầu đăng nhập bằng Google -> Trả tempToken để yêu cầu hoàn tất thông tin
        String tempToken = jwtService.buildTempToken(email, name);
        return GoogleAuthResponse.builder()
                .isNewUser(true)
                .email(email)
                .fullName(name)
                .token(null)
                .tempToken(tempToken)
                .build();
    }

    @Transactional
    public String completeGoogleRegistration(CompleteRegistrationDTO dto) throws BusinessException {
        Claims claims;
        try {
            claims = jwtService.extractAllClaims(dto.getTempToken());
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.INVALID_TEMP_TOKEN);
        }

        if (jwtService.isExpired(dto.getTempToken()) || !"TEMP_ONBOARDING".equals(claims.get("type"))) {
            throw new BusinessException(ErrorCode.INVALID_TEMP_TOKEN);
        }

        String email = (String) claims.get("email");
        String googleName = (String) claims.get("fullName");

        if (userRepository.existsByUserName(dto.getUserName())) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXIST);
        }

        if (userInfoRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.EMAIL_EXISTS);
        }

        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isBlank()
                && userInfoRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
            throw new BusinessException(ErrorCode.PHONE_NUMBER_EXISTS);
        }

        // 1. Tạo tài khoản đăng nhập (AUTH_USER)
        User user = new User();
        user.setUserName(dto.getUserName());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRoleEnum(RoleEnum.USER);
        user.setAuthProvider(AuthProvider.GOOGLE);
        userRepository.save(user);

        // 2. Tạo thông tin người dùng (MAIN_USER_INFO) với các trường định danh đấu giá
        UserInfo userInfo = new UserInfo();
        userInfo.setUserName(dto.getUserName());
        userInfo.setEmail(email);
        userInfo.setFullName(dto.getFullName() != null && !dto.getFullName().isBlank() ? dto.getFullName() : googleName);
        userInfo.setPhoneNumber(dto.getPhoneNumber());
        userInfo.setDob(dto.getDob());
        userInfo.setAddress(dto.getAddress());
        userInfo.setStatus(StatusEnum.ACTIVE);
        userInfoRepository.save(userInfo);

        // 3. Cấp phát JWT Access Token chính thức
        String token = jwtService.buildAccessToken(user);
        Token tokenEntity = Token.builder()
                .token(token)
                .userId(user.getId())
                .revoked(false)
                .expired(false)
                .build();
        tokenRepository.save(tokenEntity);

        return token;
    }

    public void revokedToken(Long userId) {
        List<Token> tokens = tokenRepository.findByUserId(userId);
        if (tokens.isEmpty()) return;
        tokens.forEach(c -> {
            c.setRevoked(true);
            c.setExpired(true);
            tokenRepository.save(c);
        });
    }

    public void logout(String token) throws BusinessException {
        Token jwt = tokenRepository.findByToken(token).orElseThrow(
                () -> new BusinessException(ErrorCode.TOKEN_NOT_EXIST));
        jwt.setExpired(true);
        jwt.setRevoked(true);
        tokenRepository.save(jwt);
    }

    @Transactional
    public void setAdminRole(String userName) {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_ALREADY_EXIST));
        user.setRoleEnum(RoleEnum.ADMIN);
        userRepository.save(user);
    }
}
