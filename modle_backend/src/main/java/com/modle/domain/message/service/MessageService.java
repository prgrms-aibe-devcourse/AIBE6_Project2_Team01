package com.modle.domain.message.service;

import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.message.dto.request.CreateConversationRequest;
import com.modle.domain.message.dto.request.SendMessageRequest;
import com.modle.domain.message.dto.response.*;
import com.modle.domain.message.entity.Message;
import com.modle.domain.message.entity.MessageConversation;
import com.modle.domain.message.entity.SenderType;
import com.modle.domain.message.repository.MessageConversationRepository;
import com.modle.domain.message.repository.MessageRepository;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.service.UserService;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;
    private final MessageConversationRepository conversationRepository;
    private final UserService userService;
    private final JobPostingRepository jobPostingRepository;

    @Transactional
    public MessageConversationResponse createConversation(
            Long creatorId,
            CreateConversationRequest request
    ) {
        User creator = userService.findById(creatorId);
        User receiver = userService.findById(request.receiverId());

        if (creator.getRole() != Role.CLIENT || receiver.getRole() != Role.MODEL) {
            throw new CustomException(ErrorCode.MESSAGE_CONVERSATION_CREATE_FORBIDDEN);
        }
        if (creatorId.equals(request.receiverId())) {
            throw new CustomException(ErrorCode.MESSAGE_SELF_SEND_NOT_ALLOWED);
        }

        // 대화방 생성 정책
        // 1) 일반 쪽지 시작(applicationId == null)
        //    - clientId + modelId + postId 기준 기존 대화방 재사용
        //    - 공고 상태는 RECRUITING 이어야 함
        // 2) 계약 발송 쪽지(applicationId != null)
        //    - applicationId 기준 기존 대화방 우선 조회
        //    - 있으면 해당 대화방 재사용
        //    - 없으면 새 대화방 생성
        //    - 계약 발송 시점에는 공고 상태가 RECRUITING 이 아닐 수 있으므로
        //      공고 소유권만 검증하고 상태 검증은 하지 않음
        // 동일 모델·동일 공고 조합이면 기존 대화방을 재사용해 중복 생성을 막는다.

        MessageConversation existingConversation = findDuplicateConversation(creatorId, request);
        if (existingConversation != null) {
            return MessageConversationResponse.from(existingConversation);
        }

        validatePost(creatorId, request.postId());

        MessageConversation conversation = MessageConversation.builder()
                .clientId(creatorId)
                .modelId(request.receiverId())
                .postId(request.postId())
                .applicationId(null)
                .build();

        // 위 조회로 일반적인 중복은 막지만, 동시 요청 경합은 DB unique 제약
        // (uk_conversation_client_model_post)이 최종적으로 중복 저장을 차단한다.
        return MessageConversationResponse.from(conversationRepository.save(conversation));
    }

    // 공고가 지정된 경우에만 동일 클라이언트·모델·공고 대화방을 중복으로 본다.
    private MessageConversation findDuplicateConversation(Long creatorId, CreateConversationRequest request) {
        if (request.postId() == null) {
            return null;
        }
        return conversationRepository
                .findFirstByClientIdAndModelIdAndPostIdOrderByCreatedDateDesc(
                        creatorId, request.receiverId(), request.postId())
                .orElse(null);
    }

    @Transactional
    public MessageResponse sendMessage(Long senderId, SendMessageRequest request) {
        MessageConversation conversation = findConversation(request.conversationId());
        validateParticipant(conversation, senderId);
        validateParentMessage(conversation.getId(), senderId, request.parentMessageId());

        Message message = Message.builder()
                .conversationId(conversation.getId())
                .senderId(senderId)
                .receiverId(conversation.otherParticipantId(senderId))
                .parentMessageId(request.parentMessageId())
                .content(request.content())
                .senderType(SenderType.USER)
                .build();

        return MessageResponse.from(messageRepository.save(message));
    }

    @Transactional
    public MessageResponse sendSystemMessage(
            Long conversationId,
            Long senderId,
            Long parentMessageId,
            String content
    ) {
        MessageConversation conversation = findConversation(conversationId);
        validateParticipant(conversation, senderId);
        validateParentMessage(conversationId, senderId, parentMessageId);

        Message message = Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .receiverId(conversation.otherParticipantId(senderId))
                .parentMessageId(parentMessageId)
                .content(content)
                .senderType(SenderType.SYSTEM)
                .build();

        return MessageResponse.from(messageRepository.save(message));
    }

    public MessageInboxResponse getConversations(Long userId) {
        List<MessageConversation> conversations =
                conversationRepository.findByClientIdOrModelIdOrderByCreatedDateDesc(userId, userId);

        Set<Long> allUserIds = new LinkedHashSet<>();
        allUserIds.add(userId);
        conversations.forEach(conversation -> {
            allUserIds.add(conversation.getClientId());
            allUserIds.add(conversation.getModelId());
        });

        Map<Long, User> userMap = userService.findAllByIds(allUserIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        MessageParticipantResponse currentUser =
                MessageParticipantResponse.from(userMap.get(userId));
        List<MessageConversationSummaryResponse> summaries = conversations.stream()
                .map(conversation -> {
                    Long participantId = conversation.otherParticipantId(userId);
                    MessageParticipantResponse participant =
                            MessageParticipantResponse.from(userMap.get(participantId));
                    MessageResponse latestMessage = messageRepository
                            .findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId())
                            .map(MessageResponse::from)
                            .orElse(null);
                    long unreadCount = messageRepository
                            .countByConversationIdAndReceiverIdAndReadFalse(conversation.getId(), userId);
                    return MessageConversationSummaryResponse.from(
                            conversation,
                            participant,
                            latestMessage,
                            unreadCount
                    );
                })
                .toList();

        return new MessageInboxResponse(currentUser, summaries);
    }

    public ConversationMessagesResponse getConversationMessages(
            Long userId,
            Long conversationId,
            Pageable pageable
    ) {
        MessageConversation conversation = findConversation(conversationId);
        validateParticipant(conversation, userId);
        Page<MessageResponse> messages = messageRepository
                .findByConversationIdOrderByCreatedAtDesc(conversationId, pageable)
                .map(MessageResponse::from);
        return ConversationMessagesResponse.from(messages);
    }

    @Transactional
    public int markConversationAsRead(Long userId, Long conversationId) {
        MessageConversation conversation = findConversation(conversationId);
        validateParticipant(conversation, userId);
        List<Message> unreadMessages =
                messageRepository.findByConversationIdAndReceiverIdAndReadFalse(conversationId, userId);
        unreadMessages.forEach(Message::markAsRead);
        return unreadMessages.size();
    }

    public MessageConversation findConversationByApplicationId(Long applicationId) {
        return conversationRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.MESSAGE_CONVERSATION_NOT_FOUND));
    }

    private MessageConversation findConversation(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new CustomException(ErrorCode.MESSAGE_CONVERSATION_NOT_FOUND));
    }

    private void validateParticipant(MessageConversation conversation, Long userId) {
        if (!conversation.contains(userId)) {
            throw new CustomException(ErrorCode.MESSAGE_ACCESS_DENIED);
        }
    }

    private void validateParentMessage(
            Long conversationId,
            Long senderId,
            Long parentMessageId
    ) {
        if (parentMessageId == null) {
            return;
        }
        Message parent = messageRepository.findById(parentMessageId)
                .orElseThrow(() -> new CustomException(ErrorCode.MESSAGE_NOT_FOUND));
        if (!conversationId.equals(parent.getConversationId())
                || !senderId.equals(parent.getReceiverId())) {
            throw new CustomException(ErrorCode.MESSAGE_INVALID_PARENT);
        }
    }

    private void validatePost(Long clientId, Long postId) {
        if (postId == null) {
            return;
        }
        JobPosting posting = jobPostingRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));
        if (!posting.getClientId().equals(clientId)
                || posting.getStatus() != JobPostingStatus.RECRUITING) {
            throw new CustomException(ErrorCode.MESSAGE_POST_NOT_AVAILABLE);
        }
    }

    private void validateContractConversationPost(Long clientId, Long postId) {
        if (postId == null) {
            throw new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND);
        }

        JobPosting posting = jobPostingRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        if (!posting.getClientId().equals(clientId)) {
            throw new CustomException(ErrorCode.MESSAGE_POST_NOT_AVAILABLE);
        }
    }

    @Transactional
    public MessageConversationResponse createApplicationConversation(
            Long clientUserId,
            Long modelUserId,
            Long jobPostingId,
            Long applicationId
    ) {
        MessageConversation existingConversation = conversationRepository
                .findByApplicationId(applicationId)
                .orElse(null);

        if (existingConversation != null) {
            return MessageConversationResponse.from(existingConversation);
        }

        // applicationId 없이 생성된 기존 공고 대화방에 지원 정보를 연결한다.
        MessageConversation byPost = conversationRepository
                .findFirstByClientIdAndModelIdAndPostIdOrderByCreatedDateDesc(
                        clientUserId, modelUserId, jobPostingId)
                .orElse(null);

        if (byPost != null) {
            byPost.linkApplication(applicationId);
            return MessageConversationResponse.from(byPost);
        }
        validateContractConversationPost(clientUserId, jobPostingId);

        MessageConversation conversation = MessageConversation.builder()
                .clientId(clientUserId)
                .modelId(modelUserId)
                .postId(jobPostingId)
                .applicationId(applicationId)
                .build();

        return MessageConversationResponse.from(conversationRepository.save(conversation));
    }
}
