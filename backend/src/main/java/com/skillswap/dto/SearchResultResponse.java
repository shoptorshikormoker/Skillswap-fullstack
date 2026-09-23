package com.skillswap.dto;

import java.util.List;

public record SearchResultResponse(
        Long userId, String name, String bio, String location, String photoUrl, List<SkillResponse> matchingSkills) {}
