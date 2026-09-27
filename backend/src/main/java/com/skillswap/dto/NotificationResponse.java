package com.skillswap.dto;

import com.skillswap.entity.Notification;
import com.skillswap.enums.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id, String message, NotificationType type, Long referenceId, boolean read, LocalDateTime createdAt) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceId(),
                notification.isRead(),
                notification.getCreatedAt());
    }
}
