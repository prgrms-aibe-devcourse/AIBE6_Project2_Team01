package com.modle.domain.application.repository;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // MATCH-001: 취소된 지원을 제외하고 동일 공고·동일 모델의 지원 여부 확인 (중복 지원 검증)
    boolean existsByJobPostingIdAndModelIdAndStatusNot(
            Long jobPostingId,
            Long modelId,
            ApplicationStatus status
    );

    // MATCH-002: 취소 시 본인 지원 여부 확인
    Optional<Application> findByIdAndModelId(Long id, Long modelId);
}
