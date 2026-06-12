package com.modle.domain.admin.service;

import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.UserStatus;
import com.modle.domain.user.repository.ClientRepository;
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

        user.updateStatus(UserStatus.REJECTED);
        mailService.sendRejectionEmail(user.getEmail(), reason);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
