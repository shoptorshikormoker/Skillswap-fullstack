package com.skillswap.dto;

import com.skillswap.entity.ExchangeRequest;
import com.skillswap.entity.LearningSession;
import com.skillswap.enums.SessionStatus;
import java.time.LocalDateTime;

public record SessionResponse(
        Long id,
        Long exchangeRequestId,
        Long senderId,
        String senderName,
        Long receiverId,
        String receiverName,
        String offeredSkillName,
        String wantedSkillName,
        LocalDateTime scheduledAt,
        String meetingUrl,
        String location,
        String agenda,
        SessionStatus status) {
    public static SessionResponse from(LearningSession session) {
        ExchangeRequest exchange = session.getExchangeRequest();
        return new SessionResponse(
                session.getId(),
                exchange.getId(),
                exchange.getSender().getId(),
                exchange.getSender().getName(),
                exchange.getReceiver().getId(),
                exchange.getReceiver().getName(),
                exchange.getOfferedSkill().getName(),
                exchange.getWantedSkill().getName(),
                session.getScheduledAt(),
                session.getMeetingUrl(),
                session.getLocation(),
                session.getAgenda(),
                session.getStatus());
    }
}
