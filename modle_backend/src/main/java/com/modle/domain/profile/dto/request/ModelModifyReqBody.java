package com.modle.domain.profile.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ModelModifyReqBody (
        @NotBlank
        @Size(min = 2, max = 20)
        String name,
        String region,
        @NotBlank
        int age,
        @NotBlank
        int height,
        @NotBlank
        int weight,

        String introduction,
        String profile_image_url,
        double avg_rating,
        int review_count,
        int user_id

){

}
