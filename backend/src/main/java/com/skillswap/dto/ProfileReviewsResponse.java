package com.skillswap.dto;

import java.util.List;

public record ProfileReviewsResponse(double averageRating, int reviewCount, List<ReviewResponse> reviews) {}
