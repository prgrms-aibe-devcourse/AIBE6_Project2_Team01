package com.modle.domain.profile.dto;

import com.modle.domain.user.entity.Model;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;

public record ModelDto(
        @NonNull long id,
        @NonNull LocalDateTime createdDate,
        @NonNull LocalDateTime modifiedDate,
        @NonNull String name,
        @NonNull int height,
        @NonNull int weight,
        @NonNull boolean gender,
        @NonNull int age,
        List<String> categories,
        List<String> tags,

        String introduction,
        String profileImageUrl,
        @NonNull double avgRating,
        @NonNull int reviewCount,
        List<PortfolioDto> portfolios
) {
    public ModelDto(Model model) {
        this(
                model.getId(),
                model.getCreatedDate(),
                model.getModifiedDate(),
                model.getName(),
                model.getHeight(),
                model.getWeight(),
                model.isGender(),
                model.getAge(),

                //  연관관계 엔티티에서 문자열 이름만 추출해서 List로 반환
                model.getModelCategories() != null ?
                        model.getModelCategories().stream()
                        .map(mc -> mc.getCategory().name())
                        .toList() : List.of(),

                model.getModelTags() != null ?
                        model.getModelTags().stream()
                        .map(mt -> mt.getTag().getName())
                        .toList() : List.of(),
                model.getIntroduction(),
                model.getProfileImageUrl(),
                model.getAvgRating(),
                model.getReviewCount(),
                model.getPortfolios() != null ?
                        model.getPortfolios().stream()
                        .map(PortfolioDto::new)
                        .toList() : List.of()
        );
    }
}
