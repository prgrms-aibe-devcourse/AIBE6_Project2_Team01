package com.modle.domain.message.repository;

import com.modle.domain.message.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationIdOrderByCreatedAtDesc(
            Long conversationId,
            Pageable pageable
    );

    Optional<Message> findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);

    long countByConversationIdAndReceiverIdAndReadFalse(Long conversationId, Long receiverId);

    List<Message> findByConversationIdAndReceiverIdAndReadFalse(
            Long conversationId,
            Long receiverId
    );

    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
}
