package com.modle.domain.profile.dto;

import com.modle.domain.user.entity.Client;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;

public record ClientDto(
        @NonNull long id,
        @NonNull long userId,
        @NonNull LocalDateTime createdDate,
        @NonNull LocalDateTime modifiedDate,
        @NonNull String clientType,
        @NonNull String companyName,
        String companyNumber,
        String region,
        String introduction,
        String profileImageUrl,
        double avgRating,
        int reviewCount

) {
    public ClientDto(Client client) {
        this(
                client.getId(),
                client.getUser().getId(),
                client.getCreatedDate(),
                client.getModifiedDate(),
                client.getClientType() != null ? client.getClientType().name() : "UNKNOWN",
                client.getCompanyName(),
                client.getCompanyNumber(),
                client.getUser() != null ? client.getUser().getRegion() : null,
                client.getIntroduction(),
                client.getProfileImageUrl(),
                client.getAvgRating(),
                client.getReviewCount());
    }
}
