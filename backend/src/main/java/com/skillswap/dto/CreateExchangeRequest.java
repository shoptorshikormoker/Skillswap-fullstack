package com.skillswap.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateExchangeRequest(
        @NotNull(message = "Choose a skill partner.")
        Long receiverId,
        @NotNull(message = "Choose a skill to offer.")
        Long offeredSkillId,
        @NotNull(message = "Choose a skill to learn.")
        Long wantedSkillId,

        @Size(max = 500, message = "Message must be 500 characters or fewer.")
        String message) {}
