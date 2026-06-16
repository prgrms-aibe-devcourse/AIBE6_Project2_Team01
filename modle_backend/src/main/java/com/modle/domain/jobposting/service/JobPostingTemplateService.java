package com.modle.domain.jobposting.service;

import com.modle.domain.jobposting.dto.request.JobPostingTemplateGenerateRequest;
import com.modle.domain.jobposting.entity.Category;
import com.modle.domain.jobposting.entity.PayType;
import com.modle.infra.ai.GeminiApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobPostingTemplateService {

    private final GeminiApiClient geminiApiClient;

    public String generateContent(JobPostingTemplateGenerateRequest request) {
        String prompt = buildPrompt(request);
        return geminiApiClient.generate(prompt);
    }

    private String buildPrompt(JobPostingTemplateGenerateRequest request) {
        return """
                당신은 모델 에이전시의 공고 작성 전문가입니다.
                아래 정보를 바탕으로 공고 본문을 작성해주세요.

                [입력 정보]
                - 카테고리: %s
                - 공고 제목: %s
                - 촬영 예정일: %s
                - 보수 유형: %s
                - 모집 연령: %s

                다음 형식을 반드시 지켜서 작성해주세요.
                각 섹션 제목은 그대로 유지하고 내용만 채워주세요.
                자연스러운 한국어로 작성하며 각 섹션은 2~4문장으로 간결하게 작성해주세요.
                입력 정보의 날짜·보수 유형·나이는 해당 섹션에 자연스럽게 포함시켜주세요.

                [촬영 개요]

                [모집 조건]

                [촬영 내용]

                [촬영 일정]

                [보수]
                """.formatted(
                categoryLabel(request.category()),
                request.title(),
                request.shootDate(),
                payTypeLabel(request.payType()),
                ageRange(request.ageMin(), request.ageMax())
        );
    }

    private String ageRange(Integer ageMin, Integer ageMax) {
        if (ageMin != null && ageMax != null) return ageMin + "세 이상 ~ " + ageMax + "세 이하";
        if (ageMin != null) return ageMin + "세 이상";
        if (ageMax != null) return ageMax + "세 이하";
        return "무관";
    }

    private String categoryLabel(Category category) {
        return switch (category) {
            case HAIR -> "헤어";
            case MAKEUP -> "메이크업";
            case CLOTHING -> "의류";
            case FITTING -> "피팅";
            case HAND -> "핸드";
            case FOOD -> "음식";
            case PRODUCT -> "제품";
            case ETC -> "기타";
        };
    }

    private String payTypeLabel(PayType payType) {
        return switch (payType) {
            case CASH -> "현금";
            case SERVICE -> "서비스 제공";
            case FREE -> "무료";
        };
    }
}
