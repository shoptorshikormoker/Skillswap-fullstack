package com.skillswap.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record UpdateSessionRequest(
        @NotNull(message = "Choose a session date and time.")
        @Future(message = "Session time must be in the future.")
        LocalDateTime scheduledAt,

        @Pattern(regexp = "^$|^https?://.+", message = "Meeting link must start with http:// or https://")
        @Size(max = 500, message = "Meeting link must be 500 characters or fewer.")
        String meetingUrl,

        @Size(max = 200, message = "Location must be 200 characters or fewer.")
        String location,

        @Size(max = 1000, message = "Agenda must be 1000 characters or fewer.")
        String agenda) {}
