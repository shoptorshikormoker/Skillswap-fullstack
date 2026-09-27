package com.skillswap.dto;

import com.skillswap.entity.Message;
import java.time.LocalDateTime;

public record MessageResponse(
        Long id, Long exchangeRequestId, Long senderId, String senderName, String content, LocalDateTime sentAt) {
    public static MessageResponse from(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getExchangeRequest().getId(),
                message.getSender().getId(),
                message.getSender().getName(),
                message.getContent(),
                message.getSentAt());
    }
}
