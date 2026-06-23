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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "쪽지", description = "대화방·쪽지 송수신 API")
public class MessageController {

    private final MessageService messageService;

    @Operation(summary = "대화방 생성", description = "상대방과의 대화방을 생성합니다.")
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

    @Operation(summary = "쪽지 전송", description = "대화방에 쪽지를 전송합니다.")
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

    @Operation(summary = "대화 목록 조회", description = "본인이 참여 중인 대화방 목록을 조회합니다.")
    @GetMapping("/conversations")
    public ApiResponse<MessageInboxResponse> getConversations(
            @AuthenticationPrincipal SecurityUser user
    ) {
        return ApiResponse.ok(
                "대화 목록 조회 성공",
                messageService.getConversations(user.getId())
        );
    }

    @Operation(summary = "대화방 메시지 조회", description = "특정 대화방의 쪽지 목록을 페이징 조회합니다.")
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

    @Operation(summary = "대화방 읽음 처리", description = "특정 대화방의 안 읽은 쪽지를 읽음 처리합니다.")
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

    @Operation(summary = "대화방 삭제", description = "특정 대화방을 삭제합니다.")
    @DeleteMapping("/conversations/{conversationId}")
    public ApiResponse<Void> deleteConversation(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable Long conversationId
    ) {
        messageService.deleteConversation(user.getId(), conversationId);
        return ApiResponse.ok("대화방이 삭제되었습니다.");
    }
}
