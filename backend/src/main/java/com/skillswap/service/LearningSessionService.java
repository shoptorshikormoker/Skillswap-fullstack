package com.skillswap.service;

import com.skillswap.dto.CreateSessionRequest;
import com.skillswap.dto.SessionResponse;
import com.skillswap.dto.UpdateSessionRequest;
import com.skillswap.entity.ExchangeRequest;
import com.skillswap.entity.LearningSession;
import com.skillswap.entity.Notification;
import com.skillswap.entity.User;
import com.skillswap.enums.ExchangeRequestStatus;
import com.skillswap.enums.NotificationType;
import com.skillswap.enums.SessionStatus;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.ExchangeRequestRepository;
import com.skillswap.repository.LearningSessionRepository;
import com.skillswap.repository.NotificationRepository;
import com.skillswap.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LearningSessionService {
    private final LearningSessionRepository sessionRepository;
    private final ExchangeRequestRepository exchangeRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public LearningSessionService(
            LearningSessionRepository sessionRepository,
            ExchangeRequestRepository exchangeRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository) {
        this.sessionRepository = sessionRepository;
        this.exchangeRepository = exchangeRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public SessionResponse create(String email, CreateSessionRequest input) {
        User user = findUser(email);
        ExchangeRequest exchange = findExchange(input.exchangeRequestId());
        requireParticipant(exchange, user);
        if (exchange.getStatus() != ExchangeRequestStatus.ACCEPTED) {
            throw new BadRequestException("Sessions can only be scheduled for accepted exchanges.");
        }
        if (sessionRepository.existsByExchangeRequestId(exchange.getId())) {
            throw new BadRequestException("This exchange already has a learning session.");
        }
        LearningSession session = new LearningSession();
        session.setExchangeRequest(exchange);
        apply(session, input.scheduledAt(), input.meetingUrl(), input.location(), input.agenda());
        session = sessionRepository.save(session);
        notifyOther(
                exchange, user, " scheduled a learning session.", NotificationType.SESSION_SCHEDULED, session.getId());
        return SessionResponse.from(session);
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getMine(String email) {
        return sessionRepository.findAllForParticipant(findUser(email).getId()).stream()
                .map(SessionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionResponse getOne(Long id, String email) {
        User user = findUser(email);
        LearningSession session = findSession(id);
        requireParticipant(session.getExchangeRequest(), user);
        return SessionResponse.from(session);
    }

    @Transactional
    public SessionResponse update(Long id, String email, UpdateSessionRequest input) {
        User user = findUser(email);
        LearningSession session = findSession(id);
        requireParticipant(session.getExchangeRequest(), user);
        requireScheduled(session);
        apply(session, input.scheduledAt(), input.meetingUrl(), input.location(), input.agenda());
        notifyOther(
                session.getExchangeRequest(),
                user,
                " updated your learning session.",
                NotificationType.SESSION_UPDATED,
                id);
        return SessionResponse.from(sessionRepository.save(session));
    }

    @Transactional
    public SessionResponse complete(Long id, String email) {
        User user = findUser(email);
        LearningSession session = findSession(id);
        requireParticipant(session.getExchangeRequest(), user);
        requireScheduled(session);
        if (session.getScheduledAt().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("A session cannot be completed before its scheduled time.");
        }
        session.setStatus(SessionStatus.COMPLETED);
        session.getExchangeRequest().setStatus(ExchangeRequestStatus.COMPLETED);
        exchangeRepository.save(session.getExchangeRequest());
        notifyOther(
                session.getExchangeRequest(),
                user,
                " marked your learning session as completed.",
                NotificationType.SESSION_COMPLETED,
                id);
        return SessionResponse.from(sessionRepository.save(session));
    }

    @Transactional
    public SessionResponse cancel(Long id, String email) {
        User user = findUser(email);
        LearningSession session = findSession(id);
        requireParticipant(session.getExchangeRequest(), user);
        requireScheduled(session);
        session.setStatus(SessionStatus.CANCELLED);
        notifyOther(
                session.getExchangeRequest(),
                user,
                " cancelled your learning session.",
                NotificationType.SESSION_CANCELLED,
                id);
        return SessionResponse.from(sessionRepository.save(session));
    }

    private void apply(
            LearningSession session, LocalDateTime scheduledAt, String meetingUrl, String location, String agenda) {
        session.setScheduledAt(scheduledAt);
        session.setMeetingUrl(clean(meetingUrl));
        session.setLocation(clean(location));
        session.setAgenda(clean(agenda));
    }

    private void requireParticipant(ExchangeRequest exchange, User user) {
        if (!exchange.getSender().getId().equals(user.getId())
                && !exchange.getReceiver().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Learning session not found.");
        }
    }

    private void requireScheduled(LearningSession session) {
        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new BadRequestException("Only scheduled sessions can be changed.");
        }
    }

    private User findUser(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private ExchangeRequest findExchange(Long id) {
        return exchangeRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exchange request not found."));
    }

    private LearningSession findSession(Long id) {
        return sessionRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning session not found."));
    }

    private void notifyOther(
            ExchangeRequest exchange, User actor, String text, NotificationType type, Long referenceId) {
        User other = exchange.getSender().getId().equals(actor.getId()) ? exchange.getReceiver() : exchange.getSender();
        Notification notification = new Notification();
        notification.setUser(other);
        notification.setMessage(actor.getName() + text);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notificationRepository.save(notification);
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
