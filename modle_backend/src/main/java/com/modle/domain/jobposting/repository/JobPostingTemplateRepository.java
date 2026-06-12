package com.modle.domain.jobposting.repository;

import com.modle.domain.jobposting.entity.JobPostingTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 참고(열린 질문): AGENTS.md 도메인 상세의 repository 목록에는 JobPostingTemplateRepository가
// 명시돼 있지 않다. 다만 JobPostingTemplate은 엔티티로 명시돼 있고 JOB-001이 DB 조회를 요구하므로
// 표준 Spring Data 리포지토리로 둔다. 템플릿이 정적 시드/설정으로 결정되면 교체.
public interface JobPostingTemplateRepository extends JpaRepository<JobPostingTemplate, Long> {

    // JOB-001: 카테고리별 템플릿 목록
    List<JobPostingTemplate> findByCategory(String category);
}
