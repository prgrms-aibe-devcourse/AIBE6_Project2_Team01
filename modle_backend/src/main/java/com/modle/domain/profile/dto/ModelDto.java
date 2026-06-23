package com.modle.domain.profile.dto;

import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.type.Sex;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;

public record ModelDto(
        @NonNull long id,
        @NonNull long userId,
        @NonNull LocalDateTime createdDate,
        @NonNull LocalDateTime modifiedDate,
        @NonNull String name,
        @NonNull int height,
        @NonNull int weight,
        @NonNull Sex sex,
        @NonNull int age,
        List<String> categories,
        List<String> tags,
        String region,

        String introduction,
        String profileImageUrl,
        
        List<String> activeRegions,
        
        String experience,
        String topSize,
        String bottomSize,
        Integer shoeSize,
        String availableDays,
        
        @NonNull double avgRating,
        @NonNull int reviewCount,
        List<PortfolioDto> portfolios
) {
    public ModelDto(Model model) {
        this(
                model.getId(),
                model.getUser().getId(),
                model.getCreatedDate(),
                model.getModifiedDate(),
                model.getName(),
                model.getHeight(),
                model.getWeight(),
                model.getSex(),
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
                model.getUser() != null ? model.getUser().getRegion() : null,
                model.getIntroduction(),
                model.getProfileImageUrl(),
                model.getModelRegions() != null ? 
                        model.getModelRegions().stream()
                        .map(mr -> mr.getRegion().name())
                        .toList() : List.of(),
                model.getExperience(),
                model.getTopSize(),
                model.getBottomSize(),
                model.getShoeSize(),
                model.getAvailableDays(),
                model.getAvgRating(),
                model.getReviewCount(),
                model.getPortfolios() != null ?
                        model.getPortfolios().stream()
                        .map(PortfolioDto::new)
                        .toList() : List.of()
        );
    }
}
