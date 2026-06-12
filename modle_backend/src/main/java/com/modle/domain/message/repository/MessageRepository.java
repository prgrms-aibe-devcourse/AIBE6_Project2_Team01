package com.modle.domain.message.repository;

import com.modle.domain.message.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
