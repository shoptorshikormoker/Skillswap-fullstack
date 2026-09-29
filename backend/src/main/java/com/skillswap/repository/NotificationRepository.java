package com.skillswap.repository;

import com.skillswap.entity.Notification;
import com.skillswap.enums.NotificationType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndReadFalse(Long userId);

    List<Notification> findByUserIdAndTypeAndReferenceIdAndReadFalse(
            Long userId, NotificationType type, Long referenceId);
}
