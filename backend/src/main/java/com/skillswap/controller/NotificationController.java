package com.skillswap.controller;

import com.skillswap.dto.NotificationListResponse;
import com.skillswap.dto.NotificationResponse;
import com.skillswap.service.NotificationService;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public NotificationListResponse getMine(Principal principal) {
        return service.getMine(principal.getName());
    }

    @PostMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id, Principal principal) {
        return service.markRead(id, principal.getName());
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(Principal principal) {
        service.markAllRead(principal.getName());
    }
}
