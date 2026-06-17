package com.modle.domain.message.service;

import com.modle.domain.message.dto.request.CreateConversationRequest;
import com.modle.domain.message.dto.request.SendMessageRequest;
import com.modle.domain.message.dto.response.MessageResponse;
import com.modle.domain.message.entity.Message;
import com.modle.domain.message.entity.MessageConversation;
import com.modle.domain.message.repository.MessageConversationRepository;
import com.modle.domain.message.repository.MessageRepository;
import com.modle.domain.application.service.ApplicationService;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.type.JobPostingStatus;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.service.UserService;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private MessageConversationRepository conversationRepository;

    @Mock
    private UserService userService;

    @Mock
    private JobPostingRepository jobPostingRepository;

    @Mock
    private ApplicationService applicationService;

    private MessageService messageService;

    @BeforeEach
    void setUp() {
        messageService = new MessageService(
                messageRepository,
                conversationRepository,
                userService,
                jobPostingRepository,
                applicationService
        );
    }

    @Test
    void createConversation_클라이언트가모델대상대화방생성() {
        User client = user(1L, Role.CLIENT);
        User model = user(2L, Role.MODEL);
        given(userService.findById(1L)).willReturn(client);
        given(userService.findById(2L)).willReturn(model);
        JobPosting posting = mock(JobPosting.class);
        given(posting.getClientId()).willReturn(1L);
        given(posting.getStatus()).willReturn(JobPostingStatus.RECRUITING);
        given(jobPostingRepository.findById(10L)).willReturn(Optional.of(posting));
        given(conversationRepository.save(any(MessageConversation.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        var response = messageService.createConversation(
                1L,
                new CreateConversationRequest(2L, 10L, null)
        );

        assertThat(response.clientId()).isEqualTo(1L);
        assertThat(response.modelId()).isEqualTo(2L);
        assertThat(response.postId()).isEqualTo(10L);
        verify(conversationRepository).save(any(MessageConversation.class));
    }

    @Test
    void createConversation_같은모델같은공고_기존대화방재사용() {
        User client = user(1L, Role.CLIENT);
        User model = user(2L, Role.MODEL);
        MessageConversation existing = conversation(100L, 1L, 2L, 10L);
        given(userService.findById(1L)).willReturn(client);
        given(userService.findById(2L)).willReturn(model);
        given(conversationRepository
                .findFirstByClientIdAndModelIdAndPostIdOrderByCreatedDateDesc(1L, 2L, 10L))
                .willReturn(Optional.of(existing));

        var response = messageService.createConversation(
                1L,
                new CreateConversationRequest(2L, 10L, null)
        );

        assertThat(response.id()).isEqualTo(100L);
        verify(conversationRepository, never()).save(any());
    }

    @Test
    void createConversation_같은모델다른공고_새대화방생성() {
        User client = user(1L, Role.CLIENT);
        User model = user(2L, Role.MODEL);
        given(userService.findById(1L)).willReturn(client);
        given(userService.findById(2L)).willReturn(model);
        given(conversationRepository
                .findFirstByClientIdAndModelIdAndPostIdOrderByCreatedDateDesc(1L, 2L, 11L))
                .willReturn(Optional.empty());
        JobPosting posting = mock(JobPosting.class);
        given(posting.getClientId()).willReturn(1L);
        given(posting.getStatus()).willReturn(JobPostingStatus.RECRUITING);
        given(jobPostingRepository.findById(11L)).willReturn(Optional.of(posting));
        given(conversationRepository.save(any(MessageConversation.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        var response = messageService.createConversation(
                1L,
                new CreateConversationRequest(2L, 11L, null)
        );

        assertThat(response.postId()).isEqualTo(11L);
        verify(conversationRepository).save(any(MessageConversation.class));
    }

    @Test
    void createConversation_모델이대화방생성_예외발생() {
        User model = user(1L, Role.MODEL);
        User client = user(2L, Role.CLIENT);
        given(userService.findById(1L)).willReturn(model);
        given(userService.findById(2L)).willReturn(client);

        assertThatThrownBy(() -> messageService.createConversation(
                1L,
                new CreateConversationRequest(2L, null, null)
        ))
                .isInstanceOf(CustomException.class)
                .extracting(exception -> ((CustomException) exception).getErrorCode())
                .isEqualTo(ErrorCode.MESSAGE_CONVERSATION_CREATE_FORBIDDEN);

        verify(conversationRepository, never()).save(any());
    }

    @Test
    void sendMessage_대화방참여자가쪽지전송() {
        MessageConversation conversation = conversation(100L, 1L, 2L);
        given(conversationRepository.findById(100L)).willReturn(Optional.of(conversation));
        given(messageRepository.save(any(Message.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        MessageResponse response = messageService.sendMessage(
                1L,
                new SendMessageRequest(100L, null, "촬영 제안드립니다.")
        );

        assertThat(response.conversationId()).isEqualTo(100L);
        assertThat(response.senderId()).isEqualTo(1L);
        assertThat(response.receiverId()).isEqualTo(2L);
        assertThat(response.content()).isEqualTo("촬영 제안드립니다.");
    }

    @Test
    void sendMessage_모델도생성된대화방에서연속전송가능() {
        MessageConversation conversation = conversation(100L, 1L, 2L);
        given(conversationRepository.findById(100L)).willReturn(Optional.of(conversation));
        given(messageRepository.save(any(Message.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        MessageResponse response = messageService.sendMessage(
                2L,
                new SendMessageRequest(100L, null, "추가로 전달드립니다.")
        );

        assertThat(response.senderId()).isEqualTo(2L);
        assertThat(response.receiverId()).isEqualTo(1L);
        assertThat(response.parentMessageId()).isNull();
    }

    @Test
    void sendMessage_대화방비참여자_예외발생() {
        given(conversationRepository.findById(100L))
                .willReturn(Optional.of(conversation(100L, 1L, 2L)));

        assertThatThrownBy(() -> messageService.sendMessage(
                3L,
                new SendMessageRequest(100L, null, "내용")
        ))
                .isInstanceOf(CustomException.class)
                .extracting(exception -> ((CustomException) exception).getErrorCode())
                .isEqualTo(ErrorCode.MESSAGE_ACCESS_DENIED);
    }

    @Test
    void getConversationMessages_선택한대화방메시지만조회() {
        MessageConversation conversation = conversation(100L, 1L, 2L);
        Message message = message(100L, 2L, 1L);
        PageRequest pageable = PageRequest.of(0, 20);
        given(conversationRepository.findById(100L)).willReturn(Optional.of(conversation));
        given(messageRepository.findByConversationIdOrderByCreatedAtDesc(100L, pageable))
                .willReturn(new PageImpl<>(List.of(message), pageable, 1));

        var response = messageService.getConversationMessages(1L, 100L, pageable);

        assertThat(response.content()).hasSize(1);
        assertThat(response.content().getFirst().conversationId()).isEqualTo(100L);
        verify(messageRepository).findByConversationIdOrderByCreatedAtDesc(100L, pageable);
    }

    @Test
    void markConversationAsRead_대화방의받은쪽지만일괄처리() {
        MessageConversation conversation = conversation(100L, 1L, 2L);
        Message first = message(100L, 2L, 1L);
        Message second = message(100L, 2L, 1L);
        given(conversationRepository.findById(100L)).willReturn(Optional.of(conversation));
        given(messageRepository.findByConversationIdAndReceiverIdAndReadFalse(100L, 1L))
                .willReturn(List.of(first, second));

        int count = messageService.markConversationAsRead(1L, 100L);

        assertThat(count).isEqualTo(2);
        assertThat(first.isRead()).isTrue();
        assertThat(second.isRead()).isTrue();
    }

    private User user(Long id, Role role) {
        User user = mock(User.class);
        lenient().when(user.getId()).thenReturn(id);
        lenient().when(user.getRole()).thenReturn(role);
        return user;
    }

    private MessageConversation conversation(Long id, Long clientId, Long modelId) {
        return conversation(id, clientId, modelId, null);
    }

    private MessageConversation conversation(Long id, Long clientId, Long modelId, Long postId) {
        MessageConversation conversation = MessageConversation.builder()
                .clientId(clientId)
                .modelId(modelId)
                .postId(postId)
                .build();
        ReflectionTestUtils.setField(conversation, "id", id);
        return conversation;
    }

    private Message message(Long conversationId, Long senderId, Long receiverId) {
        return Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .receiverId(receiverId)
                .content("내용")
                .build();
    }
}
