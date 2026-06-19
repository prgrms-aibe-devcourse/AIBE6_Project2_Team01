package com.modle.domain.jobposting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.jobposting.dto.response.RecommendationCardResponse;
import com.modle.domain.jobposting.dto.response.RecommendationListResponse;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.ModelEmbedding;
import com.modle.domain.jobposting.entity.PostEmbedding;
import com.modle.domain.jobposting.entity.Recommendation;
import com.modle.domain.jobposting.entity.type.Category;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.global.entity.type.Region;
import com.modle.domain.jobposting.entity.type.RequiredSex;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.jobposting.repository.ModelEmbeddingRepository;
import com.modle.domain.jobposting.repository.PostEmbeddingRepository;
import com.modle.domain.jobposting.repository.RecommendationRepository;
import com.modle.domain.jobposting.repository.RecommendationUnlockRepository;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.entity.type.Sex;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.infra.ai.EmbeddingClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AiRecommendServiceTest {

    @Mock
    private JobPostingRepository jobPostingRepository;

    @Mock
    private ModelRepository modelRepository;

    @Mock
    private ModelEmbeddingRepository modelEmbeddingRepository;

    @Mock
    private PostEmbeddingRepository postEmbeddingRepository;

    @Mock
    private RecommendationRepository recommendationRepository;

    @Mock
    private RecommendationUnlockRepository recommendationUnlockRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private EmbeddingClient embeddingClient;

    private AiRecommendService aiRecommendService;

    @BeforeEach
    void setUp() {
        aiRecommendService = new AiRecommendService(
                jobPostingRepository,
                modelRepository,
                modelEmbeddingRepository,
                postEmbeddingRepository,
                recommendationRepository,
                recommendationUnlockRepository,
                applicationRepository,
                embeddingClient,
                new ObjectMapper()
        );
    }

    @Test
    void generateSnapshot_캐시된임베딩으로유사도순추천을저장한다() {
        JobPosting jobPosting = jobPosting();
        Model first = model(1L, 101L, "first", 4.5, 3);
        Model second = model(2L, 102L, "second", 5.0, 10);
        given(jobPostingRepository.findByIdForUpdate(10L)).willReturn(Optional.of(jobPosting));
        given(applicationRepository.findActiveAppliedModelIds(10L, ApplicationStatus.APPLICATION_CANCELLED))
                .willReturn(List.of());
        given(postEmbeddingRepository.findByPostId(10L))
                .willReturn(Optional.of(PostEmbedding.create(
                        10L,
                        "[1.0,0.0]",
                        sourceHash(jobPosting),
                        "test"
                )));
        given(modelRepository.findRecommendationCandidates(
                "M",
                20,
                35,
                170,
                null,
                null,
                80,
                0,
                Region.SEOUL.name(),
                Category.HAIR.name()
        )).willReturn(List.of(first, second));
        given(modelEmbeddingRepository.findByModelIdIn(List.of(1L, 2L)))
                .willReturn(List.of(
                        ModelEmbedding.create(1L, "[1.0,0.0]", "hash-1", "test"),
                        ModelEmbedding.create(2L, "[0.0,1.0]", "hash-2", "test")
                ));
        given(recommendationRepository.saveAll(anyList()))
                .willAnswer(invocation -> invocation.getArgument(0));

        aiRecommendService.generateSnapshot(10L);

        ArgumentCaptor<List<Recommendation>> captor = ArgumentCaptor.forClass(List.class);
        verify(recommendationRepository).deleteByPostId(10L);
        verify(recommendationRepository).saveAll(captor.capture());
        verify(embeddingClient, never()).embed(any());
        assertThat(captor.getValue()).extracting(Recommendation::getModelId)
                .containsExactly(1L, 2L);
        assertThat(captor.getValue()).extracting(Recommendation::getRank)
                .containsExactly(1, 2);
    }

    @Test
    void getRecommendations_지원자모델을제외하고등수를재부여한다() {
        JobPosting jobPosting = jobPosting();
        Model first = model(1L, 101L, "first", 4.5, 3);
        Model third = model(3L, 103L, "third", 4.0, 1);
        given(jobPostingRepository.findById(10L)).willReturn(Optional.of(jobPosting));
        given(recommendationRepository.findByPostIdOrderByRankAsc(10L)).willReturn(List.of(
                Recommendation.create(10L, 1L, 101L, 1, 0.9),
                Recommendation.create(10L, 2L, 102L, 2, 0.8),
                Recommendation.create(10L, 3L, 103L, 3, 0.7)
        ));
        given(recommendationUnlockRepository.existsByPostId(10L)).willReturn(true);
        given(applicationRepository.findActiveAppliedModelIds(10L, ApplicationStatus.APPLICATION_CANCELLED))
                .willReturn(List.of(2L));
        given(modelRepository.findAllById(List.of(1L, 3L))).willReturn(List.of(first, third));

        RecommendationListResponse response = aiRecommendService.getRecommendations(10L, 50L);

        assertThat(response.reasonCode()).isNull();
        assertThat(response.items()).extracting(RecommendationCardResponse::rank)
                .containsExactly(1, 2);
        assertThat(response.items()).extracting(RecommendationCardResponse::modelId)
                .containsExactly(1L, 3L);
        assertThat(response.items()).extracting(RecommendationCardResponse::locked)
                .containsExactly(false, false);
    }

    @Test
    void getRecommendations_추천모델이모두지원하면안내문구를반환한다() {
        JobPosting jobPosting = jobPosting();
        given(jobPostingRepository.findById(10L)).willReturn(Optional.of(jobPosting));
        given(recommendationRepository.findByPostIdOrderByRankAsc(10L)).willReturn(List.of(
                Recommendation.create(10L, 1L, 101L, 1, 0.9),
                Recommendation.create(10L, 2L, 102L, 2, 0.8)
        ));
        given(recommendationUnlockRepository.existsByPostId(10L)).willReturn(false);
        given(applicationRepository.findActiveAppliedModelIds(10L, ApplicationStatus.APPLICATION_CANCELLED))
                .willReturn(List.of(1L, 2L));
        given(modelRepository.findAllById(List.of())).willReturn(List.of());

        RecommendationListResponse response = aiRecommendService.getRecommendations(10L, 50L);

        assertThat(response.items()).isEmpty();
        assertThat(response.reasonCode()).isEqualTo("추천 모델이 이미 모두 지원했어요!");
    }

    private JobPosting jobPosting() {
        JobPosting jobPosting = JobPosting.builder()
                .clientId(50L)
                .title("헤어 촬영")
                .content("헤어 제품 촬영 모델을 찾습니다.")
                .category(Category.HAIR)
                .region(Region.SEOUL)
                .status(JobPostingStatus.RECRUITING)
                .requiredSex(RequiredSex.M)
                .ageMin(20)
                .ageMax(35)
                .heightMin(170)
                .heightMax(null)
                .weightMin(null)
                .weightMax(80)
                .minCareerMonths(0)
                .payment(BigDecimal.valueOf(100000))
                .build();
        ReflectionTestUtils.setField(jobPosting, "id", 10L);
        return jobPosting;
    }

    private String sourceHash(JobPosting jobPosting) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String source = jobPosting.getTitle() + "\n" + jobPosting.getContent();
            return HexFormat.of().formatHex(digest.digest(source.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException(error);
        }
    }

    private Model model(Long id, Long userId, String name, double avgRating, int reviewCount) {
        User user = User.createLocal(name + "@example.com", "password", "SEOUL", Role.MODEL);
        ReflectionTestUtils.setField(user, "id", userId);
        Model model = Model.create(user, name, 175, 65, Sex.M, 25);
        ReflectionTestUtils.setField(model, "id", id);
        ReflectionTestUtils.setField(model, "avgRating", avgRating);
        ReflectionTestUtils.setField(model, "reviewCount", reviewCount);
        return model;
    }
}
