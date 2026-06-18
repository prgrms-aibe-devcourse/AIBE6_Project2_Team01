package com.modle.domain.jobposting.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "job_posting_bookmark",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_bookmark_model_job",
                        columnNames = {"model_id", "job_posting_id"}
                )
        }
)
@Getter
@NoArgsConstructor
public class JobPostingBookmark extends BaseEntity {
    @Column(nullable = false)
    private Long modelId;

    @Column(nullable = false)
    private Long jobPostingId;

    public static JobPostingBookmark create(Long modelId, Long jobPostingId) {
        JobPostingBookmark bookmark = new JobPostingBookmark();
        bookmark.modelId = modelId;
        bookmark.jobPostingId = jobPostingId;
        return bookmark;
    }
}
