package com.modle.domain.profile.repository;

import com.modle.domain.profile.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    // 모델 ID를 기준으로 해당 모델의 포트폴리오 사진들을 모두 가져오는 메서드
    List<Portfolio> findByModelId(Long modelId);
}
