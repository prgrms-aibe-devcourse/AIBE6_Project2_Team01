package com.modle.domain.jobposting.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.jobposting.dto.response.RecommendationCardResponse;
import com.modle.domain.jobposting.dto.response.RecommendationListResponse;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.ModelEmbedding;
import com.modle.domain.jobposting.entity.PostEmbedding;
import com.modle.domain.jobposting.entity.Recommendation;
import com.modle.domain.jobposting.entity.RecommendationUnlock;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.entity.type.RequiredSex;
import com.modle.domain.jobposting.event.JobPostingCreatedEvent;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.jobposting.repository.ModelEmbeddingRepository;
import com.modle.domain.jobposting.repository.PostEmbeddingRepository;
import com.modle.domain.jobposting.repository.RecommendationRepository;
import com.modle.domain.jobposting.repository.RecommendationUnlockRepository;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.infra.ai.EmbeddingClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiRecommendService {

    private static final int MAX_RECOMMENDATION_COUNT = 5;
    private static final String EMBEDDING_MODEL = "text-embedding-3-small";
    private static final String ALL_APPLIED_REASON = "추천 모델이 이미 모두 지원했어요!";

    private final JobPostingRepository jobPostingRepository;
    private final ModelRepository modelRepository;
    private final ModelEmbeddingRepository modelEmbeddingRepository;
    private final PostEmbeddingRepository postEmbeddingRepository;
    private final RecommendationRepository recommendationRepository;
    private final RecommendationUnlockRepository recommendationUnlockRepository;
    private final ApplicationRepository applicationRepository;
    private final EmbeddingClient embeddingClient;
    private final ObjectMapper objectMapper;

    /**
     * 공고 등록 완료 후 AI 모델 추천을 수행한다.
     *
     * AFTER_COMMIT으로 공고 저장 트랜잭션 커밋 이후 실행하고, @Async로 별도 스레드에서 처리해
     * 수 초가 걸리는 AI 호출이 공고 등록 응답을 지연시키지 않게 한다.
     *
     * @EnableAsync는 global/config/AsyncConfig에서 활성화한다.
    */

   // 공고 등록 후 추천 스냅샷 생성
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onJobPostingCreated(JobPostingCreatedEvent event) {
        try {
            generateSnapshot(event.jobPostingId());
        } catch (RuntimeException error) {
            log.warn("Failed to generate recommendations. postId={}", event.jobPostingId(), error);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void upsertModelEmbedding(Long modelId) {
        try {
            Model model = modelRepository.findById(modelId)
                    .orElseThrow(() -> new IllegalArgumentException("Model not found. modelId=" + modelId));
            String sourceText = sourceText(model);
            String sourceHash = sha256(sourceText);
            Optional<ModelEmbedding> existing = modelEmbeddingRepository.findByModelId(modelId);
            if (existing.isPresent() && sourceHash.equals(existing.get().getSourceHash())) {
                return;
            }
            String embeddingJson = toJson(embeddingClient.embed(sourceText));
            ModelEmbedding modelEmbedding = existing.orElseGet(() ->
                    ModelEmbedding.create(modelId, embeddingJson, sourceHash, EMBEDDING_MODEL)
            );
            modelEmbedding.update(embeddingJson, sourceHash, EMBEDDING_MODEL);
            modelEmbeddingRepository.save(modelEmbedding);
        } catch (RuntimeException error) {
            log.warn("Model embedding generation failed. modelId={}", modelId, error);
        }
    }

    @Transactional
    public void generateSnapshot(Long postId) {
        JobPosting jobPosting = findJobPostingForUpdate(postId);
        Optional<PostEmbedding> postEmbedding = ensurePostEmbedding(jobPosting);
        Set<Long> appliedModelIds = findAppliedModelIds(postId);

        // 후보 선별 -> 유사도 점수 -> 상위 5개 저장
        List<Model> candidates = findCandidates(jobPosting).stream()
                .filter(model -> !appliedModelIds.contains(model.getId()))
                .toList();
        if (candidates.isEmpty()) {
            recommendationRepository.deleteByPostId(postId);
            return;
        }
        Map<Long, ModelEmbedding> embeddingMap = modelEmbeddingRepository
                .findByModelIdIn(candidates.stream().map(Model::getId).toList())
                .stream()
                .collect(Collectors.toMap(ModelEmbedding::getModelId, Function.identity()));
        List<Double> postVector = postEmbedding
                .map(PostEmbedding::getEmbedding)
                .map(this::parseEmbedding)
                .orElse(List.of());
        boolean similarityEnabled = !postVector.isEmpty();

        List<ScoredModel> scoredModels = candidates.stream()
                .map(model -> scoreModel(model, embeddingMap.get(model.getId()), postVector, similarityEnabled))
                .flatMap(Optional::stream)
                .sorted(recommendationComparator())
                .collect(Collectors.toMap(
                        scored -> scored.model().getId(),
                        Function.identity(),
                        (first, ignored) -> first,
                        LinkedHashMap::new
                ))
                .values()
                .stream()
                .limit(MAX_RECOMMENDATION_COUNT)
                .toList();

        recommendationRepository.deleteByPostId(postId);
        recommendationRepository.flush();
        List<Recommendation> recommendations = toRecommendations(postId, scoredModels);
        recommendationRepository.saveAll(recommendations);
    }

    @Transactional(readOnly = true)
    public RecommendationListResponse getRecommendations(Long postId, Long clientId) {
        JobPosting jobPosting = validatePostOwner(postId, clientId);
        List<Recommendation> recommendations = recommendationRepository.findByPostIdOrderByRankAsc(postId);
        if (recommendations.isEmpty()) {
            return new RecommendationListResponse(postId, false, "NO_RESULT", List.of());
        }
        boolean unlocked = recommendationUnlockRepository.existsByPostId(postId);
        return toResponse(jobPosting, recommendations, unlocked);
    }

    @Transactional
    public RecommendationListResponse getOrCreateRecommendations(Long postId, Long clientId) {
        validatePostOwner(postId, clientId);
        List<Recommendation> recommendations = recommendationRepository.findByPostIdOrderByRankAsc(postId);
        if (recommendations.isEmpty() || containsAppliedModel(postId, recommendations)) {
            generateSnapshot(postId);
        }
        return getRecommendations(postId, clientId);
    }

    @Transactional
    public RecommendationListResponse unlockRecommendations(Long postId, Long clientId) {
        JobPosting jobPosting = validatePostOwner(postId, clientId);
        if (isUnlockBlocked(jobPosting.getStatus())) {
            throw new CustomException(ErrorCode.JOB_POSTING_NOT_EDITABLE);
        }
        if (!recommendationUnlockRepository.existsByPostId(postId)) {
            recommendationUnlockRepository.save(RecommendationUnlock.create(postId, clientId));
        }
        List<Recommendation> recommendations = recommendationRepository.findByPostIdOrderByRankAsc(postId);
        if (recommendations.isEmpty() || containsAppliedModel(postId, recommendations)) {
            generateSnapshot(postId);
        }
        return getRecommendations(postId, clientId);
    }

    private Optional<ScoredModel> scoreModel(
            Model model,
            ModelEmbedding modelEmbedding,
            List<Double> postVector,
            boolean similarityEnabled
    ) {
        if (!similarityEnabled) {
            return Optional.of(new ScoredModel(model, 0.0));
        }
        if (modelEmbedding == null) {
            log.info("Model embedding is missing. modelId={}", model.getId());
            return Optional.empty();
        }
        return Optional.of(new ScoredModel(
                model,
                cosineSimilarity(postVector, parseEmbedding(modelEmbedding.getEmbedding()))
        ));
    }

    private List<Model> findCandidates(JobPosting jobPosting) {
        if (jobPosting.getRegion() == null || jobPosting.getCategory() == null) {
            log.warn(
                    "Recommendation skipped because job posting filter is incomplete. postId={}, region={}, category={}",
                    jobPosting.getId(),
                    jobPosting.getRegion(),
                    jobPosting.getCategory()
            );
            return List.of();
        }

        RequiredSex requiredSex = Optional.ofNullable(jobPosting.getRequiredSex()).orElse(RequiredSex.ANY);
        String sex = requiredSex == RequiredSex.ANY
                ? null
                : requiredSex.name();
        return modelRepository.findRecommendationCandidates(
                sex,
                jobPosting.getAgeMin(),
                jobPosting.getAgeMax(),
                jobPosting.getHeightMin(),
                jobPosting.getHeightMax(),
                jobPosting.getWeightMin(),
                jobPosting.getWeightMax(),
                jobPosting.getMinCareerMonths(),
                jobPosting.getRegion().name(),
                jobPosting.getCategory().name()
        );
    }

    private Set<Long> findAppliedModelIds(Long postId) {
        return new HashSet<>(applicationRepository.findActiveAppliedModelIds(
                postId,
                ApplicationStatus.APPLICATION_CANCELLED
        ));
    }

    private boolean containsAppliedModel(Long postId, List<Recommendation> recommendations) {
        Set<Long> appliedModelIds = findAppliedModelIds(postId);
        if (appliedModelIds.isEmpty()) {
            return false;
        }
        return recommendations.stream()
                .map(Recommendation::getModelId)
                .anyMatch(appliedModelIds::contains);
    }

    private Optional<PostEmbedding> ensurePostEmbedding(JobPosting jobPosting) {
        String sourceText = sourceText(jobPosting);
        String sourceHash = sha256(sourceText);
        Optional<PostEmbedding> existing = postEmbeddingRepository.findByPostId(jobPosting.getId());
        if (existing.isPresent() && sourceHash.equals(existing.get().getSourceHash())) {
            return existing;
        }

        try {
            String embeddingJson = toJson(embeddingClient.embed(sourceText));
            PostEmbedding postEmbedding = existing.orElseGet(() ->
                    PostEmbedding.create(jobPosting.getId(), embeddingJson, sourceHash, EMBEDDING_MODEL)
            );
            postEmbedding.update(embeddingJson, sourceHash, EMBEDDING_MODEL);
            return Optional.of(postEmbeddingRepository.save(postEmbedding));
        } catch (RuntimeException error) {
            log.warn("Post embedding generation failed. postId={}", jobPosting.getId(), error);
            return Optional.empty();
        }
    }

    private List<Recommendation> toRecommendations(Long postId, List<ScoredModel> scoredModels) {
        for (int i = 0; i < scoredModels.size(); i++) {
            Model model = scoredModels.get(i).model();
            if (model.getUser() == null) {
                throw new IllegalStateException("Recommended model user is missing. modelId=" + model.getId());
            }
        }
        List<Recommendation> recommendations = new ArrayList<>();
        for (int index = 0; index < scoredModels.size(); index++) {
            ScoredModel scored = scoredModels.get(index);
            recommendations.add(Recommendation.create(
                    postId,
                    scored.model().getId(),
                    scored.model().getUser().getId(),
                    index + 1,
                    scored.score()
            ));
        }
        return recommendations;
    }

    private RecommendationListResponse toResponse(
            JobPosting jobPosting,
            List<Recommendation> recommendations,
            boolean unlocked
    ) {
        // 스냅샷 생성 이후 새로 지원한 모델은 추천에서 제외한다(readOnly 조회 경로 보강).
        Set<Long> appliedModelIds = findAppliedModelIds(jobPosting.getId());
        List<Recommendation> activeRecommendations = recommendations.stream()
                .filter(recommendation -> !appliedModelIds.contains(recommendation.getModelId()))
                .toList();
        Map<Long, Model> modelMap = modelRepository.findAllById(
                        activeRecommendations.stream().map(Recommendation::getModelId).toList()
                )
                .stream()
                .collect(Collectors.toMap(Model::getId, Function.identity()));
        Set<Integer> publicRanks = publicRanks(activeRecommendations.size());
        List<RecommendationCardResponse> items = new ArrayList<>();
        for (int index = 0; index < activeRecommendations.size(); index++) {
            int rank = index + 1;
            Recommendation recommendation = activeRecommendations.get(index);
            items.add(toCard(
                    rank,
                    modelMap.get(recommendation.getModelId()),
                    unlocked || publicRanks.contains(rank)
            ));
        }
        // toResponse는 recommendations가 비어있지 않을 때만 호출되므로, 전부 필터되면 추천 모델이 모두 지원한 경우다.
        String reasonCode = items.isEmpty() ? ALL_APPLIED_REASON : null;
        return new RecommendationListResponse(jobPosting.getId(), unlocked, reasonCode, items);
    }

    private RecommendationCardResponse toCard(
            int rank,
            Model model,
            boolean visible
    ) {
        if (model == null) {
            return new RecommendationCardResponse(
                    rank,
                    true,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    List.of(),
                    null,
                    null
            );
        }

        List<String> categories = model.getModelCategories().stream()
                .filter(modelCategory -> modelCategory.getCategory() != null)
                .map(modelCategory -> modelCategory.getCategory().name())
                .toList();
        String region = model.getModelRegions().stream()
                .findFirst()
                .map(modelRegion -> modelRegion.getRegion() == null ? null : modelRegion.getRegion().name())
                .orElse(null);

        if (!visible) {
            return new RecommendationCardResponse(
                    rank,
                    true,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    categories,
                    region,
                    null
            );
        }

        if (model.getUser() == null) {
            log.warn("Recommended model user is missing while building response. modelId={}", model.getId());
            return new RecommendationCardResponse(
                    rank,
                    true,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    categories,
                    region,
                    null
            );
        }

        return new RecommendationCardResponse(
                rank,
                false,
                model.getId(),
                model.getUser().getId(),
                model.getName(),
                model.getProfileImageUrl(),
                model.getAge(),
                model.getHeight(),
                categories,
                region,
                model.getAvgRating()
        );
    }

    private Set<Integer> publicRanks(int count) {
        return switch (count) {
            case 0 -> Set.of();
            case 1 -> Set.of(1);
            case 2 -> Set.of(1, 2);
            default -> Set.of(2, 3);
        };
    }

    private Comparator<ScoredModel> recommendationComparator() {
        return Comparator.comparingDouble(ScoredModel::score).reversed()
                .thenComparing(Comparator.comparingDouble((ScoredModel scored) ->
                        scored.model().getAvgRating()).reversed())
                .thenComparing(Comparator.comparingInt((ScoredModel scored) ->
                        scored.model().getReviewCount()).reversed())
                .thenComparing(scored -> scored.model().getId());
    }

    private double cosineSimilarity(List<Double> first, List<Double> second) {
        if (first.size() != second.size() || first.isEmpty()) {
            return 0.0;
        }
        double dot = 0.0;
        double firstNorm = 0.0;
        double secondNorm = 0.0;
        for (int i = 0; i < first.size(); i++) {
            dot += first.get(i) * second.get(i);
            firstNorm += first.get(i) * first.get(i);
            secondNorm += second.get(i) * second.get(i);
        }
        if (firstNorm == 0.0 || secondNorm == 0.0) {
            return 0.0;
        }
        return dot / (Math.sqrt(firstNorm) * Math.sqrt(secondNorm));
    }

    private List<Double> parseEmbedding(String embedding) {
        try {
            return objectMapper.readValue(embedding, new TypeReference<>() {
            });
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("Invalid embedding JSON.", error);
        }
    }

    private String toJson(List<Double> embedding) {
        try {
            return objectMapper.writeValueAsString(embedding);
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("Failed to serialize embedding.", error);
        }
    }

    private String sourceText(JobPosting jobPosting) {
        return String.join("\n",
                Optional.ofNullable(jobPosting.getTitle()).orElse(""),
                Optional.ofNullable(jobPosting.getContent()).orElse("")
        );
    }

    private String sourceText(Model model) {
        String categories = model.getModelCategories().stream()
                .filter(modelCategory -> modelCategory.getCategory() != null)
                .map(modelCategory -> modelCategory.getCategory().name())
                .collect(Collectors.joining(" "));
        String tags = model.getModelTags().stream()
                .filter(modelTag -> modelTag.getTag() != null)
                .map(modelTag -> modelTag.getTag().getName())
                .collect(Collectors.joining(" "));
        String portfolios = model.getPortfolios().stream()
                .map(portfolio -> Optional.ofNullable(portfolio.getImgUrl()).orElse(""))
                .collect(Collectors.joining(" "));
        return String.join("\n",
                Optional.ofNullable(model.getIntroduction()).orElse(""),
                categories,
                tags,
                portfolios
        );
    }

    private String sha256(String source) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(source.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("SHA-256 is not available.", error);
        }
    }

    private JobPosting findJobPosting(Long postId) {
        return jobPostingRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));
    }

    private JobPosting findJobPostingForUpdate(Long postId) {
        return jobPostingRepository.findByIdForUpdate(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));
    }

    private JobPosting validatePostOwner(Long postId, Long clientId) {
        JobPosting jobPosting = findJobPosting(postId);
        if (!jobPosting.getClientId().equals(clientId)) {
            throw new CustomException(ErrorCode.JOB_POSTING_FORBIDDEN);
        }
        return jobPosting;
    }

    private boolean isUnlockBlocked(JobPostingStatus status) {
        return status == JobPostingStatus.CLOSED
                || status == JobPostingStatus.CANCELLED
                || status == JobPostingStatus.COMPLETED;
    }

    private record ScoredModel(Model model, double score) {
    }
}
