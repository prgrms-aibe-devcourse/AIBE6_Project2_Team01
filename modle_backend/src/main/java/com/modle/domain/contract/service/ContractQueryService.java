package com.modle.domain.contract.service;

import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.contract.dto.response.ContractListItemResponse;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractListStatus;
import com.modle.domain.contract.entity.type.ContractStatus;
import com.modle.domain.contract.repository.ContractRepository;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.dto.response.MyJobPostingResponse;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.domain.profile.service.ClientService;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.domain.user.service.UserService;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractQueryService {

    private final ContractRepository contractRepository;
    private final ApplicationRepository applicationRepository;
    private final JobPostingService jobPostingService;
    private final UserService userService;
    private final ModelRepository modelRepository;
    private final ClientService clientService;

    public List<ContractListItemResponse> getContracts(
            Long userId,
            String role,
            ContractListStatus status
    ) {
        return switch (role) {
            case "MODEL" -> getModelContracts(userId, status);
            case "CLIENT" -> getClientContracts(userId, status);
            default -> throw new CustomException(ErrorCode.ACCESS_DENIED);
        };
    }

    private List<ContractListItemResponse> getModelContracts(
            Long userId,
            ContractListStatus status
    ) {
        Long modelId = modelRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND))
                .getId();

        List<Application> applications = applicationRepository.findByModelIdOrderByCreatedDateDesc(modelId);

        if (applications.isEmpty()) {
            return List.of();
        }

        Map<Long, Contract> contractMap = getContractMap(applications);

        return applications.stream()
                .filter(application -> contractMap.containsKey(application.getId()))
                .filter(application -> matchesListStatus(
                        contractMap.get(application.getId()),
                        application,
                        status,
                        false
                ))
                .map(application -> {
                    Contract contract = contractMap.get(application.getId());
                    JobPostingResponse jobPosting = jobPostingService.getJobPosting(application.getJobPostingId());
                    User clientUser = userService.findById(jobPosting.clientId());
                    var client = clientService.findByUserId(clientUser.getId());

                    return toContractListItemResponse(
                            contract,
                            application,
                            client.getCompanyName()
                    );
                })
                .toList();
    }

    private List<ContractListItemResponse> getClientContracts(
            Long userId,
            ContractListStatus status
    ) {
        List<Long> jobPostingIds = jobPostingService.getMyJobPostings(userId).stream()
                .map(MyJobPostingResponse::jobPostingId)
                .toList();

        if (jobPostingIds.isEmpty()) {
            return List.of();
        }

        List<Application> applications = applicationRepository.findByJobPostingIdInOrderByCreatedDateDesc(jobPostingIds);

        if (applications.isEmpty()) {
            return List.of();
        }

        Map<Long, Contract> contractMap = getContractMap(applications);

        List<Long> modelIds = applications.stream()
                .map(Application::getModelId)
                .distinct()
                .toList();

        Map<Long, Model> modelMap = modelRepository.findAllById(modelIds).stream()
                .collect(Collectors.toMap(Model::getId, Function.identity()));

        return applications.stream()
                .filter(application -> contractMap.containsKey(application.getId()))
                .filter(application -> modelMap.containsKey(application.getModelId()))
                .filter(application -> matchesListStatus(
                        contractMap.get(application.getId()),
                        application,
                        status,
                        true
                ))
                .map(application -> {
                    Contract contract = contractMap.get(application.getId());
                    Model model = modelMap.get(application.getModelId());

                    return toContractListItemResponse(
                            contract,
                            application,
                            model.getName()
                    );
                })
                .toList();
    }

    private Map<Long, Contract> getContractMap(List<Application> applications) {
        List<Long> applicationIds = applications.stream()
                .map(Application::getId)
                .toList();

        return contractRepository.findByApplicationIdInOrderByCreatedDateDesc(applicationIds).stream()
                .collect(Collectors.toMap(
                        Contract::getApplicationId,
                        Function.identity(),
                        (first, second) -> first
                ));
    }

    private boolean matchesListStatus(
            Contract contract,
            Application application,
            ContractListStatus status,
            boolean includeDraft
    ) {
        return switch (status) {
            case ONGOING -> isOngoing(contract, application, includeDraft);
            case DONE -> isDone(contract, application);
            case CANCELLED -> isCancelled(contract, application);
        };
    }


    private boolean isOngoing(
            Contract contract,
            Application application,
            boolean includeDraft
    ) {
        if (contract.getStatus() == ContractStatus.REJECTED
                || contract.getStatus() == ContractStatus.CANCELLED) {
            return false;
        }

        if (contract.getStatus() == ContractStatus.DRAFT) {
            return includeDraft;
        }

        return application.getStatus() == ApplicationStatus.CONTACTED
                || application.getStatus() == ApplicationStatus.CONTRACT_SENT
                || application.getStatus() == ApplicationStatus.SHOOTING
                || application.getStatus() == ApplicationStatus.ON_HOLD;
    }

    private boolean isDone(Contract contract, Application application) {
        return contract.getStatus() == ContractStatus.CONFIRMED
                && application.getStatus() == ApplicationStatus.COMPLETED;
    }

    private boolean isCancelled(Contract contract, Application application) {
        return contract.getStatus() == ContractStatus.REJECTED
                || contract.getStatus() == ContractStatus.CANCELLED
                || application.getStatus() == ApplicationStatus.SHOOTING_CANCELLED
                || application.getStatus() == ApplicationStatus.APPLICATION_CANCELLED;
    }

    private ContractListItemResponse toContractListItemResponse(
            Contract contract,
            Application application,
            String partnerName
    ) {
        return new ContractListItemResponse(
                contract.getId(),
                application.getId(),
                partnerName,
                contract.getContractType(),
                contract.getStatus(),
                contract.getShootStartAt(),
                contract.getShootEndAt(),
                contract.getLocation(),
                contract.getPayment(),
                contract.getPayType(),
                resolveDocumentUrl(contract),
                contract.getConfirmedAt(),
                contract.getCreatedDate()
        );
    }

    private String resolveDocumentUrl(Contract contract) {
        if (contract.getSignedPdfUrl() != null && !contract.getSignedPdfUrl().isBlank()) {
            return contract.getSignedPdfUrl();
        }
        return contract.getPdfUrl();
    }
}
