package com.skillswap.dto;

import com.skillswap.entity.Category;
import java.util.List;

public record CategoryResponse(Long id, String name, String description, List<SkillResponse> skills) {

    public static CategoryResponse from(Category category, List<SkillResponse> skills) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription(), skills);
    }
}
