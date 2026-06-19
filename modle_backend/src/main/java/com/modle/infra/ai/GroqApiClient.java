package com.modle.infra.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Component
public class GroqApiClient {

    private static final String BASE_URL = "https://api.groq.com";
    private static final String MODEL = "llama-3.3-70b-versatile";

    private final RestClient restClient;
    private final String apiKey;

    public GroqApiClient(@Value("${groq.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .build();
    }

    public String generate(String prompt) {
        Request request = new Request(MODEL, List.of(
                new Message("system", "당신은 한국 모델 에이전시의 공고 작성 전문가입니다. 반드시 순수한 한국어로 작성하세요. 단, 한국 패션·모델 업계에서 통용되는 외래어(헤어, 헤어 스타일, 메이크업, 피팅, 모델, 스타일리스트 등)는 직역하지 말고 그대로 사용하세요. '헤어'를 '머리카락'이나 '머리 모양'으로, '메이크업'을 '화장'으로 번역하지 마세요. 마크다운(###, **, _ 등)을 사용하지 마세요. 지정된 섹션 형식만 사용하세요."),
                new Message("user", prompt)
        ));

        try {
            Response response = restClient.post()
                    .uri("/openai/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(Response.class);

            if (response == null
                    || response.choices() == null
                    || response.choices().isEmpty()) {
                throw new RuntimeException("AI 응답이 비어있습니다.");
            }

            return response.choices().get(0).message().content();

        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new RuntimeException("AI 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.", e);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("AI API 오류: " + e.getStatusCode(), e);
        } catch (RestClientException e) {
            throw new RuntimeException("AI API 연결에 실패했습니다.", e);
        }
    }

    private record Request(String model, List<Message> messages) {}
    private record Message(String role, String content) {}
    private record Response(List<Choice> choices) {}
    private record Choice(Message message) {}
}
