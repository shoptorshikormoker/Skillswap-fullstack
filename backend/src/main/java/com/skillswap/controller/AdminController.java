package com.skillswap.controller;

import com.skillswap.dto.AdminCategoryRequest;
import com.skillswap.dto.AdminUserResponse;
import com.skillswap.dto.CategoryResponse;
import com.skillswap.service.AdminService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {
        return adminService.getUsers();
    }

    @PatchMapping("/users/{userId}/enabled")
    public AdminUserResponse setUserEnabled(
            @PathVariable Long userId, @RequestBody boolean enabled, Principal principal) {
        return adminService.setUserEnabled(userId, enabled, principal.getName());
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(
        @Valid
        @RequestBody
        AdminCategoryRequest request) {
        return adminService.createCategory(request);
    }

    @PutMapping("/categories/{categoryId}")
    public CategoryResponse updateCategory(
            @PathVariable Long categoryId, @Valid @RequestBody AdminCategoryRequest request) {
        return adminService.updateCategory(categoryId, request);
    }

    @DeleteMapping("/categories/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long categoryId) {
        adminService.deleteCategory(categoryId);
    }
}
