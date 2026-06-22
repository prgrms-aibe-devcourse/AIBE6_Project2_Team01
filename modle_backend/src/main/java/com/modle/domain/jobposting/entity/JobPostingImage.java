package com.modle.domain.jobposting.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "job_posting_image")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobPostingImage extends BaseEntity {

    @Column(nullable = false)
    private Long jobPostingId;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private int displayOrder;

    public JobPostingImage(Long jobPostingId, String imageUrl, int displayOrder) {
        this.jobPostingId = jobPostingId;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
    }
}
