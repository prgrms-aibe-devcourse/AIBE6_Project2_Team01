package com.modle.domain.user.service;

import com.modle.domain.user.entity.User;
import com.modle.global.auth.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthTokenService {
    private final JwtTokenProvider jwtTokenProvider;

    String genAccessToken(User user) {
        return jwtTokenProvider.createAccessToken(user.getId(), user.getRole().name());
    }
}
