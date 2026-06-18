package com.modle.domain.jobposting.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(
        name = "post_embedding",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_post_embedding_post",
                columnNames = "post_id"
        )
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostEmbedding extends BaseEntity {

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Lob
    @Column(nullable = false, columnDefinition = "JSON")
    private String embedding;

    @Column(name = "source_hash", length = 64)
    private String sourceHash;

    @Column(name = "embedding_model", length = 50)
    private String embeddingModel;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public static PostEmbedding create(
            Long postId,
            String embedding,
            String sourceHash,
            String embeddingModel
    ) {
        PostEmbedding postEmbedding = new PostEmbedding();
        postEmbedding.postId = postId;
        postEmbedding.update(embedding, sourceHash, embeddingModel);
        return postEmbedding;
    }

    public void update(String embedding, String sourceHash, String embeddingModel) {
        this.embedding = embedding;
        this.sourceHash = sourceHash;
        this.embeddingModel = embeddingModel;
        this.updatedAt = LocalDateTime.now();
    }
}
