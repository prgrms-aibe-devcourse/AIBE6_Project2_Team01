package com.modle.domain.application.service;

import com.modle.domain.application.dto.request.ApplicationCreateRequest;
import com.modle.domain.application.dto.request.CancelShootingRequest;
import com.modle.domain.application.dto.request.HoldRequest;
import com.modle.domain.application.dto.response.ApplicantResponse;
import com.modle.domain.application.dto.response.ApplicationResponse;
import com.modle.domain.application.dto.response.ContactResponse;
import com.modle.domain.application.dto.response.MyApplicationResponse;
import com.modle.domain.application.entity.Application;
import com.modle.domain.application.entity.type.ApplicationStatus;
import com.modle.domain.application.repository.ApplicationRepository;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.domain.message.dto.request.CreateConversationRequest;
import com.modle.domain.message.dto.response.MessageConversationResponse;
import com.modle.domain.message.entity.Message;
import com.modle.domain.message.entity.MessageConversation;
import com.modle.domain.message.repository.MessageRepository;
import com.modle.domain.message.service.MessageService;
import com.modle.domain.profile.entity.Career;
import com.modle.domain.profile.repository.CareerRepository;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.repository.ModelRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingService jobPostingService;
    private final JobPostingRepository jobPostingRepository;
    private final ModelRepository modelRepository;
    private final MessageService messageService;
    private final MessageRepository messageRepository;
    private final CareerRepository careerRepository;

    public Application getApplication(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));
    }

    @Transactional
    public void markContractSent(Long applicationId) {
        Application application = getApplication(applicationId);
        application.markContractSent();
    }

    // MATCH-001: 모집 중 상태·중복 지원 검증 후 지원을 생성한다 (상태=APPLIED).
    @Transactional
    public ApplicationResponse applyToJob(Long userId, Long jobPostingId, ApplicationCreateRequest request) {
        Long modelId = findModelIdByUserId(userId);
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        if (jobPosting.getStatus() != JobPostingStatus.RECRUITING) {
            throw new CustomException(ErrorCode.APPLICATION_JOB_NOT_RECRUITING);
        }

        boolean alreadyApplied = applicationRepository
                .existsByJobPostingIdAndModelIdAndStatusNot(jobPostingId, modelId, ApplicationStatus.APPLICATION_CANCELLED);
        if (alreadyApplied) {
            throw new CustomException(ErrorCode.APPLICATION_ALREADY_EXISTS);
        }

        Application application = Application.builder()
                .jobPostingId(jobPostingId)
                .modelId(modelId)
                .coverLetter(request != null ? request.coverLetter() : null)
                .status(ApplicationStatus.APPLIED)
                .build();
        Application saved = applicationRepository.save(application);

        var conversation = messageService.createConversation(
                jobPosting.getClientId(),
                new CreateConversationRequest(userId, jobPostingId)
        );
        messageService.sendSystemMessage(
                conversation.id(), userId, null,
                "새로운 지원이 접수되었습니다."
        );
        return ApplicationResponse.from(saved);
    }

    // MATCH-002: 모델이 본인의 지원을 취소한다 (상태=APPLICATION_CANCELLED).
    @Transactional
    public ApplicationResponse cancelApplication(Long userId, Long applicationId) {
        Long modelId = findModelIdByUserId(userId);
        Application application = applicationRepository
                .findByIdAndModelId(applicationId, modelId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        JobPosting jobPosting = jobPostingRepository.findById(application.getJobPostingId())
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));
        if (jobPosting.getStatus() != JobPostingStatus.RECRUITING) {
            throw new CustomException(ErrorCode.APPLICATION_CANCEL_NOT_ALLOWED);
        }

        application.cancel();
        return ApplicationResponse.from(application);
    }

    // MATCH-003: 모델이 특정 공고에 이미 지원했는지 확인한다.
    public boolean hasApplied(Long userId, Long jobPostingId) {
        Long modelId = findModelIdByUserId(userId);
        return applicationRepository.existsByJobPostingIdAndModelIdAndStatusNot(
                jobPostingId, modelId, ApplicationStatus.APPLICATION_CANCELLED);
    }

    // MATCH-004: 특정 공고의 지원자 목록 (의뢰인)
    public List<ApplicantResponse> getApplicants(Long clientId, Long jobPostingId) {
        // 공고 작성자 확인
        JobPostingResponse jobPosting = jobPostingService.getJobPosting(jobPostingId);
        if (!jobPosting.clientId().equals(clientId)) {
            throw new CustomException(ErrorCode.JOB_POSTING_FORBIDDEN);
        }

        List<Application> applications =
                applicationRepository.findByJobPostingIdAndStatusNotOrderByCreatedDateDesc(
                        jobPostingId, ApplicationStatus.APPLICATION_CANCELLED);

        // 모델 id 목록으로 한 번에 조회
        List<Long> modelIds = applications.stream()
                .map(Application::getModelId)
                .toList();

        Map<Long, Model> modelMap = modelRepository.findAllById(modelIds)
                .stream()
                .collect(Collectors.toMap(Model::getId, Function.identity()));

        return applications.stream()
                .filter(a -> modelMap.containsKey(a.getModelId()))
                .map(a -> ApplicantResponse.from(a, modelMap.get(a.getModelId())))
                .toList();
    }

    // MATCH-005: 내가 지원한 공고 목록 (모델)
    public List<MyApplicationResponse> getMyApplications(Long userId) {
        Long modelId = findModelIdByUserId(userId);

        List<Application> applications =
                applicationRepository.findByModelIdAndStatusNotOrderByCreatedDateDesc(
                        modelId, ApplicationStatus.APPLICATION_CANCELLED);

        List<Long> jobPostingIds = applications.stream()
                .map(Application::getJobPostingId)
                .toList();

        Map<Long, JobPosting> jobPostingMap = jobPostingRepository.findAllById(jobPostingIds)
                .stream()
                .collect(Collectors.toMap(JobPosting::getId, Function.identity()));

        return applications.stream()
                .filter(a -> jobPostingMap.containsKey(a.getJobPostingId()))
                .map(a -> MyApplicationResponse.from(a, jobPostingMap.get(a.getJobPostingId())))
                .toList();
    }

    // MATCH-008: 의뢰인이 지원자에게 컨택한다 (상태=CONTACTED).
    @Transactional
    public ApplicationResponse contact(Long clientId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        JobPosting jobPosting = jobPostingRepository.findById(application.getJobPostingId())
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        if (!jobPosting.getClientId().equals(clientId)) {
            throw new CustomException(ErrorCode.APPLICATION_CONTACT_FORBIDDEN);
        }

        if (application.getStatus() == ApplicationStatus.CONTACTED) {
            throw new CustomException(ErrorCode.APPLICATION_ALREADY_CONTACTED);
        }

        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new CustomException(ErrorCode.APPLICATION_CONTACT_NOT_ALLOWED);
        }

        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));

        Long modelUserId = model.getUser().getId();

        MessageConversationResponse conversation = messageService.createApplicationConversation(
                clientId,
                modelUserId,
                application.getJobPostingId(),
                application.getId()
        );

        messageService.sendSystemMessage(
                conversation.id(),
                clientId,
                null,
                createContactMessage(jobPosting.getTitle())
        );

        application.contact();

        return ApplicationResponse.from(application);
    }

    // MATCH-009: 컨택 이력을 조회한다 (공고 작성자 또는 해당 지원의 모델만 접근 가능).
    public List<ContactResponse> getContacts(Long userId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        JobPosting jobPosting = jobPostingRepository.findById(application.getJobPostingId())
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        boolean isModel = isApplicationModel(userId, application);
        boolean isClient = jobPosting.getClientId().equals(userId);

        if (!isModel && !isClient) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        MessageConversation conversation = messageService.findConversationByApplicationId(applicationId);

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());

        return messages.stream()
                .map(message -> new ContactResponse(
                        message.getId(),
                        message.getSenderId(),
                        message.getReceiverId(),
                        message.getContent(),
                        conversation.getPostId(),
                        message.getCreatedAt().toLocalDateTime()
                ))
                .toList();
    }

    // MATCH-012: 촬영 취소 (ON_HOLD → SHOOTING_CANCELLED, 공고 CANCELLED 처리)
    @Transactional
    public ApplicationResponse cancelShooting(Long clientId, Long applicationId, CancelShootingRequest request) {
        Application application = getApplication(applicationId);
        JobPosting jobPosting = getJobPostingAndValidateOwner(application.getJobPostingId(), clientId);

        if (application.getStatus() != ApplicationStatus.ON_HOLD) {
            throw new CustomException(ErrorCode.APPLICATION_CANCEL_SHOOTING_NOT_ALLOWED);
        }

        application.cancelShooting(request.cancelReason());
        jobPosting.updateStatus(JobPostingStatus.CANCELLED);
        return ApplicationResponse.from(application);
    }

    // MATCH-013: 촬영 보류 (SHOOTING → ON_HOLD)
    @Transactional
    public ApplicationResponse holdShooting(Long clientId, Long applicationId, HoldRequest request) {
        Application application = getApplication(applicationId);
        JobPosting jobPosting = getJobPostingAndValidateOwner(application.getJobPostingId(), clientId);

        if (application.getStatus() != ApplicationStatus.SHOOTING) {
            throw new CustomException(ErrorCode.APPLICATION_HOLD_NOT_ALLOWED);
        }

        application.hold(request.holdReason());
        jobPosting.updateStatus(JobPostingStatus.ON_HOLD);
        return ApplicationResponse.from(application);
    }

    // MATCH-014: 촬영 재개 (ON_HOLD → SHOOTING, 모델 알림 발송)
    @Transactional
    public ApplicationResponse resumeShooting(Long clientId, Long applicationId) {
        Application application = getApplication(applicationId);
        JobPosting jobPosting = getJobPostingAndValidateOwner(application.getJobPostingId(), clientId);

        if (application.getStatus() != ApplicationStatus.ON_HOLD) {
            throw new CustomException(ErrorCode.APPLICATION_RESUME_NOT_ALLOWED);
        }

        application.resume();
        jobPosting.updateStatus(JobPostingStatus.SHOOTING);

        Model model = modelRepository.findById(application.getModelId())
                .orElseThrow(() -> new CustomException(ErrorCode.MODEL_NOT_FOUND));
        MessageConversation conversation = messageService.findConversationByApplicationId(applicationId);
        messageService.sendSystemMessage(
                conversation.getId(), clientId, model.getUser().getId(),
                "촬영이 재개되었습니다. 일정을 확인해 주세요."
        );

        return ApplicationResponse.from(application);
    }

    // re-recruit: 재모집 (ON_HOLD → SHOOTING_CANCELLED, 기존 공고 마감 + 새 공고 생성)
    @Transactional
    public ApplicationResponse reRecruit(Long clientId, Long applicationId) {
        Application application = getApplication(applicationId);
        getJobPostingAndValidateOwner(application.getJobPostingId(), clientId);

        if (application.getStatus() != ApplicationStatus.ON_HOLD) {
            throw new CustomException(ErrorCode.APPLICATION_RE_RECRUIT_NOT_ALLOWED);
        }

        application.closeForReRecruit();
        jobPostingService.cloneForReRecruit(application.getJobPostingId());
        return ApplicationResponse.from(application);
    }

    private JobPosting getJobPostingAndValidateOwner(Long jobPostingId, Long clientId) {
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));
        if (!jobPosting.getClientId().equals(clientId)) {
            throw new CustomException(ErrorCode.JOB_POSTING_FORBIDDEN);
        }
        return jobPosting;
    }

    // MATCH-016: 촬영 완료 처리 (의뢰인)
    @Transactional
    public ApplicationResponse completeApplication(Long clientId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.APPLICATION_NOT_FOUND));

        JobPosting jobPosting = jobPostingRepository.findById(application.getJobPostingId())
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        // 공고 작성자 검증
        if (!jobPosting.getClientId().equals(clientId)) {
            throw new CustomException(ErrorCode.JOB_POSTING_FORBIDDEN);
        }

        // SHOOTING 상태에서만 가능
        if (application.getStatus() != ApplicationStatus.SHOOTING) {
            throw new CustomException(ErrorCode.INVALID_STATUS_CHANGE);
        }

        application.complete();

        // Career 자동 생성
        Career career = Career.createFromJobPosting(
                application.getModelId(),
                jobPosting.getId(),
                jobPosting.getTitle(),
                jobPosting.getCategory().name(),
                jobPosting.getRegion().name(),
                jobPosting.getShootDate(),
                LocalDateTime.now()
        );
        careerRepository.save(career);

        // 완료 인원 >= 필요 인원 시 공고 자동 마감
        autoCloseJobPostingIfNeeded(jobPosting);

        return ApplicationResponse.from(application);
    }

    private void autoCloseJobPostingIfNeeded(JobPosting jobPosting) {
        if (jobPosting.getRequiredCount() == null) return;

        long completedCount = applicationRepository.countByJobPostingIdAndStatus(
                jobPosting.getId(), ApplicationStatus.COMPLETED);

        if (completedCount >= jobPosting.getRequiredCount()) {
            jobPosting.close();
        }
    }

    private String createContactMessage(String jobPostingTitle) {
        return """
                지원하신 공고에 컨택이 도착했습니다.
                공고명: %s
                쪽지함에서 상세 내용을 확인해 주세요.
                """.formatted(jobPostingTitle);
    }

    private boolean isApplicationModel(Long userId, Application application) {
        return modelRepository.findByUserId(userId)
                .map(Model::getId)
                .filter(application.getModelId()::equals)
                .isPresent();
    }

    private Long findModelIdByUserId(Long userId) {
        return modelRepository.findByUserId(userId)
                .map(Model::getId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
