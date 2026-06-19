package com.modle.domain.profile.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.modle.global.entity.type.Region;
import com.modle.domain.jobposting.service.AiRecommendService;
import com.modle.domain.profile.entity.ModelCategory;
import com.modle.domain.profile.entity.ModelRegion;
import com.modle.domain.profile.entity.ModelTag;
import com.modle.domain.profile.entity.Tag;
import com.modle.domain.profile.entity.type.Category;
import com.modle.domain.profile.repository.TagRepository;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Sex;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.repository.ModelSpecification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Service
@Slf4j
public class ModelService {
    private final ModelRepository modelRepository;
    private final TagRepository tagRepository;
    private final AiRecommendService aiRecommendService;

    public long count() {
        return modelRepository.count();
    }

    public Page<Model> getList(String query, Sex sex, List<Category> categories, List<String> regions,
            List<String> tags, String height, String sortType, int page, int size) {

        List<Specification<Model>> specs = new ArrayList<>();
        // 1. 이름 검색 (query)
        if (query != null && !query.trim().isEmpty()) {
            specs.add(ModelSpecification.nameContains(query));
        }
        // 2. 성별 (sex)
        if (sex != null) {
            specs.add(ModelSpecification.sexEquals(sex));
        }
        // 3. 카테고리 (categories)
        if (categories != null && !categories.isEmpty()) {
            specs.add(ModelSpecification.hasCategories(categories));
        }
        // 4. 지역 (regions) - User 엔티티 기반
        if (regions != null && !regions.isEmpty()) {
            List<String> mappedRegions = new java.util.ArrayList<>();
            for (String r : regions) {
                mappedRegions.add(r); // Add English value (e.g. SEOUL)
                try {
                    mappedRegions.add(Region.valueOf(r).getDisplayName()); // Add Korean value (e.g. 서울)
                } catch (IllegalArgumentException e) {
                    // Ignore
                }
            }
            specs.add(ModelSpecification.hasRegions(mappedRegions));
        }
        // 5. 일반 태그 (tags) - ModelTag 엔티티 기반
        if (tags != null && !tags.isEmpty()) {
            specs.add(ModelSpecification.hasTags(tags));
        }
        // 6. 키 (height)
        if (height != null && !height.isBlank()) {
            switch (height) {
                case "under-160":
                    specs.add(ModelSpecification.heightLessThan(160));
                    break;
                case "160-170":
                    specs.add(ModelSpecification.heightBetween(160, 169)); // 170 미만으로 처리
                    break;
                case "170-180":
                    specs.add(ModelSpecification.heightBetween(170, 179)); // 180 미만으로 처리
                    break;
                case "over-180":
                    specs.add(ModelSpecification.heightGreaterThanEqual(180));
                    break;
            }
        }

        Specification<Model> finalSpec = Specification.allOf(specs);
        Sort sortObj;
        if ("RATING".equalsIgnoreCase(sortType)) {
            sortObj = Sort.by(Sort.Direction.DESC, "avgRating");
        } else if ("RECOMMENDED".equalsIgnoreCase(sortType)) {
            sortObj = Sort.by(Sort.Direction.DESC, "avgRating").and(Sort.by(Sort.Direction.DESC, "reviewCount"));
        } else {
            sortObj = Sort.by(Sort.Direction.DESC, "createdDate");
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);

        return modelRepository.findAll(finalSpec, pageable);

    }

    public Model findById(Long id) {
        return modelRepository.findById(id).get();
    }

    public Model findByUserId(Long userId) {
        return modelRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저의 모델 프로필이 존재하지 않습니다."));
    }

