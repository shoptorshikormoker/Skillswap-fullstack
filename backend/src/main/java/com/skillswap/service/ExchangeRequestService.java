package com.skillswap.service;

import com.skillswap.dto.CreateExchangeRequest;
import com.skillswap.dto.ExchangeRequestResponse;
import com.skillswap.entity.ExchangeRequest;
import com.skillswap.entity.Notification;
import com.skillswap.entity.Skill;
import com.skillswap.entity.User;
import com.skillswap.enums.ExchangeRequestStatus;
import com.skillswap.enums.NotificationType;
import com.skillswap.enums.SkillType;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.ExchangeRequestRepository;
import com.skillswap.repository.NotificationRepository;
import com.skillswap.repository.SkillRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.repository.UserSkillRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExchangeRequestService {
    private final ExchangeRequestRepository exchangeRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    public ExchangeRequestService(
            ExchangeRequestRepository exchangeRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository) {
        this.exchangeRepository = exchangeRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
    }

    @Transactional
    public ExchangeRequestResponse send(String email, CreateExchangeRequest input) {
        User sender = findUser(email);
        User receiver = userRepository
                .findById(input.receiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill partner not found."));
        if (sender.getId().equals(receiver.getId())) {
            throw new BadRequestException("You cannot send an exchange request to yourself.");
        }
        Skill offered = findSkill(input.offeredSkillId());
        Skill wanted = findSkill(input.wantedSkillId());
        requireUserSkill(
                sender.getId(), offered.getId(), SkillType.TEACH, "You can only offer a skill from your share list.");
        requireUserSkill(
                sender.getId(), wanted.getId(), SkillType.LEARN, "You can only request a skill from your learn list.");
        requireUserSkill(
                receiver.getId(), wanted.getId(), SkillType.TEACH, "This member does not share the requested skill.");
        requireUserSkill(
                receiver.getId(),
                offered.getId(),
                SkillType.LEARN,
                "This member is not looking to learn the offered skill.");
        if (exchangeRepository.existsBySenderIdAndReceiverIdAndOfferedSkillIdAndWantedSkillIdAndStatus(
                sender.getId(), receiver.getId(), offered.getId(), wanted.getId(), ExchangeRequestStatus.PENDING)) {
            throw new BadRequestException("A matching pending request already exists.");
        }

        ExchangeRequest request = new ExchangeRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setOfferedSkill(offered);
        request.setWantedSkill(wanted);
        request.setMessage(clean(input.message()));
        request = exchangeRepository.save(request);
        notify(
                receiver,
                sender.getName() + " sent you a skill exchange request.",
                NotificationType.EXCHANGE_RECEIVED,
                request.getId());
        return ExchangeRequestResponse.from(request);
    }

    @Transactional(readOnly = true)
    public List<ExchangeRequestResponse> received(String email) {
        return exchangeRepository
                .findByReceiverIdOrderByCreatedAtDesc(findUser(email).getId())
                .stream()
                .map(ExchangeRequestResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExchangeRequestResponse> sent(String email) {
        return exchangeRepository
                .findBySenderIdOrderByCreatedAtDesc(findUser(email).getId())
                .stream()
                .map(ExchangeRequestResponse::from)
                .toList();
    }

    @Transactional
    public ExchangeRequestResponse accept(Long id, String email) {
        return respond(
                id,
                email,
                ExchangeRequestStatus.ACCEPTED,
                NotificationType.EXCHANGE_ACCEPTED,
                " accepted your exchange request.");
    }

    @Transactional
    public ExchangeRequestResponse reject(Long id, String email) {
        return respond(
                id,
                email,
                ExchangeRequestStatus.REJECTED,
                NotificationType.EXCHANGE_REJECTED,
                " declined your exchange request.");
    }

    @Transactional
    public ExchangeRequestResponse cancel(Long id, String email) {
        User sender = findUser(email);
        ExchangeRequest request = findRequest(id);
        if (!request.getSender().getId().equals(sender.getId())) {
            throw new ResourceNotFoundException("Exchange request not found.");
        }
        requirePending(request);
        request.setStatus(ExchangeRequestStatus.CANCELLED);
        notify(
                request.getReceiver(),
                sender.getName() + " cancelled an exchange request.",
                NotificationType.EXCHANGE_CANCELLED,
                id);
        return ExchangeRequestResponse.from(exchangeRepository.save(request));
    }

    private ExchangeRequestResponse respond(
            Long id, String email, ExchangeRequestStatus status, NotificationType type, String message) {
        User receiver = findUser(email);
        ExchangeRequest request = findRequest(id);
        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new ResourceNotFoundException("Exchange request not found.");
        }
        requirePending(request);
        request.setStatus(status);
        notify(request.getSender(), receiver.getName() + message, type, id);
        return ExchangeRequestResponse.from(exchangeRepository.save(request));
    }

    private void requirePending(ExchangeRequest request) {
        if (request.getStatus() != ExchangeRequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be changed.");
        }
    }

    private void requireUserSkill(Long userId, Long skillId, SkillType type, String message) {
        if (!userSkillRepository.existsByUserIdAndSkillIdAndSkillType(userId, skillId, type)) {
            throw new BadRequestException(message);
        }
    }

    private User findUser(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private Skill findSkill(Long id) {
        return skillRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Skill not found."));
    }

    private ExchangeRequest findRequest(Long id) {
        return exchangeRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exchange request not found."));
    }

    private void notify(User user, String message, NotificationType type, Long referenceId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notificationRepository.save(notification);
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
