package com.skillswap.service;

import com.skillswap.dto.AdminCategoryRequest;
import com.skillswap.dto.AdminUserResponse;
import com.skillswap.dto.CategoryResponse;
import com.skillswap.entity.Category;
import com.skillswap.entity.User;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.CategoryRepository;
import com.skillswap.repository.SkillRepository;
import com.skillswap.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SkillRepository skillRepository;

    public AdminService(
            UserRepository userRepository, CategoryRepository categoryRepository, SkillRepository skillRepository) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    @Transactional
    public AdminUserResponse setUserEnabled(Long userId, boolean enabled, String adminEmail) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found."));
        if (user.getEmail().equalsIgnoreCase(adminEmail) && !enabled) {
            throw new BadRequestException("You cannot disable your own admin account.");
        }
        user.setEnabled(enabled);
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public CategoryResponse createCategory(AdminCategoryRequest request) {
        String name = request.name().trim();
        if (categoryRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new BadRequestException("A category with this name already exists.");
        }
        Category category = new Category();
        applyCategory(category, request);
        return CategoryResponse.from(categoryRepository.save(category), List.of());
    }

    @Transactional
    public CategoryResponse updateCategory(Long categoryId, AdminCategoryRequest request) {
        Category category = findCategory(categoryId);
        categoryRepository
                .findByNameIgnoreCase(request.name().trim())
                .filter(item -> !item.getId().equals(categoryId))
                .ifPresent(item -> {
                    throw new BadRequestException("A category with this name already exists.");
                });
        applyCategory(category, request);
        return CategoryResponse.from(categoryRepository.save(category), List.of());
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = findCategory(categoryId);
        if (skillRepository.existsByCategoryId(categoryId)) {
            throw new BadRequestException("Move or remove this category's skills before deleting it.");
        }
        categoryRepository.delete(category);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found."));
    }

    private void applyCategory(Category category, AdminCategoryRequest request) {
        category.setName(request.name().trim());
        category.setDescription(
                request.description() == null ? null : request.description().trim());
    }
}
