package com.modle.domain.admin.service;

import com.modle.domain.admin.dto.response.NoShowReportResponse;
import com.modle.domain.application.entity.Application;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.review.entity.type.ReportStatus;
import com.modle.domain.review.entity.type.ReportTargetType;
import com.modle.domain.review.repository.ReportRepository;
import com.modle.domain.user.dto.UserDto;
import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.UserStatus;
import com.modle.domain.user.repository.ClientRepository;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.repository.UserRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.infra.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final MailService mailService;
    private final ReportRepository reportRepository;
    private final ApplicationRepository applicationRepository;
    private final ModelRepository modelRepository;

    // 승인 대기 중인 의뢰인 목록 조회
    @Transactional(readOnly = true)
    public List<Client> getPendingClients() {
        return clientRepository.findByUser_Status(UserStatus.PENDING);
    }

    // 의뢰인 승인 처리
    @Transactional
    public void approveClient(Long userId) {
        User user = findUser(userId);

        if (user.getStatus() != UserStatus.PENDING) {
           throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        user.updateStatus(UserStatus.ACTIVE);
        mailService.sendApprovalEmail(user.getEmail());
    }

    // 의뢰인 반려 처리
    @Transactional
    public void rejectClient(Long userId, String reason) {
        User user = findUser(userId);

        if (user.getStatus() != UserStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        user.reject(reason);
        mailService.sendRejectionEmail(user.getEmail(), reason);
    }

    // N번 이상 경고를 받은 계정 목록
    public List<UserDto> getUsersByWarningCount(int minWarningCount) {
        return userRepository
                .findByWarningCountGreaterThanEqualOrderByWarningCountDesc(minWarningCount)
                .stream()
                .map(UserDto::new)
                .toList();
    }

    // 노쇼 신고 PENDING 목록
    public List<NoShowReportResponse> getPendingNoShowReports() {
        return reportRepository.findByTargetTypeAndStatusOrderByCreatedDateDesc(
                        ReportTargetType.NO_SHOW, ReportStatus.PENDING)
                .stream()
                .map(report -> {
                    Application application = applicationRepository.findById(report.getTargetId())
                            .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));
                    Model model = modelRepository.findById(application.getModelId())
                            .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));
                    User modelUser = userRepository.findById(model.getUser().getId())
                            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

                    return new NoShowReportResponse(
                            report.getId(),
                            application.getId(),
                            modelUser.getId(),
                            model.getName(),
                            modelUser.getWarningCount(),
                            report.getCreatedDate()
                    );
                })
                .toList();
    }

    @Transactional
    public UserDto suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        user.suspend();
        mailService.sendSuspendEmail(user.getEmail());
        return new UserDto(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
