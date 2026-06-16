package com.modle.domain.user.repository;
import com.modle.domain.profile.entity.ModelCategory;
import com.modle.domain.profile.entity.ModelTag;
import com.modle.domain.profile.entity.Tag;
import com.modle.domain.profile.entity.type.Category;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;


public class ModelSpecification {
    // 검색어 (이름에 포함되어 있는지)
    public static Specification<Model> nameContains(String query) {
        return (root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.like(root.get("name"), "%" + query + "%");
    }
    // 성별 필터
    public static Specification<Model> sexEquals(com.modle.domain.user.entity.type.Sex sex) {
        return (root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("sex"), sex);
    }

    // 예: 최소 키 필터
    public static Specification<Model> heightGreaterThanEqual(int minHeight) {
        return (root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("height"), minHeight);
    }
    // 카테고리 다중 필터 (선택한 카테고리 중 하나라도 일치하면 검색 - OR 조건)
    public static Specification<Model> hasCategories(List<Category> categories) {
        return (root, query, criteriaBuilder) -> {
            query.distinct(true); // 중복 결과 방지
            Join<Model, ModelCategory> categoryJoin = root.join("modelCategories", JoinType.INNER);
            return categoryJoin.get("category").in(categories);
        };
    }
    // 지역 다중 필터 (선택한 지역 중 하나라도 일치하면 검색 - OR 조건)
    public static Specification<Model> hasRegions(List<String> regions) {
        return (root, query, criteriaBuilder) -> {
            // Model과 User 엔티티 Join
            Join<Model, User> userJoin = root.join("user", JoinType.INNER);
            // User의 region 속성이 전달된 리스트(regions) 안에 포함되는지 검사
            return userJoin.get("region").in(regions);
        };
    }
    // 태그 다중 필터
    public static Specification<Model> hasTags(List<String> tagNames) {
        return (root, query, criteriaBuilder) -> {
            query.distinct(true);
            Join<Model, ModelTag> modelTagJoin = root.join("modelTags", JoinType.INNER);
            Join<ModelTag, Tag> tagJoin = modelTagJoin.join("tag", JoinType.INNER);
            return tagJoin.get("name").in(tagNames);
        };
    }
}


