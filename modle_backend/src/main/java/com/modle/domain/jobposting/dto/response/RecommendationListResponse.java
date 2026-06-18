package com.modle.domain.jobposting.dto.response;

import java.util.List;

public record RecommendationListResponse(
        Long postId,
        boolean unlocked,
        String reasonCode,
        List<RecommendationCardResponse> items
) {
}
