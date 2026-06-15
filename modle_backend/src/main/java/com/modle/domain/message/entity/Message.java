package com.modle.domain.message.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(
        name = "message",
        indexes = {
                @Index(name = "idx_message_conversation_created", columnList = "conversation_id, created_at"),
                @Index(name = "idx_message_sender_created", columnList = "sender_id, created_at"),
                @Index(name = "idx_message_receiver_created", columnList = "receiver_id, created_at"),
                @Index(name = "idx_message_receiver_read", columnList = "receiver_id, is_read")
        }
)
@Getter
@NoArgsConstructor(access = PROTECTED)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long conversationId;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private Long receiverId;

    private Long parentMessageId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('USER','SYSTEM')")
    private SenderType senderType;

    @Column(name = "is_read", nullable = false, columnDefinition = "TINYINT(1)")
    private boolean read;

    @Column(columnDefinition = "DATETIME")
    private OffsetDateTime readAt;

    @Column(nullable = false, updatable = false, columnDefinition = "DATETIME")
    private OffsetDateTime createdAt;

    @Builder
    private Message(
            Long senderId,
            Long receiverId,
            Long conversationId,
            Long parentMessageId,
            String content,
            SenderType senderType
    ) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.conversationId = conversationId;
        this.parentMessageId = parentMessageId;
        this.content = content;
        this.senderType = senderType;
        this.read = false;
    }

    @PrePersist
    private void setCreatedAt() {
        createdAt = OffsetDateTime.now();
    }

    public void markAsRead() {
        read = true;
        readAt = OffsetDateTime.now();
    }
}
