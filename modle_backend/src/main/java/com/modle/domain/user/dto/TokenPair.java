package com.modle.domain.user.dto;

public record TokenPair(
        String accessToken,
        String refreshToken
) {
}
