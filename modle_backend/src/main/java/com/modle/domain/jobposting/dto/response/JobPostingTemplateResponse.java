package com.modle.domain.jobposting.dto.response;

import com.modle.domain.jobposting.entity.JobPostingTemplate;

public record JobPostingTemplateResponse(
        Long id,
        String category,
        String title,
        String content
) {
    public static JobPostingTemplateResponse from(JobPostingTemplate template) {
        return new JobPostingTemplateResponse(
                template.getId(),
                template.getCategory(),
                template.getTitle(),
                template.getContent()
        );
    }
}
