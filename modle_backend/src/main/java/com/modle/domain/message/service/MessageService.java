package com.modle.domain.message.service;

import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingStatus;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.message.dto.request.CreateConversationRequest;
import com.modle.domain.message.dto.request.SendMessageRequest;
import com.modle.domain.message.dto.response.MessageConversationResponse;
import com.modle.domain.message.dto.response.MessageConversationSummaryResponse;
import com.modle.domain.message.dto.response.MessageInboxResponse;
import com.modle.domain.message.dto.response.ConversationMessagesResponse;
import com.modle.domain.message.dto.response.MessageParticipantResponse;
import com.modle.domain.message.dto.response.MessageResponse;
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
        validatePost(creatorId, request.postId());

        MessageConversation conversation = MessageConversation.builder()
                .clientId(creatorId)
                .modelId(request.receiverId())
                .postId(request.postId())
                .applicationId(request.applicationId())
                .build();
        return MessageConversationResponse.from(conversationRepository.save(conversation));
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
}
