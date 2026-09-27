package com.skillswap.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReviewRequest(
        @NotNull
        Long sessionId,

        @NotNull
        @Min(value = 1, message = "Rating must be between 1 and 5.") @Max(value = 5, message = "Rating must be between 1 and 5.")
        Integer rating,

        @Size(max = 1000, message = "Comment must be 1000 characters or fewer.")
        String comment) {}
