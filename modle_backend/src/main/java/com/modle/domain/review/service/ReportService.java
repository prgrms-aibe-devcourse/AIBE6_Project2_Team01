package com.modle.domain.review.service;

import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.message.repository.MessageRepository;
import com.modle.domain.review.dto.request.CreateReportRequest;
import com.modle.domain.review.dto.request.HandleReportRequest;
import com.modle.domain.review.dto.response.ReportResponse;
import com.modle.domain.review.entity.Report;
import com.modle.domain.review.entity.type.ReportStatus;
import com.modle.domain.review.entity.type.ReportTargetType;
import com.modle.domain.review.repository.ReportRepository;
import com.modle.domain.review.service.reportValidator.ReportTargetValidator;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.repository.UserRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.infra.mail.MailService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final JobPostingRepository jobPostingRepository;
    private final MessageRepository messageRepository;
    private final MailService mailService;
    private final List<ReportTargetValidator> validators;

    private Map<ReportTargetType, ReportTargetValidator> validatorMap;

    @PostConstruct
    private void initValidatorMap() {
        this.validatorMap = validators.stream()
                .collect(Collectors.toMap(
                        ReportTargetValidator::getTargetType,
                        Function.identity()
                ));
    }

    // 신고 접수
    @Transactional
    public ReportResponse createReport(Long reporterId, CreateReportRequest request) {
        // 중복 신고 체크
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
                reporterId, request.targetType(), request.targetId())) {
            throw new CustomException(ErrorCode.REPORT_ALREADY_EXISTS);
        }

        // targetType별 검증 (존재 여부, 자기 자신 신고 등)
        ReportTargetValidator validator = validatorMap.get(request.targetType());
        if (validator == null) {
            throw new CustomException(ErrorCode.REPORT_TARGET_NOT_FOUND);
        }
        validator.validate(request.targetId(), reporterId);

        Report report = Report.create(
                reporterId,
                request.targetType(),
                request.targetId(),
                request.reason(),
                request.description()
        );
        return ReportResponse.from(reportRepository.save(report));
    }

    // 관리자 신고 목록 조회
    public Page<ReportResponse> getReports(
            ReportTargetType targetType, ReportStatus status, Pageable pageable) {
        Page<Report> reports;

        if (targetType != null && status != null) {
            reports = reportRepository.findByTargetTypeAndStatus(targetType, status, pageable);
        } else if (targetType != null) {
            reports = reportRepository.findByTargetType(targetType, pageable);
        } else if (status != null) {
            reports = reportRepository.findByStatus(status, pageable);
        } else {
            reports = reportRepository.findAll(pageable);
        }

        return reports.map(ReportResponse::from);
    }

    // 관리자 신고 처리 (수락/거절)
    @Transactional
    public ReportResponse handleReport(Long reportId, HandleReportRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(ErrorCode.REPORT_NOT_FOUND));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        if (request.accepted()) {
            // 수락 → 피신고자 warningCount 증가 + 메일
            handleAccepted(report);
        } else {
            // 거절 → 신고자에게 거절 사유 메일
            handleDismissed(report, request.dismissReason());
        }

        return ReportResponse.from(report);
    }

    private void handleAccepted(Report report) {
        report.action();

        Long targetUserId = switch (report.getTargetType()) {
            case PROFILE -> report.getTargetId();

            case JOB_POSTING -> {
                var posting = jobPostingRepository.findById(report.getTargetId())
                        .orElseThrow(() -> new CustomException(ErrorCode.REPORT_TARGET_NOT_FOUND));
                yield posting.getClientId();
            }

            case MESSAGE -> {
                var message = messageRepository.findById(report.getTargetId())
                        .orElseThrow(() -> new CustomException(ErrorCode.REPORT_TARGET_NOT_FOUND));
                yield message.getSenderId();
            }
        };

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        target.increaseWarningCount();
        mailService.sendReportActionedEmail(target.getEmail());
    }

    private void handleDismissed(Report report, String dismissReason) {
        if (dismissReason == null || dismissReason.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST);
        }
        report.dismiss(dismissReason);

        // 신고자에게 거절 사유 메일
        User reporter = userRepository.findById(report.getReporterId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        mailService.sendReportDismissedEmail(reporter.getEmail(), dismissReason);
    }
}
