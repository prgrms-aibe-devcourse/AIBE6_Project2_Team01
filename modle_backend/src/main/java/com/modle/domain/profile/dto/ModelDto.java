package com.modle.domain.profile.dto;

import com.modle.domain.user.entity.Model;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;

public record ModelDto(
        @NonNull long id,
        @NonNull LocalDateTime createdDate,
        @NonNull LocalDateTime modifiedDate,
        @NonNull String name,
        @NonNull int height,
        @NonNull int weight,
        @NonNull boolean gender,
        @NonNull int age,
        String field,
        String tags,
        String introduction,
        String profileImageUrl,
        @NonNull double avgRating,
        @NonNull int reviewCount
) {
    public ModelDto(Model model){
        this(
                model.getId(),
                model.getCreatedDate(),
                model.getModifiedDate(),
                model.getName(),
                model.getHeight(),
                model.getWeight(),
                model.isGender(),
                model.getAge(),
                model.getField(),
                model.getTags(),
                model.getIntroduction(),
                model.getProfileImageUrl(),
                model.getAvgRating(),
                model.getReviewCount()
        );
    }
}
