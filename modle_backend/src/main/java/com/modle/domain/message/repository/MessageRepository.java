package com.modle.domain.message.repository;

import com.modle.domain.message.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationIdInOrderByCreatedAtDesc(
            List<Long> conversationIds,
            Pageable pageable
    );

    List<Message> findByConversationIdAndReceiverIdAndReadFalse(
            Long conversationId,
            Long receiverId
    );
}
