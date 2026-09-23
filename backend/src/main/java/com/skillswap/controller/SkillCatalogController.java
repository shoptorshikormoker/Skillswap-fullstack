package com.skillswap.controller;

import com.skillswap.dto.CategoryResponse;
import com.skillswap.dto.SkillResponse;
import com.skillswap.service.SkillCatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SkillCatalogController {

    private final SkillCatalogService skillCatalogService;

    public SkillCatalogController(SkillCatalogService skillCatalogService) {
        this.skillCatalogService = skillCatalogService;
    }

    @GetMapping("/categories")
    public List<CategoryResponse> getCategories() {
        return skillCatalogService.getCategories();
    }

    @GetMapping("/skills")
    public List<SkillResponse> getSkills() {
        return skillCatalogService.getSkills();
    }
}
