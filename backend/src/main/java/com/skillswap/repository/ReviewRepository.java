package com.skillswap.repository;

import com.skillswap.entity.Review;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByLearningSessionIdAndReviewerId(Long sessionId, Long reviewerId);

    List<Review> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId);

    List<Review> findByReviewedUserIdOrderByCreatedAtDesc(Long reviewedUserId);
}
