package com.modle.domain.message.controller;

import com.modle.domain.message.dto.request.CreateConversationRequest;
import com.modle.domain.message.dto.request.SendMessageRequest;
import com.modle.domain.message.dto.request.ReadConversationRequest;
import com.modle.domain.message.dto.response.MessageConversationResponse;
import com.modle.domain.message.dto.response.MessageResponse;
import com.modle.domain.message.dto.response.MessagePageResponse;
import com.modle.domain.message.service.MessageService;
import com.modle.global.auth.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
    public MessageConversationResponse createConversation(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody CreateConversationRequest request
    ) {
        return messageService.createConversation(user.getId(), request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendMessage(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody SendMessageRequest request
    ) {
        return messageService.sendMessage(user.getId(), request);
    }

    @GetMapping
    public MessagePageResponse getInbox(
            @AuthenticationPrincipal SecurityUser user,
            Pageable pageable
    ) {
        return messageService.getInbox(user.getId(), pageable);
    }

    @PatchMapping("/read")
    public int markConversationAsRead(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody ReadConversationRequest request
    ) {
        return messageService.markConversationAsRead(
                user.getId(),
                request.conversationId()
        );
    }
}
