package com.skillswap.dto;

import com.skillswap.entity.Skill;

public record SkillResponse(Long id, String name, String description, Long categoryId, String categoryName) {

    public static SkillResponse from(Skill skill) {
        return new SkillResponse(
                skill.getId(),
                skill.getName(),
                skill.getDescription(),
                skill.getCategory().getId(),
                skill.getCategory().getName());
    }
}
