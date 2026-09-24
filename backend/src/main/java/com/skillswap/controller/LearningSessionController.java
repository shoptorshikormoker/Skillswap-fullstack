package com.skillswap.controller;

import com.skillswap.dto.CreateSessionRequest;
import com.skillswap.dto.SessionResponse;
import com.skillswap.dto.UpdateSessionRequest;
import com.skillswap.service.LearningSessionService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sessions")
public class LearningSessionController {
    private final LearningSessionService service;

    public LearningSessionController(LearningSessionService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse create(Principal principal, @Valid @RequestBody CreateSessionRequest request) {
        return service.create(principal.getName(), request);
    }

    @GetMapping
    public List<SessionResponse> getMine(Principal principal) {
        return service.getMine(principal.getName());
    }

    @GetMapping("/{id}")
    public SessionResponse getOne(@PathVariable Long id, Principal principal) {
        return service.getOne(id, principal.getName());
    }

    @PutMapping("/{id}")
    public SessionResponse update(
            @PathVariable Long id, Principal principal, @Valid @RequestBody UpdateSessionRequest request) {
        return service.update(id, principal.getName(), request);
    }

    @PostMapping("/{id}/complete")
    public SessionResponse complete(@PathVariable Long id, Principal principal) {
        return service.complete(id, principal.getName());
    }

    @PostMapping("/{id}/cancel")
    public SessionResponse cancel(@PathVariable Long id, Principal principal) {
        return service.cancel(id, principal.getName());
    }
}
