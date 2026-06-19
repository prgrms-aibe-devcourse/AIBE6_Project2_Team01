package com.modle.domain.review.controller;

import com.modle.domain.review.dto.request.CreateReviewRequest;
import com.modle.domain.review.dto.response.ReviewResponse;
import com.modle.domain.review.service.ReviewService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    // TRUST-001: 리뷰 작성 (촬영 완료 후, 의뢰인↔모델 양방향)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ReviewResponse> createReview(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        return new ApiResponse<>(
                "201-1",
                "리뷰가 작성되었습니다.",
                reviewService.createReview(securityUser.getId(), request)
        );
    }
}
