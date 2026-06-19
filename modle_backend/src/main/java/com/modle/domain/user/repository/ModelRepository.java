package com.modle.domain.user.repository;

import com.modle.domain.user.entity.Model;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelRepository extends JpaRepository<Model,Long>, JpaSpecificationExecutor<Model> {
    @EntityGraph(attributePaths = {"user"})
    Optional<Model> findByUserId(Long userId);

    @Query(value = """
            SELECT DISTINCT m.*
            FROM model m
            JOIN `user` u ON u.id = m.user_id
            JOIN model_region mr ON mr.model_id = m.id
            JOIN model_category mc ON mc.model_id = m.id
            WHERE u.status = 'ACTIVE'
              AND (:sex IS NULL OR m.sex = :sex)
              AND (:ageMin IS NULL OR m.age >= :ageMin)
              AND (:ageMax IS NULL OR m.age <= :ageMax)
              AND (:heightMin IS NULL OR m.height >= :heightMin)
              AND (:heightMax IS NULL OR m.height <= :heightMax)
              AND (:weightMin IS NULL OR m.weight >= :weightMin)
              AND (:weightMax IS NULL OR m.weight <= :weightMax)
              AND (
                    :minCareerMonths IS NULL
                    OR :minCareerMonths <= 0
                    OR (
                        m.career_start_date IS NOT NULL
                        AND TIMESTAMPDIFF(MONTH, m.career_start_date, CURRENT_DATE) >= :minCareerMonths
                    )
                  )
              AND mr.region = :region
              AND mc.category = :category
            """, nativeQuery = true)
    List<Model> findRecommendationCandidates(
            @Param("sex") String sex,
            @Param("ageMin") Integer ageMin,
            @Param("ageMax") Integer ageMax,
            @Param("heightMin") Integer heightMin,
            @Param("heightMax") Integer heightMax,
            @Param("weightMin") Integer weightMin,
            @Param("weightMax") Integer weightMax,
            @Param("minCareerMonths") Integer minCareerMonths,
            @Param("region") String region,
            @Param("category") String category
    );
}
