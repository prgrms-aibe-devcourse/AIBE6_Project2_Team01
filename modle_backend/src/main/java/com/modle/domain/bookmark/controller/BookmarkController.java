package com.modle.domain.bookmark.controller;

import com.modle.domain.jobposting.dto.response.JobPostingBookmarkResponse;
import com.modle.domain.jobposting.service.JobPostingBookmarkService;
import com.modle.domain.profile.dto.response.ModelBookmarkResponse;
import com.modle.domain.profile.service.ModelBookmarkService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bookmarks")
public class BookmarkController {
    private final JobPostingBookmarkService jobPostingBookmarkService;
    private final ModelBookmarkService modelBookmarkService;

    // 공고 북마크 추가 (MODEL만)
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
    @GetMapping("/jobs")
    @PreAuthorize("hasRole('MODEL')")
    public ApiResponse<List<JobPostingBookmarkResponse>> getMyJobBookmarks(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return new ApiResponse<>("200-1", "공고 북마크 목록 조회 성공",
                jobPostingBookmarkService.getMyBookmarks(securityUser.getId()));
    }

    // 모델 북마크 추가 (CLIENT만)
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
    @GetMapping("/models")
    @PreAuthorize("hasRole('CLIENT')")
    public ApiResponse<List<ModelBookmarkResponse>> getMyModelBookmarks(
            @AuthenticationPrincipal SecurityUser securityUser
    ) {
        return new ApiResponse<>("200-1", "모델 북마크 목록 조회 성공",
                modelBookmarkService.getMyBookmarks(securityUser.getId()));
    }
}
