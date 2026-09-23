package com.skillswap.dto;

import com.skillswap.entity.UserSkill;
import com.skillswap.enums.SkillLevel;
import com.skillswap.enums.SkillType;

public record UserSkillResponse(
        Long id,
        Long userId,
        Long skillId,
        String skillName,
        Long categoryId,
        String categoryName,
        SkillType skillType,
        SkillLevel level,
        String description) {

    public static UserSkillResponse from(UserSkill userSkill) {
        return new UserSkillResponse(
                userSkill.getId(),
                userSkill.getUser().getId(),
                userSkill.getSkill().getId(),
                userSkill.getSkill().getName(),
                userSkill.getSkill().getCategory().getId(),
                userSkill.getSkill().getCategory().getName(),
                userSkill.getSkillType(),
                userSkill.getLevel(),
                userSkill.getDescription());
    }
}