    public Model create(
            User user, String name, int height,
            int weight, Sex sex, int age) {
        Model model = Model.create(user, name, height, weight, sex, age);
        Model savedModel = modelRepository.save(model);

        // MVP: User.region을 초기 model_region으로 1개 복사
        toRegion(user.getRegion()).ifPresent(regionEnum -> {
            ModelRegion modelRegion = new ModelRegion();
            modelRegion.setModel(savedModel);
            modelRegion.setRegion(regionEnum);
            savedModel.getModelRegions().add(modelRegion);
        });

        requestModelEmbeddingRefresh(savedModel.getId());
        return savedModel;
    }

    public void update(
            Model model,
            String name,
            int height,
            int weight,
            Sex sex,
            int age,
            List<String> categories,
            List<String> tags,
            String introduction,
            String region,
            String profileImageUrl,
            java.time.LocalDate careerStartDate,
            List<String> activeRegions) {
        model.update(name, height, weight, sex, age, introduction, profileImageUrl, careerStartDate);
        if (region != null && !region.isBlank()) {
            model.getUser().updateRegion(region);
        }

        // 2. 활동 지역(ModelRegion) 업데이트
        model.getModelRegions().clear();
        List<String> regionNames = activeRegions;
        if ((regionNames == null || regionNames.isEmpty()) && region != null && !region.isBlank()) {
            regionNames = List.of(region);
        }
        if (regionNames != null) {
            for (String regionName : regionNames) {
                Optional<Region> regionEnum = toRegion(regionName);
                if (regionEnum.isPresent()) {
                    ModelRegion modelRegion = new ModelRegion();
                    modelRegion.setModel(model);
                    modelRegion.setRegion(regionEnum.get());
                    model.getModelRegions().add(modelRegion);
                } else {
                    System.err.println("지원하지 않는 지역: " + regionName);
                }
            }
        }
        // 2. 태그(Tag) 처리 (ModelTag)
        model.getModelTags().clear(); // 기존 태그 매핑 싹 비우기
        if (tags != null) {
            for (String tagName : tags) {

                // 태그 없으면 새로 생성
                Tag tag = tagRepository.findByName(tagName).orElseGet(() -> {
                    Tag newTag = new Tag();
                    newTag.setName(tagName);
                    return tagRepository.save(newTag);
                });
                // 모델 테그 맵핑
                ModelTag modelTag = new ModelTag();
                modelTag.setModel(model);
                modelTag.setTag(tag);
                model.getModelTags().add(modelTag);
            }
        }
        // 3. 카테고리 처리 (ModelCategory)
        model.getModelCategories().clear(); // 기존 카테고리 매핑 싹 비우기
        if (categories != null) {
            for (String catName : categories) {
                try {
                    // 프론트에서 온 영문자 카테고리를 Enum으로 안전하게 변환
                    Category categoryEnum = Category.valueOf(catName.toUpperCase());

                    ModelCategory modelCategory = new ModelCategory();
                    modelCategory.setModel(model);
                    modelCategory.setCategory(categoryEnum);
                    model.getModelCategories().add(modelCategory);
                } catch (IllegalArgumentException e) {
                    System.err.println("지원하지 않는 카테고리: " + catName);
                }
            }
        }
        requestModelEmbeddingRefresh(model.getId());
    }

    public void delete(Model model) {
        modelRepository.delete(model);
    }

    private void requestModelEmbeddingRefresh(Long modelId) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    refreshModelEmbedding(modelId);
                }
            });
            return;
        }
        refreshModelEmbedding(modelId);
    }

    private void refreshModelEmbedding(Long modelId) {
        try {
            aiRecommendService.upsertModelEmbedding(modelId);
        } catch (RuntimeException error) {
            log.warn("Model embedding refresh failed. modelId={}", modelId, error);
        }
    }

    private Optional<Region> toRegion(String regionName) {
        if (regionName == null || regionName.isBlank()) {
            return Optional.empty();
        }
        for (Region region : Region.values()) {
            if (region.name().equalsIgnoreCase(regionName)
                    || region.getDisplayName().equals(regionName)) {
                return Optional.of(region);
            }
        }
        return Optional.empty();
    }
}
