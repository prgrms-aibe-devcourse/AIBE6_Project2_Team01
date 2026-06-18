package com.modle.domain.application.dto.response;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.user.entity.Model;

import java.time.LocalDateTime;

public record ApplicantResponse(
        Long applicationId,
        Long modelId,
        String modelName,
        String profileImageUrl,
        String coverLetter,
        ApplicationStatus status,
        boolean contacted,      // CONTACTED 이상 여부
        boolean shooting,       // SHOOTING 이상 여부
        LocalDateTime appliedDate
) {
    public static ApplicantResponse from(Application application, Model model) {
        return new ApplicantResponse(
                application.getId(),
                model.getId(),
                model.getName(),
                model.getProfileImageUrl(),
                application.getCoverLetter(),
                application.getStatus(),
                isContacted(application.getStatus()),
                isShooting(application.getStatus()),
                application.getCreatedDate()
        );
    }

    private static boolean isContacted(ApplicationStatus status) {
        return status == ApplicationStatus.CONTACTED
                || status == ApplicationStatus.CONTRACT_SENT
                || status == ApplicationStatus.SHOOTING
                || status == ApplicationStatus.COMPLETED;
    }

    private static boolean isShooting(ApplicationStatus status) {
        return status == ApplicationStatus.SHOOTING
                || status == ApplicationStatus.COMPLETED;
    }
}
