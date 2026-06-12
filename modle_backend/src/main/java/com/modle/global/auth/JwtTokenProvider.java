package com.modle.global.auth;

import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-expiration}")
    private Long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    // 시크릿 키 문자열로 SecretKey 객체 생성
    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // Access Token 생성 (userId, role 담아서 발급)
    public String createAccessToken(Long userId, String role) {
        return Jwts.builder()
                .claims(Map.of("id", userId, "role", role))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(getSecretKey())
                .compact();
    }

    // Refresh Token 생성 (userId + role 담아서 발급)
    public String createRefreshToken(Long userId, String role) {
        return Jwts.builder()
                .claims(Map.of("id", userId, "role", role))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSecretKey())
                .compact();
    }

    // 토큰에서 payload(claims) 추출 — 유효하지 않으면 null 반환
    public Map<String, Object> getPayload(String token) {
        try {
            return (Map<String, Object>) Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parse(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new CustomException(ErrorCode.EXPIRED_TOKEN);
        } catch (JwtException | IllegalArgumentException e) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
    }

    // 토큰 유효성 검증 — 유효하면 true, 아니면 false
    public boolean isValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // payload에서 userId 추출
    public Long getUserId(String token) {
        Map<String, Object> payload = getPayload(token);
        return ((Number) payload.get("id")).longValue();
    }

    // payload에서 role 추출
    public String getRole(String token) {
        Map<String, Object> payload = getPayload(token);
        return (String) payload.get("role");
    }
}
