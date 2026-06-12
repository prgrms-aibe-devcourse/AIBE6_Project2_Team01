package com.modle.domain.profile.dto;

import com.modle.domain.profile.entity.Model;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;

public record ModelDto(
        @NonNull long id,
        @NonNull LocalDateTime createdDate,
        @NonNull LocalDateTime modifiedDate,
        @NonNull  String name,
        @NonNull int age,
        @NonNull int height,
        @NonNull int weight,
        @NonNull String introduction,
        @NonNull String profile_image_url,
        @NonNull double avg_rating,
        @NonNull int review_count
) {
    public ModelDto(Model model){
        this(
                model.getId(),
                model.getCreatedDate(),
                model.getModifiedDate(),
                model.getName(),
                model.getAge(),
                model.getHeight(),
                model.getWeight(),
                model.getIntroduction(),
                model.getProfileImageUrl(),
                model.getAvgRating(),
                model.getReviewCount()
        );
    }
}
