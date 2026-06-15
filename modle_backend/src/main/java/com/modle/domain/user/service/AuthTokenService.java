package com.modle.domain.user.service;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.repository.UserRepository;
import com.modle.global.auth.JwtTokenProvider;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthTokenService {
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserRepository userRepository;

    private static final String REFRESH_PREFIX = "refresh:";
    private static final String ROLE_PREFIX = "role:";
    private static final long REFRESH_EXPIRE_DAYS = 7;

    // Access Token 생성
    public String genAccessToken(User user) {
        String role = user.getRole() != null ? user.getRole().name() : "INCOMPLETE";
        return jwtTokenProvider.createAccessToken(user.getId(), role);
    }


    // Refresh Token 생성 + Redis 저장
    public String genRefreshToken(User user) {
        String refreshToken = jwtTokenProvider.createRefreshToken(
                user.getId(), user.getRole().name()
        );
        redisTemplate.opsForValue().set(
                REFRESH_PREFIX + user.getId(),
                refreshToken,
                REFRESH_EXPIRE_DAYS,
                TimeUnit.DAYS
        );
        return refreshToken;
    }

    // Refresh Token 검증 + 새 Access Token 발급
    public String reissueAccessToken(String refreshToken) {
        // 토큰 유효성 검증
        if (!jwtTokenProvider.isValid(refreshToken)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        Long userId = jwtTokenProvider.getUserId(refreshToken);
        String key = REFRESH_PREFIX + userId;

        // Redis에 저장된 토큰과 비교
        String savedToken = redisTemplate.opsForValue().get(key);
        if (savedToken == null || !savedToken.equals(refreshToken)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        // role은 Refresh Token payload에서 꺼냄
        String role = jwtTokenProvider.getRole(refreshToken);

        // 새 Access Token 발급
        return jwtTokenProvider.createAccessToken(userId, role);
    }

    // Refresh Token 삭제 (로그아웃)
    public void deleteRefreshToken(Long userId) {
        redisTemplate.delete(REFRESH_PREFIX + userId);
    }
}
