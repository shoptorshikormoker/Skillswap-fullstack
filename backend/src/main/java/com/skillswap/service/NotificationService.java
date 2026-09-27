package com.skillswap.service;

import com.skillswap.dto.NotificationListResponse;
import com.skillswap.dto.NotificationResponse;
import com.skillswap.entity.Notification;
import com.skillswap.entity.User;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.NotificationRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public NotificationListResponse getMine(String email) {
        User user = findUser(email);
        return new NotificationListResponse(
                notificationRepository.countByUserIdAndReadFalse(user.getId()),
                notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                        .map(NotificationResponse::from)
                        .toList());
    }

    @Transactional
    public NotificationResponse markRead(Long id, String email) {
        User user = findUser(email);
        Notification notification = notificationRepository
                .findById(id)
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        notification.setRead(true);
        return NotificationResponse.from(notification);
    }

    @Transactional
    public void markAllRead(String email) {
        User user = findUser(email);
        notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(notification -> !notification.isRead())
                .forEach(notification -> notification.setRead(true));
    }

    private User findUser(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }
}
