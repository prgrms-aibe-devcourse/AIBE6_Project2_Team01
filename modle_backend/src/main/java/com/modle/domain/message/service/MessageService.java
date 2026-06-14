package com.modle.domain.message.service;

import com.modle.domain.message.dto.request.SendMessageRequest;
import com.modle.domain.message.dto.response.MessagePageResponse;
import com.modle.domain.message.dto.response.MessageParticipantResponse;
import com.modle.domain.message.dto.response.MessageResponse;
import com.modle.domain.message.entity.Message;
import com.modle.domain.message.entity.SenderType;
import com.modle.domain.message.exception.MessageAccessDeniedException;
import com.modle.domain.message.exception.MessageNotFoundException;
import com.modle.domain.message.exception.InvalidParentMessageException;
import com.modle.domain.message.exception.ModelInitialMessageNotAllowedException;
import com.modle.domain.message.exception.SelfMessageNotAllowedException;
import com.modle.domain.message.repository.MessageRepository;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;

    @Transactional
    public MessageResponse sendMessage(Long senderId, SendMessageRequest request) {
        User sender = userService.findById(senderId);
        userService.findById(request.receiverId());
        validateDifferentUsers(senderId, request.receiverId());
        Message parentMessage = validateParentMessage(
                senderId,
                request.receiverId(),
                request.applicationId(),
                request.postId(),
                request.parentMessageId()
        );
        validateModelReply(sender.getRole(), senderId, parentMessage);

        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(request.receiverId())
                .applicationId(request.applicationId())
                .postId(request.postId())
                .parentMessageId(request.parentMessageId())
                .content(request.content())
                .senderType(SenderType.USER)
                .build();

        return MessageResponse.from(messageRepository.save(message));
    }

    /**
     * 타 도메인에서 시스템 쪽지를 동기 방식으로 발송할 때 사용한다.
     */
    @Transactional
    public MessageResponse sendSystemMessage(
            Long senderId,
            Long receiverId,
            Long applicationId,
            Long postId,
            Long parentMessageId,
            String content
    ) {
        validateDifferentUsers(senderId, receiverId);
        validateParentMessage(senderId, receiverId, applicationId, postId, parentMessageId);

        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .applicationId(applicationId)
                .postId(postId)
                .parentMessageId(parentMessageId)
                .content(content)
                .senderType(SenderType.SYSTEM)
                .build();

        return MessageResponse.from(messageRepository.save(message));
    }

    public MessagePageResponse getInbox(Long userId, Boolean read, Pageable pageable) {
        Page<Message> messages = read == null
                ? messageRepository.findBySenderIdOrReceiverIdOrderByCreatedAtDesc(
                        userId,
                        userId,
                        pageable
                )
                : messageRepository.findByReceiverIdAndReadOrderByCreatedAtDesc(
                        userId,
                        read,
                        pageable
                );

        Set<Long> allUserIds = new LinkedHashSet<>();
        allUserIds.add(userId);
        messages.forEach(message -> {
            allUserIds.add(message.getSenderId());
            allUserIds.add(message.getReceiverId());
        });

        Map<Long, User> userMap = userService.findAllByIds(allUserIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        MessageParticipantResponse currentUser =
                MessageParticipantResponse.from(userMap.get(userId));
        List<MessageParticipantResponse> participants = allUserIds.stream()
                .filter(id -> !id.equals(userId))
                .map(userMap::get)
                .map(MessageParticipantResponse::from)
                .toList();

        return MessagePageResponse.from(
                currentUser,
                participants,
                messages.map(MessageResponse::from)
        );
    }

    @Transactional
    public MessageResponse markAsRead(Long userId, Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageNotFoundException(messageId));

        if (!message.getReceiverId().equals(userId)) {
            throw new MessageAccessDeniedException();
        }

        message.markAsRead();
        return MessageResponse.from(message);
    }

    @Transactional
    public int markConversationAsRead(
            Long userId,
            Long participantId,
            Long applicationId,
            Long postId
    ) {
        List<Message> unreadMessages = messageRepository.findUnreadConversationMessages(
                userId,
                participantId,
                applicationId,
                postId
        );
        unreadMessages.forEach(Message::markAsRead);
        return unreadMessages.size();
    }

    private void validateDifferentUsers(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new SelfMessageNotAllowedException();
        }
    }

    private Message validateParentMessage(
            Long senderId,
            Long receiverId,
            Long applicationId,
            Long postId,
            Long parentMessageId
    ) {
        if (parentMessageId == null) {
            return null;
        }

        Message parentMessage = messageRepository.findById(parentMessageId)
                .orElseThrow(() -> new MessageNotFoundException(parentMessageId));

        boolean sameConversation =
                parentMessage.getSenderId().equals(senderId)
                        && parentMessage.getReceiverId().equals(receiverId)
                        || parentMessage.getSenderId().equals(receiverId)
                        && parentMessage.getReceiverId().equals(senderId);

        boolean sameContext =
                Objects.equals(parentMessage.getApplicationId(), applicationId)
                        && Objects.equals(parentMessage.getPostId(), postId);

        if (!sameConversation || !sameContext) {
            throw new InvalidParentMessageException();
        }

        return parentMessage;
    }

    private void validateModelReply(Role senderRole, Long senderId, Message parentMessage) {
        if (senderRole != Role.MODEL) {
            return;
        }

        if (parentMessage == null || !parentMessage.getReceiverId().equals(senderId)) {
            throw new ModelInitialMessageNotAllowedException();
        }
    }
}
