package com.modle.infra.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Component
public class OpenAiEmbeddingClient implements EmbeddingClient {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public OpenAiEmbeddingClient(
            @Value("${openai.api-key:${OPENAI_API_KEY:}}") String apiKey,
            @Value("${openai.embedding-model:${OPENAI_EMBEDDING_MODEL:text-embedding-3-small}}") String model
    ) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .build();
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public List<Double> embed(String input) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OpenAI API key is not configured.");
        }

        RuntimeException lastError = null;
        for (int attempt = 0; attempt < 2; attempt++) {
            try {
                EmbeddingResponse response = restClient.post()
                        .uri("/embeddings")
                        .header("Authorization", "Bearer " + apiKey)
                        .body(new EmbeddingRequest(model, input))
                        .retrieve()
                        .body(EmbeddingResponse.class);
                if (response == null || response.data() == null || response.data().isEmpty()) {
                    throw new IllegalStateException("OpenAI embedding response is empty.");
                }
                return response.data().getFirst().embedding();
            } catch (RuntimeException error) {
                lastError = error;
                log.warn("OpenAI embedding request failed. attempt={}", attempt + 1, error);
            }
        }
        throw lastError;
    }

    private record EmbeddingRequest(String model, String input) {
    }

    private record EmbeddingResponse(List<EmbeddingData> data) {
    }

    private record EmbeddingData(List<Double> embedding) {
    }
}
