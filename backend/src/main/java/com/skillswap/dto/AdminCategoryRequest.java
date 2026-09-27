package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCategoryRequest(
        @NotBlank(message = "Category name is required.")
        @Size(max = 100, message = "Category name must be 100 characters or fewer.")
        String name,

        @Size(max = 300, message = "Description must be 300 characters or fewer.")
        String description) {}
