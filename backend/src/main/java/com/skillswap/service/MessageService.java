package com.skillswap.service;

import com.skillswap.dto.ConversationResponse;
import com.skillswap.dto.CreateMessageRequest;
import com.skillswap.dto.MessageResponse;
import com.skillswap.entity.ExchangeRequest;
import com.skillswap.entity.Message;
import com.skillswap.entity.Notification;
import com.skillswap.entity.User;
import com.skillswap.enums.ExchangeRequestStatus;
import com.skillswap.enums.NotificationType;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.ExchangeRequestRepository;
import com.skillswap.repository.MessageRepository;
import com.skillswap.repository.NotificationRepository;
import com.skillswap.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final ExchangeRequestRepository exchangeRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public MessageService(
            MessageRepository messageRepository,
            ExchangeRequestRepository exchangeRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository) {
        this.messageRepository = messageRepository;
        this.exchangeRepository = exchangeRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public ConversationResponse getConversation(Long exchangeId, String email) {
        User user = findUser(email);
        ExchangeRequest exchange = requireConversation(exchangeId, user);
        User partner =
                exchange.getSender().getId().equals(user.getId()) ? exchange.getReceiver() : exchange.getSender();
        return new ConversationResponse(
                exchange.getId(),
                user.getId(),
                partner.getId(),
                partner.getName(),
                exchange.getOfferedSkill().getName(),
                exchange.getWantedSkill().getName(),
                messageRepository.findByExchangeRequestIdOrderBySentAtAsc(exchangeId).stream()
                        .map(MessageResponse::from)
                        .toList());
    }

    @Transactional
    public MessageResponse send(Long exchangeId, String email, CreateMessageRequest input) {
        User user = findUser(email);
        ExchangeRequest exchange = requireConversation(exchangeId, user);
        Message message = new Message();
        message.setExchangeRequest(exchange);
        message.setSender(user);
        message.setContent(input.content().trim());
        Message savedMessage = messageRepository.save(message);
        User recipient =
                exchange.getSender().getId().equals(user.getId()) ? exchange.getReceiver() : exchange.getSender();
        notifyRecipient(recipient, user, exchange.getId());
        return MessageResponse.from(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<String> getParticipantEmails(Long exchangeId, String email) {
        User user = findUser(email);
        ExchangeRequest exchange = requireConversation(exchangeId, user);
        return List.of(exchange.getSender().getEmail(), exchange.getReceiver().getEmail());
    }

    private ExchangeRequest requireConversation(Long exchangeId, User user) {
        ExchangeRequest exchange = exchangeRepository
                .findById(exchangeId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found."));
        boolean participant = exchange.getSender().getId().equals(user.getId())
                || exchange.getReceiver().getId().equals(user.getId());
        if (!participant) throw new ResourceNotFoundException("Conversation not found.");
        if (exchange.getStatus() != ExchangeRequestStatus.ACCEPTED
                && exchange.getStatus() != ExchangeRequestStatus.COMPLETED) {
            throw new BadRequestException("Chat is available after an exchange is accepted.");
        }
        return exchange;
    }

    private User findUser(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private void notifyRecipient(User recipient, User sender, Long exchangeId) {
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setMessage(sender.getName() + " sent you a new message.");
        notification.setType(NotificationType.MESSAGE_RECEIVED);
        notification.setReferenceId(exchangeId);
        notificationRepository.save(notification);
    }
}
