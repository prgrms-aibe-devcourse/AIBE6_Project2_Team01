package com.modle.domain.jobposting.entity;

// TODO(골격): BaseEntity의 실제 패키지는 골격 담당이 확정한 위치를 따른다. 머지 후 import 정렬.
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "job_posting")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobPosting extends BaseEntity {

    // TODO(인증/회원): user 도메인 확정 후 연관관계 검토. 현재는 작성자 식별자만 보관 (가정)
    @Column(nullable = false)
    private Long clientId;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    // 카테고리. 시트 확정 시 profile 도메인 Category 연계 여부 결정 (열린 질문)
    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String region;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobPostingStatus status;

    @Builder
    private JobPosting(Long clientId, String title, String content, String category, String region, JobPostingStatus status) {
        this.clientId = clientId;
        this.title = title;
        this.content = content;
        this.category = category;
        this.region = region;
        this.status = status;
    }

    public void update(String title, String content, String category, String region) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.region = region;
    }
}
