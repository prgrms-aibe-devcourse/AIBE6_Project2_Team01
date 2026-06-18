package com.modle.domain.review.entity;

import com.modle.domain.review.entity.type.ReportReason;
import com.modle.domain.review.entity.type.ReportStatus;
import com.modle.domain.review.entity.type.ReportTargetType;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "report",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_report_reporter_target",
                        columnNames = {"reporter_id", "target_type", "target_id"}
                )
        }
)
@Getter
@NoArgsConstructor
public class Report extends BaseEntity {
    @Column(nullable = false)
    private Long reporterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportTargetType targetType;

    @Column(nullable = false)
    private Long targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportReason reason;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    // 거절 사유 (DISMISSED 시 입력)
    @Column(length = 500)
    private String dismissReason;

    public static Report create(Long reporterId, ReportTargetType targetType,
                                Long targetId, ReportReason reason, String description) {
        Report report = new Report();
        report.reporterId = reporterId;
        report.targetType = targetType;
        report.targetId = targetId;
        report.reason = reason;
        report.description = description;
        report.status = ReportStatus.PENDING;
        return report;
    }

    public void action() {
        this.status = ReportStatus.ACTIONED;
    }

    public void dismiss(String dismissReason) {
        this.status = ReportStatus.DISMISSED;
        this.dismissReason = dismissReason;
    }
}
