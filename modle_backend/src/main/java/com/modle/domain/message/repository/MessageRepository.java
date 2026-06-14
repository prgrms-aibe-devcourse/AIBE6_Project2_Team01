package com.modle.domain.message.repository;

import com.modle.domain.message.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findBySenderIdOrReceiverIdOrderByCreatedAtDesc(
            Long senderId,
            Long receiverId,
            Pageable pageable
    );

    Page<Message> findByReceiverIdAndReadOrderByCreatedAtDesc(
            Long receiverId,
            boolean read,
            Pageable pageable
    );

    @Query("""
            SELECT m FROM Message m
            WHERE m.receiverId = :receiverId
              AND m.senderId = :participantId
              AND m.read = false
              AND ((:applicationId IS NULL AND m.applicationId IS NULL) OR m.applicationId = :applicationId)
              AND ((:postId IS NULL AND m.postId IS NULL) OR m.postId = :postId)
            """)
    List<Message> findUnreadConversationMessages(
            @Param("receiverId") Long receiverId,
            @Param("participantId") Long participantId,
            @Param("applicationId") Long applicationId,
            @Param("postId") Long postId
    );
}
