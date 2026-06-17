package com.modle.domain.application.entity;

import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "application")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Application extends BaseEntity {

    @Column(nullable = false)
    private Long jobPostingId;

    @Column(nullable = false)
    private Long modelId;

    @Column(length = 500)
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Builder
    private Application(Long jobPostingId, Long modelId, String coverLetter, ApplicationStatus status) {
        this.jobPostingId = jobPostingId;
        this.modelId = modelId;
        this.coverLetter = coverLetter;
        this.status = status;
    }

    public void cancel() {
        this.status = ApplicationStatus.APPLICATION_CANCELLED;
    }
}
