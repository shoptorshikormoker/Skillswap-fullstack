package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMessageRequest(
        @NotBlank(message = "Message cannot be empty.")
        @Size(max = 1000, message = "Message must be 1000 characters or fewer.")
        String content) {}
