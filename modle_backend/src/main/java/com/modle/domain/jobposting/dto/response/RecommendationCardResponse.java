package com.modle.domain.jobposting.dto.response;

import java.util.List;

public record RecommendationCardResponse(
        int rank,
        boolean locked,
        Long modelId,
        Long userId,
        String name,
        String profileImageUrl,
        Integer age,
        Integer height,
        List<String> categories,
        String region,
        Double avgRating,
        boolean alreadyApplied
) {
}
