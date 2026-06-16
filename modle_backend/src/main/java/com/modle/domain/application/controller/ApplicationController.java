package com.modle.domain.application.controller;

import com.modle.domain.application.dto.response.ApplicationResponse;
import com.modle.domain.application.service.ApplicationService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // MATCH-001: 모델이 모집 중인 공고에 지원한다 (MODEL 전용).
    @PreAuthorize("hasRole('MODEL')")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/api/jobs/{id}/apply")
    public ApiResponse<ApplicationResponse> apply(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser securityUser) {
        return ApiResponse.ok("공고 지원 성공", applicationService.applyToJob(securityUser.getId(), id));
    }
}
