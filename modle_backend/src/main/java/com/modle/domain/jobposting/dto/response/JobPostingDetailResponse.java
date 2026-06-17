package com.modle.domain.jobposting.dto.response;

public sealed interface JobPostingDetailResponse
        permits JobPostingClientDetailResponse, JobPostingModelDetailResponse, JobPostingOtherDetailResponse {
}
