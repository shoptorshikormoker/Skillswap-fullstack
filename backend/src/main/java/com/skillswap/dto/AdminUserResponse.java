package com.skillswap.dto;

import com.skillswap.entity.User;
import com.skillswap.enums.Role;
import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id, String name, String email, Role role, boolean enabled, LocalDateTime createdAt) {

    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isEnabled(), user.getCreatedAt());
    }
}
