package com.modle.domain.contract.service;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.service.ApplicationService;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.service.UserService;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractPartyLoader {

    private final ApplicationService applicationService;
    private final JobPostingService jobPostingService;
    private final ModelRepository modelRepository;
    private final UserService userService;

    ContractPartyContext loadByContract(Contract contract) {
        Application application = applicationService.getApplication(contract.getApplicationId());
        return loadByApplication(application);
    }

    ContractPartyContext loadByApplication(Application application) {
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());
        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));
        User clientUser = userService.findById(jobPosting.clientId());
        User modelUser = userService.findById(model.getUser().getId());

        return new ContractPartyContext(
                application,
                jobPosting,
                clientUser,
                model,
                modelUser
        );
    }
}
