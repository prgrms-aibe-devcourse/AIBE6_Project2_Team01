package com.modle.domain.profile.service;

import com.modle.domain.profile.entity.ModelCategory;
import com.modle.domain.profile.entity.ModelTag;
import com.modle.domain.profile.entity.Tag;
import com.modle.domain.profile.entity.type.Category;
import com.modle.domain.profile.repository.TagRepository;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.repository.ModelSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ModelService {
    private final ModelRepository modelRepository;
    private final TagRepository tagRepository;

    public long count(){
        return modelRepository.count();
    }

    public List<Model> getList(String query, Boolean gender, List<Category> categories, List<String> regions, List<String> tags) {
        List<Specification<Model>> specs = new ArrayList<>();
        // 1. 이름 검색 (query)
        if (query != null && !query.trim().isEmpty()) {
            specs.add(ModelSpecification.nameContains(query));
        }
        // 2. 성별 (gender)
        if (gender != null) {
            specs.add(ModelSpecification.genderEquals(gender));
        }
        // 3. 카테고리 (categories)
        if (categories != null && !categories.isEmpty()) {
            specs.add(ModelSpecification.hasCategories(categories));
        }
        // 4. 지역 (regions) - User 엔티티 기반
        if (regions != null && !regions.isEmpty()) {
            specs.add(ModelSpecification.hasRegions(regions));
        }
        // 5. 일반 태그 (tags) - ModelTag 엔티티 기반
        if (tags != null && !tags.isEmpty()) {
            specs.add(ModelSpecification.hasTags(tags));
        }
        Specification<Model> finalSpec = Specification.allOf(specs);
        return modelRepository.findAll(finalSpec);
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
            int weight, boolean gender, int age
    ){
        Model model = Model.create(user, name, height, weight, gender, age);
        return modelRepository.save(model);
    }

    public void update(
            Model model,
            String name,
            int height,
            int weight,
            boolean gender,
            int age,
            List<String> categories,
            List<String> tags,
            String introduction,
            String region,
            String profileImageUrl
        ) {
        model.update(name, height, weight, gender, age, introduction, profileImageUrl);
        model.getUser().updateRegion(region);
        // 2. 태그(Tag) 처리 (ModelTag)
        model.getModelTags().clear(); // 기존 태그 매핑 싹 비우기
        if (tags != null) {
            for (String tagName : tags) {

                //태그 없으면 새로 생성
                Tag tag = tagRepository.findByName(tagName).orElseGet(() -> {
                    Tag newTag = new Tag();
                    newTag.setName(tagName);
                    return tagRepository.save(newTag);
                });
                //모델 테그 맵핑
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
    }

    public void delete(Model model) {
        modelRepository.delete(model);
    }
}

