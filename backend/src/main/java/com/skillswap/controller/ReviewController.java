package com.skillswap.controller;

import com.skillswap.dto.CreateReviewRequest;
import com.skillswap.dto.ProfileReviewsResponse;
import com.skillswap.dto.ReviewResponse;
import com.skillswap.service.ReviewService;
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
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(Principal principal, @Valid @RequestBody CreateReviewRequest request) {
        return service.create(principal.getName(), request);
    }

    @GetMapping("/mine")
    public List<ReviewResponse> getMine(Principal principal) {
        return service.getMine(principal.getName());
    }

    @GetMapping("/users/{userId}")
    public ProfileReviewsResponse getForProfile(@PathVariable Long userId) {
        return service.getForProfile(userId);
    }
}
