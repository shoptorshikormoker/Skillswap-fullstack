package com.skillswap.dto;

import com.skillswap.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 1000, message = "Biography cannot exceed 1000 characters")
        String bio,

        @Size(max = 100, message = "Location cannot exceed 100 characters")
        String location,

        @Size(max = 500, message = "Photo URL cannot exceed 500 characters")
        @Pattern(regexp = "^$|^https?://.+", message = "Photo URL must start with http:// or https://")
        String photoUrl,

        Gender gender,

        @Size(max = 200, message = "Availability cannot exceed 200 characters")
        String availability) {}
