package com.skillswap.dto;

import java.util.List;

public record ConversationResponse(
        Long exchangeRequestId,
        Long currentUserId,
        Long partnerId,
        String partnerName,
        String offeredSkillName,
        String wantedSkillName,
        List<MessageResponse> messages) {}
