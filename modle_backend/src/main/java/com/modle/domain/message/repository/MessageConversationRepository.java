package com.modle.domain.message.repository;

import com.modle.domain.message.entity.MessageConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageConversationRepository extends JpaRepository<MessageConversation, Long> {

    List<MessageConversation> findByClientIdOrModelIdOrderByCreatedDateDesc(
            Long clientId,
            Long modelId
    );
}
