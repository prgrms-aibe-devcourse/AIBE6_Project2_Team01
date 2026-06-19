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

    @Column(length = 500)
    private String holdReason;

    @Column(length = 500)
    private String cancelReason;

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

    public void contact() {
        this.status = ApplicationStatus.CONTACTED;
    }

    public void markContractSent() {
        this.status = ApplicationStatus.CONTRACT_SENT;
    }

    public void revertToContacted() {
        this.status = ApplicationStatus.CONTACTED;
    }

    public void shoot() {
        this.status = ApplicationStatus.SHOOTING;
    }

    public void complete() {
        this.status = ApplicationStatus.COMPLETED;
    }

    public void hold(String reason) {
        this.status = ApplicationStatus.ON_HOLD;
        this.holdReason = reason;
    }

    public void cancelShooting(String reason) {
        this.status = ApplicationStatus.SHOOTING_CANCELLED;
        this.cancelReason = reason;
    }

    public void resume() {
        this.status = ApplicationStatus.SHOOTING;
    }

    public void closeForReRecruit() {
        this.status = ApplicationStatus.SHOOTING_CANCELLED;
    }
}
