package com.modle.domain.message.repository;

import com.modle.domain.message.entity.MessageConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageConversationRepository extends JpaRepository<MessageConversation, Long> {

    List<MessageConversation> findByClientIdOrModelIdOrderByCreatedDateDesc(
            Long clientId,
            Long modelId
    );

    // 동일 클라이언트·모델·공고 조합의 대화방 중복 생성 방지를 위한 조회
    Optional<MessageConversation> findFirstByClientIdAndModelIdAndPostIdOrderByCreatedDateDesc(
            Long clientId,
            Long modelId,
            Long postId
    );
}
