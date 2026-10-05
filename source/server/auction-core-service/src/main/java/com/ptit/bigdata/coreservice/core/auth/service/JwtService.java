package com.ptit.bigdata.coreservice.core.auth.service;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${spring.application.security.jwt.secret-key:${spring.security.jwt.secret-key:TranNhatNamHocVienCongNgheBuuChinhVienThong}}")
    private String SECRET_KEY;

    @Value("${spring.application.security.jwt.access-token:${spring.security.jwt.access-token:60000000}}")
    private long jwtExpiration;

    @Value("${spring.application.security.jwt.refresh-token:${spring.security.jwt.refresh-token:360000000}}")
    private long refreshExpiration;

    public Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String buildToken(Map<String, Object> extraClaim, UserDetails userDetails, long expiration) {
        User user = (User) userDetails;
        extraClaim.put("roles", java.util.List.of("ROLE_" + user.getRoleEnum().name()));
        extraClaim.put("userId", user.getId());
        return Jwts.builder()
                .setClaims(extraClaim)
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setSubject(user.getUsername())
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String buildAccessToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, jwtExpiration);
    }

    public String buildRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    public String buildTempToken(String email, String fullName) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("fullName", fullName != null ? fullName : "");
        claims.put("type", "TEMP_ONBOARDING");
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 phút
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractAllClaims(String jwt) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(jwt)
                .getBody();
    }

    public <T> T getClaimData(String token, Function<Claims, T> exFunction) {
        Claims claims = extractAllClaims(token);
        return exFunction.apply(claims);
    }

    public boolean isExpired(String token) {
        Date expiredDate = getClaimData(token, Claims::getExpiration);
        return expiredDate.before(new Date());
    }

    public String getUserName(String token) {
        return getClaimData(token, Claims::getSubject);
    }
}
