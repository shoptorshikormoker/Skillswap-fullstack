package com.skillswap.dto;

import com.skillswap.enums.Gender;
import java.util.List;

public record SearchResultResponse(
        Long userId,
        String name,
        String bio,
        String location,
        String photoUrl,
        Gender gender,
        List<SkillResponse> matchingSkills) {}
