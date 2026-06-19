package com.modle.domain.profile.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "career")
@Getter
@NoArgsConstructor
public class Career extends BaseEntity {
    @Column(nullable = false)
    private Long modelId;

    // 공고 삭제돼도 경력 유지 — FK 제약 없이 Long으로만 보관
    @Column
    private Long jobPostingId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String region;

    @Column
    private LocalDateTime shootDate;

    @Column
    private LocalDateTime completedDate;

    @Column(nullable = false)
    private boolean isPublic = true;   // 모델이 공개 여부 선택 (기본 공개)

    public static Career createFromJobPosting(
            Long modelId,
            Long jobPostingId,
            String title,
            String category,
            String region,
            LocalDateTime shootDate,
            LocalDateTime completedAt
    ) {
        Career career = new Career();
        career.modelId = modelId;
        career.jobPostingId = jobPostingId;
        career.title = title;
        career.category = category;
        career.region = region;
        career.shootDate = shootDate;
        career.completedDate = completedAt;
        career.isPublic = true;
        return career;
    }

    public void togglePublic() {
        this.isPublic = !this.isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
}
