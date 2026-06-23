package com.modle.domain.jobposting.service;

import com.modle.domain.jobposting.dto.request.JobPostingTemplateGenerateRequest;
import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.type.PayType;
import com.modle.domain.jobposting.entity.type.RequiredSex;
import com.modle.infra.ai.GroqApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPostingTemplateService {

    private final GroqApiClient groqApiClient;

    public String generateContent(JobPostingTemplateGenerateRequest request) {
        String content = groqApiClient.generate(buildPrompt(request));
        content = postProcess(groqApiClient.generate(buildPurifyPrompt(content)));
        for (int i = 0; i < 2 && containsNonKorean(content); i++) {
            content = postProcess(groqApiClient.generate(buildPurifyPrompt(content)));
        }
        return stripForeignChars(content);
    }

    private String postProcess(String content) {
        if (content == null) return "";
        // 섹션 제목([촬영 개요] 등) 코드 레벨에서 직접 제거
        String removed = Arrays.stream(content.split("\n"))
                .filter(line -> !line.trim().matches("\\[.*\\]"))
                .collect(Collectors.joining("\n"));
        return removed.strip();
    }

    private boolean containsNonKorean(String text) {
        return java.util.regex.Pattern.compile(
                "[a-zA-Z]{2,}|[\\u4E00-\\u9FFF\\u3040-\\u30FF\\u0400-\\u04FF\\u0E00-\\u0EFF\\u0600-\\u06FF\\u0900-\\u097F]"
        ).matcher(text).find();
    }

    private String stripForeignChars(String text) {
        if (text == null) return "";
        // purify AI가 제거하지 못한 외국 문자를 코드 레벨에서 최종 제거
        return text.replaceAll(
                "[\\u4E00-\\u9FFF\\u3040-\\u30FF\\u0400-\\u04FF\\u0E00-\\u0EFF\\u0600-\\u06FF\\u0900-\\u097F]", ""
        );
    }

    private String buildPurifyPrompt(String content) {
        return """
                다음 공고 본문을 교정하여 교정된 본문만 반환하세요. 설명, 주석, 머리말은 절대 추가하지 마세요.
                아래 규칙을 반드시 지키세요.
                1. 한자, 러시아어(키릴 문자), 일본어, 태국어 등 외국 문자를 한국어로 교체하세요.
                2. 헤어, 메이크업, 피팅, 스타일링, 화보, 포트폴리오, 스타일리스트 등 업계 표준 외래어는 반드시 그대로 유지하세요.
                3. 날짜와 나이는 숫자로 표기하세요. (예: 2026년 6월 26일, 20세 이상)
                4. 오타나 잘못된 표현을 올바르게 수정하세요.
                5. 어색한 문장을 자연스러운 한국어로 다듬으세요.
                6. [촬영 개요], [모집 조건] 등 대괄호 섹션 제목이 있으면 제거하고 빈 줄로 대체하세요.
                7. 마크다운(**, ###, _ 등)을 사용하지 마세요.
                8. 교정된 본문만 반환하고, 그 외 어떤 설명도 추가하지 마세요.

                %s
                """.formatted(content);
    }

    private String buildPrompt(JobPostingTemplateGenerateRequest request) {
        String categoryConditions = categorySpecificConditions(request);
        String conditionsBlock = categoryConditions.isEmpty() ? "" :
                "\n카테고리별 모집 조건 (반드시 모집 조건 문단에 포함하세요):\n" + categoryConditions;

        return """
                당신은 모델 에이전시의 공고 작성 전문가입니다.
                아래 정보를 바탕으로 공고 본문을 작성해주세요.

                [입력 정보]
                - 카테고리: %s
                - 공고 제목: %s
                - 촬영 예정일: %s
                - 보수 유형: %s
                - 모집 연령: %s
                - 성별 조건: %s
                %s

                [작성 규칙]
                1. 한자, 러시아어, 일본어, 태국어 등 외국 문자를 절대 사용하지 마세요.
                2. 헤어, 메이크업, 피팅, 스타일링, 화보, 포트폴리오, 스타일리스트 등 업계 표준 외래어는 반드시 그대로 사용하세요. 이를 순우리말로 바꾸지 마세요.
                3. 날짜와 나이는 반드시 숫자로 표기하세요. (예: 2026년 6월 26일, 20세 이상)
                4. 섹션 제목([촬영 개요], [모집 조건] 등)을 사용하지 마세요. 문단 사이는 빈 줄로만 구분하세요.
                5. 각 문단은 2~3문장으로 간결하게 작성하세요. 알 수 없는 정보는 생략하고 문단 수를 줄여도 됩니다.
                6. "본 촬영은", "본 공고는" 같은 반복적인 격식체를 피하세요.
                7. 성별 조건이 "무관"이면 성별 관련 문장을 단 한 줄도 쓰지 마세요. "성별 제한 없음", "성별에 관계없이" 같은 표현도 금지입니다.
                8. 제공되지 않은 정보(촬영 시작·종료 시간, 장소 등)를 임의로 추측하거나 filler 문장으로 채우지 마세요. 해당 내용은 아예 생략하세요. 다음 표현은 절대 사용하지 마세요: "추후 안내", "개별 연락", "협의 예정", "세부 사항 안내", "재능을 발휘", "기회를 제공".
                9. 마크다운(**, ###, _ 등)을 사용하지 마세요.
                10. 동일한 표현, 단어, 조건을 두 문단 이상에 걸쳐 반복하지 마세요. 앞 문단에서 이미 서술한 내용을 뒤 문단에서 다시 쓰지 마세요.
                11. 날짜 문단은 촬영 날짜 하나만 간결하게 서술하세요. 앞 문단 내용을 다시 요약하지 마세요.

                다음 순서로 5개 문단을 작성하세요 (섹션 제목 없이, 빈 줄로만 구분):
                1. 촬영 목적과 간단한 소개 (1~2문장)
                2. 모집 조건 (나이, 성별, 카테고리별 특수 조건 포함, 3~4문장)
                3. 촬영 내용 (2~3문장)
                4. 촬영 일정 (1~2문장)
                5. 보수 안내 (1~2문장)
                """.formatted(
                categoryLabel(request.category()),
                request.title(),
                request.shootDate(),
                payTypeLabel(request.payType()),
                ageRange(request.ageMin(), request.ageMax()),
                sexLabel(request.requiredSex()),
                conditionsBlock
        );
    }

    private String categorySpecificConditions(JobPostingTemplateGenerateRequest request) {
        return switch (request.category()) {
            case HAIR -> buildHairConditions(request.title());
            case MAKEUP -> "- 피부 트러블 또는 알레르기가 없는 분\n- 메이크업 제거에 동의하시는 분";
            case FITTING -> "- 신체 사이즈 정확히 기재 필수\n- 다수 의상 착용 및 장시간 피팅 가능한 분";
            case HAND -> "- 손 피부 상태가 양호한 분 (손톱 정리 필수)\n- 네일아트 유무 사전 안내 필수";
            case FOOD -> "- 음식 알레르기 여부 사전 안내 필수\n- 음식 취식 연기 촬영 가능한 분";
            case PRODUCT -> "- 촬영 제품 관련 알레르기가 없는 분\n- 제품 사용 시연이 가능한 분";
            case ETC -> "";
        };
    }

    private String buildHairConditions(String title) {
        String t = title == null ? "" : title;
        StringBuilder sb = new StringBuilder();

        boolean isDye = t.contains("염색") || t.contains("컬러") || t.contains("블리치") || t.contains("탈색");
        boolean isPerm = t.contains("펌") || t.contains("웨이브") || t.contains("컬") || t.contains("매직");

        if (isDye) {
            sb.append("- 최근 1개월 이내 염색 이력이 없는 분\n");
            sb.append("- 먹물염색(짙은 블랙 계열 염색) 이력이 없는 분\n");
        }
        if (isPerm) {
            sb.append("- 최근 6개월 이내 펌 시술 이력이 없는 분\n");
            sb.append("- 탈색·과손상 모발이 없는 분\n");
        }
        if (!isDye && !isPerm) {
            sb.append("- 모발 건강 상태가 양호한 분\n");
            sb.append("- 촬영 당일 헤어 스타일 변경에 동의하시는 분\n");
        }
        return sb.toString().trim();
    }

    private String sexLabel(RequiredSex sex) {
        if (sex == null) return "무관";
        return switch (sex) {
            case M -> "남성";
            case F -> "여성";
            case ANY -> "무관";
        };
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
