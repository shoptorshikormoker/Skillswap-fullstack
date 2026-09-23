package com.skillswap.dto;

import com.skillswap.enums.SkillLevel;
import com.skillswap.enums.SkillType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserSkillRequest(
        @NotNull(message = "Select a skill")
        Long skillId,

        @NotNull(message = "Select TEACH or LEARN")
        SkillType skillType,

        @NotNull(message = "Select a skill level")
        SkillLevel level,

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description) {}
