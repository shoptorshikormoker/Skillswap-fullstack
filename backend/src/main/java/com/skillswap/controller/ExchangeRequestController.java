package com.skillswap.controller;

import com.skillswap.dto.CreateExchangeRequest;
import com.skillswap.dto.ExchangeRequestResponse;
import com.skillswap.service.ExchangeRequestService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exchange-requests")
public class ExchangeRequestController {
    private final ExchangeRequestService service;

    public ExchangeRequestController(ExchangeRequestService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExchangeRequestResponse send(Principal principal, @Valid @RequestBody CreateExchangeRequest request) {
        return service.send(principal.getName(), request);
    }

    @GetMapping("/received")
    public List<ExchangeRequestResponse> received(Principal principal) {
        return service.received(principal.getName());
    }

    @GetMapping("/sent")
    public List<ExchangeRequestResponse> sent(Principal principal) {
        return service.sent(principal.getName());
    }

    @PostMapping("/{id}/accept")
    public ExchangeRequestResponse accept(@PathVariable Long id, Principal principal) {
        return service.accept(id, principal.getName());
    }

    @PostMapping("/{id}/reject")
    public ExchangeRequestResponse reject(@PathVariable Long id, Principal principal) {
        return service.reject(id, principal.getName());
    }

    @PostMapping("/{id}/cancel")
    public ExchangeRequestResponse cancel(@PathVariable Long id, Principal principal) {
        return service.cancel(id, principal.getName());
    }
}
