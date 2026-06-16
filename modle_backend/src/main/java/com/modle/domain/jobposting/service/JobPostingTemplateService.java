package com.modle.domain.jobposting.service;

import com.modle.domain.jobposting.dto.request.JobPostingTemplateGenerateRequest;
import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.type.PayType;
import com.modle.infra.ai.GroqApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobPostingTemplateService {

    private final GroqApiClient groqApiClient;

    public String generateContent(JobPostingTemplateGenerateRequest request) {
        String prompt = buildPrompt(request);
        String content = groqApiClient.generate(prompt);
        // 항상 교정 단계 실행 (오타·어색한 표현·비한국어 정제)
        content = trimPreamble(groqApiClient.generate(buildPurifyPrompt(content)));
        // 그래도 비한국어가 남아있으면 최대 2회 추가 정제
        for (int i = 0; i < 2 && containsNonKorean(content); i++) {
            content = trimPreamble(groqApiClient.generate(buildPurifyPrompt(content)));
        }
        return content;
    }

    private String trimPreamble(String content) {
        int idx = content.indexOf("[촬영 개요]");
        return idx > 0 ? content.substring(idx) : content;
    }

    private boolean containsNonKorean(String text) {
        // 2글자 이상 연속 라틴 알파벳(영어·베트남어 등) 또는 한자·일본어 감지
        return java.util.regex.Pattern.compile("[a-zA-Z]{2,}|[\\u4E00-\\u9FFF\\u3040-\\u30FF]")
                .matcher(text).find();
    }

    private String buildPurifyPrompt(String content) {
        return """
                다음 공고 본문을 교정하여 교정된 본문만 반환하세요. 설명, 주석, 머리말은 절대 추가하지 마세요.
                아래 규칙을 반드시 지키세요.
                1. 'tham gia', 'tham가', 'thamia', '更加', '通지' 등 비한국어 표현을 자연스러운 한국어로 교체하세요. (예: 'tham gia' → '참여하다')
                2. 한자, 일본어, 영어 단어 등 한국어가 아닌 모든 표현을 한국어로 번역하세요.
                3. 오타나 잘못된 표현(예: '스탈' → '스타일')을 올바르게 수정하세요.
                4. 어색한 문장을 자연스러운 한국어로 다듬으세요.
                5. 섹션 제목([촬영 개요], [모집 조건], [촬영 내용], [촬영 일정], [보수])은 반드시 그대로 유지하세요.
                6. 마크다운(**, ###, _ 등)을 사용하지 마세요.
                7. 교정된 본문 텍스트만 반환하고, 그 외 어떤 설명도 추가하지 마세요.

                %s
                """.formatted(content);
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
                자연스러운 한국어로 작성하며 각 섹션은 2~3문장으로 간결하게 작성해주세요.
                입력된 정보를 기반으로 핵심 내용만 1~2문장 추가하는 수준으로 작성하세요. 과도한 내용 생성은 금지합니다.
                입력 정보의 날짜·보수 유형·나이는 해당 섹션에 자연스럽게 포함시켜주세요.
                반드시 업계 전문 용어를 사용하세요. (예: 헤어 스타일, 헤어 모델, 메이크업, 피팅, 스타일리스트, 화보 촬영 등)

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
