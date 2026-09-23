package com.skillswap.service;

import com.skillswap.dto.CategoryResponse;
import com.skillswap.dto.SkillResponse;
import com.skillswap.repository.CategoryRepository;
import com.skillswap.repository.SkillRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SkillCatalogService {

    private final CategoryRepository categoryRepository;
    private final SkillRepository skillRepository;

    public SkillCatalogService(CategoryRepository categoryRepository, SkillRepository skillRepository) {
        this.categoryRepository = categoryRepository;
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        Map<Long, List<SkillResponse>> skillsByCategory = skillRepository.findAllByOrderByNameAsc().stream()
                .map(SkillResponse::from)
                .collect(Collectors.groupingBy(SkillResponse::categoryId));

        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(category ->
                        CategoryResponse.from(category, skillsByCategory.getOrDefault(category.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getSkills() {
        return skillRepository.findAllByOrderByNameAsc().stream()
                .map(SkillResponse::from)
                .toList();
    }
}
