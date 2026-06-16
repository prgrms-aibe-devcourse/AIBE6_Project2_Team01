package com.modle.domain.review.repository;

import com.modle.domain.review.entity.Report;
import com.modle.domain.review.entity.type.ReportStatus;
import com.modle.domain.review.entity.type.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {
    // 중복 신고 방지용
    boolean existsByReporterIdAndTargetTypeAndTargetId(
            Long reporterId, ReportTargetType targetType, Long targetId);

    // 관리자 신고 목록 조회용 필터
    Page<Report> findAll(Pageable pageable);
    Page<Report> findByTargetType(ReportTargetType targetType, Pageable pageable);
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    Page<Report> findByTargetTypeAndStatus(ReportTargetType targetType, ReportStatus status, Pageable pageable);
}
