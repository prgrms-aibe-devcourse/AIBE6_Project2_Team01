package com.modle.domain.message.service;

import com.modle.domain.message.dto.request.SendMessageRequest;
import com.modle.domain.message.dto.response.MessagePageResponse;
import com.modle.domain.message.dto.response.MessageResponse;
import com.modle.domain.message.entity.Message;
import com.modle.domain.message.entity.SenderType;
import com.modle.domain.message.exception.MessageAccessDeniedException;
import com.modle.domain.message.exception.InvalidParentMessageException;
import com.modle.domain.message.exception.ModelInitialMessageNotAllowedException;
import com.modle.domain.message.exception.SelfMessageNotAllowedException;
import com.modle.domain.message.repository.MessageRepository;
import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.Role;
import com.modle.domain.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserService userService;

    private MessageService messageService;

    @BeforeEach
    void setUp() {
        messageService = new MessageService(messageRepository, userService);
    }

    @Test
    void sendMessage_정상요청_쪽지저장() {
        // given
        SendMessageRequest request = new SendMessageRequest(
                2L,
                20L,
                10L,
                30L,
                "촬영 제안드립니다."
        );
        given(messageRepository.save(any(Message.class)))
                .willAnswer(invocation -> invocation.getArgument(0));
        given(messageRepository.findById(30L)).willReturn(Optional.of(createMessage(2L, 1L)));
        doReturn(createUser(1L, Role.CLIENT)).when(userService).findById(1L);
        doReturn(createUser(2L, Role.MODEL)).when(userService).findById(2L);

        // when
        MessageResponse response = messageService.sendMessage(1L, request);

        // then
        assertThat(response.senderId()).isEqualTo(1L);
        assertThat(response.receiverId()).isEqualTo(2L);
        assertThat(response.applicationId()).isEqualTo(20L);
        assertThat(response.postId()).isEqualTo(10L);
        assertThat(response.parentMessageId()).isEqualTo(30L);
        assertThat(response.content()).isEqualTo("촬영 제안드립니다.");
        assertThat(response.senderType()).isEqualTo(SenderType.USER);
        assertThat(response.read()).isFalse();
        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void sendMessage_자기자신에게발송_예외발생() {
        // given
        SendMessageRequest request = new SendMessageRequest(1L, null, null, null, "내용");
        doReturn(createUser(1L, Role.CLIENT)).when(userService).findById(1L);

        // when, then
        assertThatThrownBy(() -> messageService.sendMessage(1L, request))
                .isInstanceOf(SelfMessageNotAllowedException.class);
        verify(messageRepository, never()).save(any(Message.class));
    }

    @Test
    void getInbox_읽음필터없음_보낸쪽지와받은쪽지조회() {
        // given
        PageRequest pageable = PageRequest.of(0, 20);
        Message message = createMessage(1L, 2L);
        given(messageRepository.findBySenderIdOrReceiverIdOrderByCreatedAtDesc(1L, 1L, pageable))
                .willReturn(new PageImpl<>(List.of(message), pageable, 1));
        doReturn(List.of(createUser(1L, Role.CLIENT), createUser(2L, Role.MODEL)))
                .when(userService).findAllByIds(anyCollection());

        // when
        MessagePageResponse response = messageService.getInbox(1L, null, pageable);

        // then
        assertThat(response.totalElements()).isEqualTo(1);
        assertThat(response.content().getFirst().senderId()).isEqualTo(1L);
        assertThat(response.currentUser().id()).isEqualTo(1L);
        assertThat(response.participants().getFirst().id()).isEqualTo(2L);
    }

    @Test
    void markAsRead_수신자요청_읽음처리() {
        // given
        Message message = createMessage(1L, 2L);
        given(messageRepository.findById(10L)).willReturn(Optional.of(message));

        // when
        MessageResponse response = messageService.markAsRead(2L, 10L);

        // then
        assertThat(response.read()).isTrue();
        assertThat(response.readAt()).isNotNull();
    }

    @Test
    void markAsRead_수신자가아님_예외발생() {
        // given
        Message message = createMessage(1L, 2L);
        given(messageRepository.findById(10L)).willReturn(Optional.of(message));

        // when, then
        assertThatThrownBy(() -> messageService.markAsRead(3L, 10L))
                .isInstanceOf(MessageAccessDeniedException.class);
    }

    @Test
    void sendMessage_다른대화쪽지에답신_예외발생() {
        // given
        SendMessageRequest request = new SendMessageRequest(2L, null, null, 30L, "답신");
        given(messageRepository.findById(30L)).willReturn(Optional.of(createMessage(3L, 4L)));
        doReturn(createUser(1L, Role.CLIENT)).when(userService).findById(1L);
        doReturn(createUser(2L, Role.MODEL)).when(userService).findById(2L);

        // when, then
        assertThatThrownBy(() -> messageService.sendMessage(1L, request))
                .isInstanceOf(InvalidParentMessageException.class);
        verify(messageRepository, never()).save(any(Message.class));
    }

    @Test
    void sendMessage_모델최초발송_예외발생() {
        // given
        SendMessageRequest request = new SendMessageRequest(2L, null, null, null, "최초 쪽지");
        doReturn(createUser(1L, Role.MODEL)).when(userService).findById(1L);
        doReturn(createUser(2L, Role.CLIENT)).when(userService).findById(2L);

        // when, then
        assertThatThrownBy(() -> messageService.sendMessage(1L, request))
                .isInstanceOf(ModelInitialMessageNotAllowedException.class);
        verify(messageRepository, never()).save(any(Message.class));
    }

    @Test
    void sendMessage_모델이받은쪽지에답신_쪽지저장() {
        // given
        SendMessageRequest request = new SendMessageRequest(2L, null, null, 30L, "답신");
        doReturn(createUser(1L, Role.MODEL)).when(userService).findById(1L);
        doReturn(createUser(2L, Role.CLIENT)).when(userService).findById(2L);
        given(messageRepository.findById(30L)).willReturn(Optional.of(createMessage(2L, 1L)));
        given(messageRepository.save(any(Message.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        // when
        MessageResponse response = messageService.sendMessage(1L, request);

        // then
        assertThat(response.senderId()).isEqualTo(1L);
        assertThat(response.parentMessageId()).isEqualTo(30L);
    }

    private Message createMessage(Long senderId, Long receiverId) {
        return Message.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content("내용")
                .senderType(SenderType.USER)
                .build();
    }

    private User createUser(Long id, Role role) {
        User user = mock(User.class);
        lenient().when(user.getId()).thenReturn(id);
        lenient().when(user.getRole()).thenReturn(role);
        if (role == Role.MODEL) {
            Model model = mock(Model.class);
            lenient().when(model.getName()).thenReturn("모델 " + id);
            lenient().when(user.getModel()).thenReturn(model);
        } else if (role == Role.CLIENT) {
            Client client = mock(Client.class);
            lenient().when(client.getCompanyName()).thenReturn("의뢰인 " + id);
            lenient().when(user.getClient()).thenReturn(client);
        }
        return user;
    }
}
