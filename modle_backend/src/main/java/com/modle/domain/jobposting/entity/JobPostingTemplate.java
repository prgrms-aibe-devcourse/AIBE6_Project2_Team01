package com.modle.domain.jobposting.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "job_posting_template")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobPostingTemplate extends BaseEntity {
    // 카테고리 식별 키
    @Column(nullable = false)
    private String category;

    // 템플릿 제목
    @Column(nullable = false)
    private String title;

    // 템플릿 본문
    @Lob
    @Column(nullable = false)
    private String content;

    @Builder
    private JobPostingTemplate(String category, String title, String content) {
        this.category = category;
        this.title = title;
        this.content = content;
    }
}
