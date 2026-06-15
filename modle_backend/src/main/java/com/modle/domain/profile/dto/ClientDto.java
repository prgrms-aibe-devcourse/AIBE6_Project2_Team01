package com.modle.domain.profile.dto;

import java.time.LocalDateTime;

import org.springframework.lang.NonNull;

import com.modle.domain.user.entity.Client;

public record ClientDto(
        @NonNull long id,
        @NonNull LocalDateTime createdDate,
        @NonNull LocalDateTime modifiedDate,
        @NonNull String clientType,
        @NonNull String companyName,
        String companyNumber,
        String introduction,
        String profileImageUrl,
        double avgRating,
        int reviewCount

) {
    public ClientDto(Client client) {
        this(
                client.getId(),
                client.getCreatedDate(),
                client.getModifiedDate(),
                client.getClientType() != null ? client.getClientType().name() : "UNKNOWN",
                client.getCompanyName(),
                client.getCompanyNumber(),
                client.getIntroduction(),
                client.getProfileImageUrl(),
                client.getAvgRating(),
                client.getReviewCount());
    }
}
