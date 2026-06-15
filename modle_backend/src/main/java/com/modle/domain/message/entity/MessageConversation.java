package com.modle.domain.message.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(
        name = "message_conversation",
        indexes = {
                @Index(name = "idx_conversation_client", columnList = "client_id"),
                @Index(name = "idx_conversation_model", columnList = "model_id")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MessageConversation extends BaseEntity {

    @Column(nullable = false)
    private Long clientId;

    @Column(nullable = false)
    private Long modelId;

    private Long postId;

    private Long applicationId;

    @Builder
    private MessageConversation(Long clientId, Long modelId, Long postId, Long applicationId) {
        this.clientId = clientId;
        this.modelId = modelId;
        this.postId = postId;
        this.applicationId = applicationId;
    }

    public boolean contains(Long userId) {
        return clientId.equals(userId) || modelId.equals(userId);
    }

    public Long otherParticipantId(Long userId) {
        return clientId.equals(userId) ? modelId : clientId;
    }
}
