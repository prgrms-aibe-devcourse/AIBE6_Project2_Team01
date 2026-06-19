package com.modle.domain.jobposting.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(
        name = "model_embedding",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_model_embedding_model",
                columnNames = "model_id"
        )
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ModelEmbedding extends BaseEntity {

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(nullable = false, columnDefinition = "JSON")
    private String embedding;

    @Column(name = "source_hash", length = 64)
    private String sourceHash;

    @Column(name = "embedding_model", length = 50)
    private String embeddingModel;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public static ModelEmbedding create(
            Long modelId,
            String embedding,
            String sourceHash,
            String embeddingModel
    ) {
        ModelEmbedding modelEmbedding = new ModelEmbedding();
        modelEmbedding.modelId = modelId;
        modelEmbedding.update(embedding, sourceHash, embeddingModel);
        return modelEmbedding;
    }

    public void update(String embedding, String sourceHash, String embeddingModel) {
        this.embedding = embedding;
        this.sourceHash = sourceHash;
        this.embeddingModel = embeddingModel;
        this.updatedAt = LocalDateTime.now();
    }
}
