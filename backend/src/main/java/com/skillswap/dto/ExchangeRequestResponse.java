package com.skillswap.dto;

import com.skillswap.entity.ExchangeRequest;
import com.skillswap.enums.ExchangeRequestStatus;
import java.time.LocalDateTime;

public record ExchangeRequestResponse(
        Long id,
        Long senderId,
        String senderName,
        Long receiverId,
        String receiverName,
        Long offeredSkillId,
        String offeredSkillName,
        Long wantedSkillId,
        String wantedSkillName,
        String message,
        ExchangeRequestStatus status,
        LocalDateTime createdAt) {
    public static ExchangeRequestResponse from(ExchangeRequest request) {
        return new ExchangeRequestResponse(
                request.getId(),
                request.getSender().getId(),
                request.getSender().getName(),
                request.getReceiver().getId(),
                request.getReceiver().getName(),
                request.getOfferedSkill().getId(),
                request.getOfferedSkill().getName(),
                request.getWantedSkill().getId(),
                request.getWantedSkill().getName(),
                request.getMessage(),
                request.getStatus(),
                request.getCreatedAt());
    }
}
