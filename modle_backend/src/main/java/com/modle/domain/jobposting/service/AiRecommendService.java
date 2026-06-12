package com.modle.domain.jobposting.service;

import com.modle.domain.jobposting.event.JobPostingCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
@RequiredArgsConstructor
public class AiRecommendService {

    // TODO(AI 추천 단위): infra/ai/ClaudeApiClient 연동
    // private final ClaudeApiClient claudeApiClient;

    /**
     * 공고 등록 완료 후 AI 모델 추천을 수행한다.
     *
     * AFTER_COMMIT으로 공고 저장 트랜잭션 커밋 이후 실행하고, @Async로 별도 스레드에서 처리해
     * 수 초가 걸리는 AI 호출이 공고 등록 응답을 지연시키지 않게 한다.
     *
     * 주의: @Async 활성화(@EnableAsync)는 global/config 골격에서 설정되어야 한다. (열린 질문)
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onJobPostingCreated(JobPostingCreatedEvent event) {
        // TODO(AI 추천 단위): ClaudeApiClient로 공고 분석 → 모델 추천 결과 생성/저장
    }
}
