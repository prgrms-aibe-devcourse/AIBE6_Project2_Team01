package com.modle.domain.contract.service;

import com.modle.domain.application.entity.Application;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractStatus;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.domain.message.dto.response.MessageConversationResponse;
import com.modle.domain.message.service.MessageService;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.service.UserService;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.infra.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ContractNotificationService {
    private final MessageService messageService;
    private final MailService mailService;
    private final UserService userService;
    private final ModelRepository modelRepository;
    private final JobPostingService jobPostingService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    private String createContractLink(Contract contract, ContractStatus status, String postTitle) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(frontendBaseUrl)
                .path("/contracts/{id}")
                .queryParam("applicationId", contract.getApplicationId())
                .queryParam("contractType", contract.getContractType())
                .queryParam("payType", contract.getPayType())
                .queryParam("payment", contract.getPayment())
                .queryParam("shootDate", contract.getShootStartAt().toLocalDate())
                .queryParam("shootStartTime", formatContractLinkTime(contract.getShootStartAt()))
                .queryParam("shootEndTime", formatContractLinkTime(contract.getShootEndAt()))
                .queryParam("location", contract.getLocation())
                .queryParam("usageScope", contract.getUsageScope())
                .queryParam("status", status.name());

        if (postTitle != null && !postTitle.isBlank()) {
            builder.queryParam("postTitle", postTitle);
        }

        if (contract.getMemo() != null && !contract.getMemo().isBlank()) {
            builder.queryParam("memo", contract.getMemo());
        }

        return builder.encode().buildAndExpand(contract.getId()).toUriString();
    }

    private String formatContractLinkTime(LocalDateTime dateTime) {
        return dateTime.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private String createContractNotificationMessage(String contractLink) {
        return """
                계약서가 도착했습니다. 아래 링크에서 확인해 주세요.
                %s
                """.formatted(contractLink);
    }

    void sendContractConfirmedNotifications(Contract contract, Application application) {
        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        User modelUser = userService.findById(model.getUser().getId());
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());
        User clientUser = userService.findById(jobPosting.clientId());

        String contractLink = createContractLink(contract, contract.getStatus(), jobPosting.title());

        MessageConversationResponse conversation = messageService.createApplicationConversation(
                clientUser.getId(),
                modelUser.getId(),
                application.getJobPostingId(),
                application.getId()
        );

        messageService.sendSystemMessage(
                conversation.id(),
                clientUser.getId(),
                null,
                createContractConfirmedMessage(contractLink)
        );

        mailService.sendContractConfirmedEmail(modelUser.getEmail(), contractLink);
    }

    private String createContractConfirmedMessage(String contractLink) {
        return """
                계약이 최종 확정되었습니다.
                아래 링크에서 계약 내용을 확인해 주세요.
                %s
                """.formatted(contractLink);
    }

    void sendContractNotification(
            Contract contract,
            Application application,
            Long clientUserId,
            User modelUser,
            String postTitle
    ) {
        MessageConversationResponse conversation = messageService.createApplicationConversation(
                clientUserId,
                modelUser.getId(),
                application.getJobPostingId(),
                application.getId()
        );

        String contractLink = createContractLink(contract, ContractStatus.NOTIFIED, postTitle);

        messageService.sendSystemMessage(
                conversation.id(),
                clientUserId,
                null,
                createContractNotificationMessage(contractLink)
        );

        mailService.sendContractNotificationEmail(
                modelUser.getEmail(),
                contractLink
        );
    }
}
