package com.modle.domain.message.controller;

import com.modle.domain.message.service.MessageService;
import com.modle.global.auth.SecurityUser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MessageControllerTest {

    @Mock
    private MessageService messageService;

    @InjectMocks
    private MessageController messageController;

    @Test
    void markConversationAsRead_인증사용자와대화문맥전달() throws Exception {
        SecurityUser user = new SecurityUser(1L, "client@example.com", "CLIENT");
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(messageController)
                .setCustomArgumentResolvers(authenticationPrincipalResolver(user))
                .build();
        given(messageService.markConversationAsRead(1L, 100L)).willReturn(3);

        mockMvc.perform(patch("/api/v1/messages/read")
                        .contentType("application/json")
                        .content("""
                                {
                                  "conversationId": 100
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().json("3"));

        verify(messageService).markConversationAsRead(1L, 100L);
    }

    private HandlerMethodArgumentResolver authenticationPrincipalResolver(SecurityUser user) {
        return new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(
                    MethodParameter parameter,
                    ModelAndViewContainer mavContainer,
                    NativeWebRequest webRequest,
                    WebDataBinderFactory binderFactory
            ) {
                return user;
            }
        };
    }
}
