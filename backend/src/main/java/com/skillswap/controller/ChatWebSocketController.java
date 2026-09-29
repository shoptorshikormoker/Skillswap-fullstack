package com.skillswap.controller;

import com.skillswap.dto.CreateMessageRequest;
import com.skillswap.dto.MessageResponse;
import com.skillswap.service.MessageService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/exchanges/{exchangeId}/messages")
    public void send(@DestinationVariable Long exchangeId, Principal principal, @Valid CreateMessageRequest request) {
        MessageResponse message = messageService.send(exchangeId, principal.getName(), request);
        for (String participantEmail : messageService.getParticipantEmails(exchangeId, principal.getName())) {
            messagingTemplate.convertAndSendToUser(participantEmail, "/queue/exchanges/" + exchangeId, message);
        }
    }
}
