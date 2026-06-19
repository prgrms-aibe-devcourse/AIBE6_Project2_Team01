package com.modle.domain.message.controller;

import com.modle.domain.message.dto.request.CreateConversationRequest;
import com.modle.domain.message.dto.request.SendMessageRequest;
import com.modle.domain.message.dto.request.ReadConversationRequest;
import com.modle.domain.message.dto.response.MessageConversationResponse;
import com.modle.domain.message.dto.response.MessageInboxResponse;
import com.modle.domain.message.dto.response.ConversationMessagesResponse;
import com.modle.domain.message.dto.response.MessageResponse;
import com.modle.domain.message.service.MessageService;
import com.modle.global.auth.SecurityUser;
import com.modle.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/conversations")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MessageConversationResponse> createConversation(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody CreateConversationRequest request
    ) {
        return ApiResponse.ok(
                "대화방이 생성되었습니다.",
                messageService.createConversation(user.getId(), request)
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MessageResponse> sendMessage(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody SendMessageRequest request
    ) {
        return ApiResponse.ok(
                "쪽지를 전송했습니다.",
                messageService.sendMessage(user.getId(), request)
        );
    }

    @GetMapping("/conversations")
    public ApiResponse<MessageInboxResponse> getConversations(
            @AuthenticationPrincipal SecurityUser user
    ) {
        return ApiResponse.ok(
                "대화 목록 조회 성공",
                messageService.getConversations(user.getId())
        );
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ApiResponse<ConversationMessagesResponse> getConversationMessages(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long conversationId,
            Pageable pageable
    ) {
        return ApiResponse.ok(
                "대화방 메시지 조회 성공",
                messageService.getConversationMessages(user.getId(), conversationId, pageable)
        );
    }

    @PatchMapping("/read")
    public ApiResponse<Integer> markConversationAsRead(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody ReadConversationRequest request
    ) {
        return ApiResponse.ok(
                "읽음 처리되었습니다.",
                messageService.markConversationAsRead(user.getId(), request.conversationId())
        );
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ApiResponse<Void> deleteConversation(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long conversationId
    ) {
        messageService.deleteConversation(user.getId(), conversationId);
        return ApiResponse.ok("대화방이 삭제되었습니다.");
    }
}
