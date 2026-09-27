package com.skillswap.controller;

import com.skillswap.dto.ConversationResponse;
import com.skillswap.dto.CreateMessageRequest;
import com.skillswap.dto.MessageResponse;
import com.skillswap.service.MessageService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages/exchanges/{exchangeId}")
public class MessageController {
    private final MessageService service;

    public MessageController(MessageService service) {
        this.service = service;
    }

    @GetMapping
    public ConversationResponse get(@PathVariable Long exchangeId, Principal principal) {
        return service.getConversation(exchangeId, principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse send(
            @PathVariable Long exchangeId, Principal principal, @Valid @RequestBody CreateMessageRequest request) {
        return service.send(exchangeId, principal.getName(), request);
    }
}
