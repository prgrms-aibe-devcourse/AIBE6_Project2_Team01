package com.modle.domain.profile.repository;

import com.modle.domain.profile.entity.Career;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CareerRepository extends JpaRepository<Career, Long> {
    // 모델 전체 경력 (마이페이지)
    List<Career> findByModelIdOrderByCompletedDateDesc(Long modelId);

    // 모델 공개 경력 (프로필 노출용)
    List<Career> findByModelIdAndIsPublicTrueOrderByCompletedDateDesc(Long modelId);
}
