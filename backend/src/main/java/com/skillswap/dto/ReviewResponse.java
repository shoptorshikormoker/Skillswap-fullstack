package com.skillswap.dto;

import com.skillswap.entity.Review;
import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long sessionId,
        Long reviewerId,
        String reviewerName,
        Long reviewedUserId,
        int rating,
        String comment,
        LocalDateTime createdAt) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getLearningSession().getId(),
                review.getReviewer().getId(),
                review.getReviewer().getName(),
                review.getReviewedUser().getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt());
    }
}
