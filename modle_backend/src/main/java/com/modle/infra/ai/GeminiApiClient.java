package com.modle.infra.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class GeminiApiClient {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com";
    private static final String MODEL = "gemini-2.0-flash";

    private final RestClient restClient;
    private final String apiKey;

    public GeminiApiClient(@Value("${gemini.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .build();
    }

    public String generate(String prompt) {
        Request request = new Request(
                List.of(new Content(List.of(new Part(prompt))))
        );

        Response response = restClient.post()
                .uri("/v1beta/models/{model}:generateContent?key={key}", MODEL, apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(Response.class);

        if (response == null
                || response.candidates() == null
                || response.candidates().isEmpty()) {
            throw new RuntimeException("Gemini 응답이 비어있습니다.");
        }

        return response.candidates().get(0).content().parts().get(0).text();
    }

    private record Request(List<Content> contents) {}
    private record Content(List<Part> parts) {}
    private record Part(String text) {}
    private record Response(List<Candidate> candidates) {}
    private record Candidate(Content content) {}
}
