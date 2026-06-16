package com.modle.domain.contract.dto.response;

import com.modle.domain.contract.entity.ContractTemplate;

public record ContractTemplateResponse(
        Long id,
        String title,
        String content
) {
    public static ContractTemplateResponse from(ContractTemplate template) {
        return new ContractTemplateResponse(
                template.getId(),
                template.getTitle(),
                template.getContent()
        );
    }
}
