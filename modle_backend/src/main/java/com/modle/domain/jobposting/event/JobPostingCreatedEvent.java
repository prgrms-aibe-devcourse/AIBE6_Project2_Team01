package com.modle.domain.jobposting.event;

/**
 * 공고 등록 완료 이벤트 (JOB-002).
 *
 * AGENTS.md에서 프로젝트 전체 중 유일하게 허용된 비동기 트리거 지점:
 * 공고 등록 → AI 분석. 이 외 위치에 이벤트/@Async 도입 금지.
 */
public record JobPostingCreatedEvent(Long jobPostingId) {
}
