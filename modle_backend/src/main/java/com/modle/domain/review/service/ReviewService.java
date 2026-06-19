package com.modle.domain.review.service;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.review.dto.request.CreateReviewRequest;
import com.modle.domain.review.dto.response.ReviewResponse;
import com.modle.domain.review.entity.Review;
import com.modle.domain.review.entity.type.ReviewerRole;
import com.modle.domain.review.repository.ReviewRepository;
import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.repository.ClientRepository;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ModelRepository modelRepository;
    private final ClientRepository clientRepository;

    // TRUST-001: 리뷰 작성 (촬영 완료 후)
    @Transactional
    public ReviewResponse createReview(Long userId, CreateReviewRequest request) {
        Application application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        // COMPLETED 상태에서만 리뷰 작성 가능
        if (application.getStatus() != ApplicationStatus.COMPLETED) {
            throw new CustomException(ErrorCode.REVIEW_NOT_ALLOWED);
        }

        JobPosting jobPosting = jobPostingRepository.findById(application.getJobPostingId())
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        // 작성자 역할 판별
        ReviewerRole reviewerRole = determineReviewerRole(userId, application, jobPosting);

        // 중복 리뷰 방지
        if (reviewRepository.existsByApplicationIdAndReviewerId(request.applicationId(), userId)) {
            throw new CustomException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // 리뷰 대상 결정
        Long targetUserId = switch (reviewerRole) {
            case CLIENT_TO_MODEL -> {
                Model model = modelRepository.findById(application.getModelId())
                        .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));
                yield model.getUser().getId();
            }
            case MODEL_TO_CLIENT -> jobPosting.getClientId();
        };

        Review review = Review.create(
                request.applicationId(),
                userId,
                targetUserId,
                reviewerRole,
                request.rating(),
                request.content()
        );
        reviewRepository.save(review);

        // TRUST-002: 평점 집계 갱신
        updateRating(reviewerRole, application, jobPosting, request.rating());

        return ReviewResponse.from(review);
    }

    private ReviewerRole determineReviewerRole(Long userId, Application application,
                                               JobPosting jobPosting) {
        boolean isClient = jobPosting.getClientId().equals(userId);
        if (isClient) return ReviewerRole.CLIENT_TO_MODEL;

        boolean isModel = modelRepository.findById(application.getModelId())
                .map(m -> m.getUser().getId().equals(userId))
                .orElse(false);
        if (isModel) return ReviewerRole.MODEL_TO_CLIENT;

        throw new CustomException(ErrorCode.ACCESS_DENIED);
    }

    private void updateRating(ReviewerRole reviewerRole, Application application,
                              JobPosting jobPosting, int rating) {
        switch (reviewerRole) {
            case CLIENT_TO_MODEL -> {
                // 의뢰인 → 모델 리뷰: Model.avgRating 갱신
                Model model = modelRepository.findById(application.getModelId())
                        .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));
                model.updateRating(rating);
            }
            case MODEL_TO_CLIENT -> {
                // 모델 → 의뢰인 리뷰: Client.avgRating 갱신
                Client client = clientRepository.findByUserId(jobPosting.getClientId())
                        .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
                client.updateRating(rating);
            }
        }
    }
}
