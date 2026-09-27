package com.skillswap.service;

import com.skillswap.dto.CreateReviewRequest;
import com.skillswap.dto.ProfileReviewsResponse;
import com.skillswap.dto.ReviewResponse;
import com.skillswap.entity.ExchangeRequest;
import com.skillswap.entity.LearningSession;
import com.skillswap.entity.Review;
import com.skillswap.entity.User;
import com.skillswap.enums.SessionStatus;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.LearningSessionRepository;
import com.skillswap.repository.ReviewRepository;
import com.skillswap.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final LearningSessionRepository sessionRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            LearningSessionRepository sessionRepository,
            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse create(String email, CreateReviewRequest input) {
        User reviewer = findUserByEmail(email);
        LearningSession session = sessionRepository
                .findById(input.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Learning session not found."));
        ExchangeRequest exchange = session.getExchangeRequest();
        User reviewedUser = otherParticipant(exchange, reviewer);

        if (session.getStatus() != SessionStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted after a completed session.");
        }
        if (reviewRepository.existsByLearningSessionIdAndReviewerId(session.getId(), reviewer.getId())) {
            throw new BadRequestException("You have already reviewed this session.");
        }

        Review review = new Review();
        review.setLearningSession(session);
        review.setReviewer(reviewer);
        review.setReviewedUser(reviewedUser);
        review.setRating(input.rating());
        review.setComment(clean(input.comment()));
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMine(String email) {
        User reviewer = findUserByEmail(email);
        return reviewRepository.findByReviewerIdOrderByCreatedAtDesc(reviewer.getId()).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProfileReviewsResponse getForProfile(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Profile not found.");
        }
        List<ReviewResponse> reviews = reviewRepository.findByReviewedUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ReviewResponse::from)
                .toList();
        double average =
                reviews.stream().mapToInt(ReviewResponse::rating).average().orElse(0);
        return new ProfileReviewsResponse(Math.round(average * 10.0) / 10.0, reviews.size(), reviews);
    }

    private User otherParticipant(ExchangeRequest exchange, User reviewer) {
        if (exchange.getSender().getId().equals(reviewer.getId())) {
            return exchange.getReceiver();
        }
        if (exchange.getReceiver().getId().equals(reviewer.getId())) {
            return exchange.getSender();
        }
        throw new ResourceNotFoundException("Learning session not found.");
    }

    private User findUserByEmail(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
