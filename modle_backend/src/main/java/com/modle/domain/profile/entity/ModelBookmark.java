package com.modle.domain.profile.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "model_bookmark",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_bookmark_client_model",
                        columnNames = {"client_id", "model_id"}
                )
        }
)
@Getter
@NoArgsConstructor
public class ModelBookmark extends BaseEntity {
    @Column(nullable = false)
    private Long clientId;

    @Column(nullable = false)
    private Long modelId;

    public static ModelBookmark create(Long clientId, Long modelId) {
        ModelBookmark bookmark = new ModelBookmark();
        bookmark.clientId = clientId;
        bookmark.modelId = modelId;
        return bookmark;
    }
}
