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
    private static final long REFRESH_EXPIRE_DAYS = 7;

    // Access Token 생성
    String genAccessToken(User user) {
        return jwtTokenProvider.createAccessToken(user.getId(), user.getRole().name());
    }

    // Refresh Token 생성 + Redis 저장
    public String genRefreshToken(User user) {
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());
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

        // 유저 조회는 userId만 있으면 되니까 role은 토큰에서 꺼냄
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 새 Access Token 발급
        return jwtTokenProvider.createAccessToken(userId, user.getRole().name());
    }

    // Refresh Token 삭제 (로그아웃)
    public void deleteRefreshToken(Long userId) {
        redisTemplate.delete(REFRESH_PREFIX + userId);
    }
}
