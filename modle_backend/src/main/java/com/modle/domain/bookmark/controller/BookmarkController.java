package com.modle.domain.bookmark.controller;

import com.modle.domain.jobposting.dto.response.JobPostingBookmarkResponse;
import com.modle.domain.jobposting.service.JobPostingBookmarkService;
import com.modle.domain.profile.dto.response.ModelBookmarkResponse;
import com.modle.domain.profile.service.ModelBookmarkService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bookmarks")
@Tag(name = "북마크", description = "공고·모델 북마크 API")
public class BookmarkController {
    private final JobPostingBookmarkService jobPostingBookmarkService;
    private final ModelBookmarkService modelBookmarkService;

    // 공고 북마크 추가 (MODEL만)
    @Operation(summary = "공고 북마크 추가", description = "공고를 북마크에 추가합니다. (MODEL 전용)")
    @PostMapping("/jobs/{jobPostingId}")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<Void> addJobBookmark(
            @PathVariable Long jobPostingId,
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        jobPostingBookmarkService.add(securityUser.getId(), jobPostingId);
        return new ApiResponse<>("200-1", "공고 북마크가 추가되었습니다.");
    }

    // 공고 북마크 삭제 (MODEL만)
    @Operation(summary = "공고 북마크 삭제", description = "공고를 북마크에서 삭제합니다. (MODEL 전용)")
    @DeleteMapping("/jobs/{jobPostingId}")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<Void> removeJobBookmark(
            @PathVariable Long jobPostingId,
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        jobPostingBookmarkService.remove(securityUser.getId(), jobPostingId);
        return new ApiResponse<>("200-1", "공고 북마크가 삭제되었습니다.");
    }

    // 내 공고 북마크 목록 (MODEL만)
    @Operation(summary = "내 공고 북마크 목록 조회", description = "본인이 북마크한 공고 목록을 조회합니다. (MODEL 전용)")
    @GetMapping("/jobs")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<List<JobPostingBookmarkResponse>> getMyJobBookmarks(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return new ApiResponse<>("200-1", "공고 북마크 목록 조회 성공",
                jobPostingBookmarkService.getMyBookmarks(securityUser.getId()));
    }

    // 모델 북마크 추가 (CLIENT만)
    @Operation(summary = "모델 북마크 추가", description = "모델을 북마크에 추가합니다. (CLIENT 전용)")
    @PostMapping("/models/{modelId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<Void> addModelBookmark(
            @PathVariable Long modelId,
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        modelBookmarkService.add(securityUser.getId(), modelId);
        return new ApiResponse<>("200-1", "모델 북마크가 추가되었습니다.");
    }

    // 모델 북마크 삭제 (CLIENT만)
    @Operation(summary = "모델 북마크 삭제", description = "모델을 북마크에서 삭제합니다. (CLIENT 전용)")
    @DeleteMapping("/models/{modelId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<Void> removeModelBookmark(
            @PathVariable Long modelId,
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        modelBookmarkService.remove(securityUser.getId(), modelId);
        return new ApiResponse<>("200-1", "모델 북마크가 삭제되었습니다.");
    }

    // 내 모델 북마크 목록 (CLIENT만)
    @Operation(summary = "내 모델 북마크 목록 조회", description = "본인이 북마크한 모델 목록을 조회합니다. (CLIENT 전용)")
    @GetMapping("/models")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<List<ModelBookmarkResponse>> getMyModelBookmarks(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return new ApiResponse<>("200-1", "모델 북마크 목록 조회 성공",
                modelBookmarkService.getMyBookmarks(securityUser.getId()));
    }
}
