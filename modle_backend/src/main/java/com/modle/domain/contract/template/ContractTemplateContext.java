package com.modle.domain.contract.template;

public record ContractTemplateContext(
        String clientCompanyName,
        String clientEmail,
        String modelName,
        String modelEmail,
        String postContent,
        String postCategory,
        String shootStartAt,
        String shootEndAt,
        String location,
        String payment,
        String payType,
        String usageScope,
        String memo,
        String clientSignatureText,
        String clientSignedAt,
        String modelSignatureText,
        String modelSignedAt
) {
}