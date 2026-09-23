package com.skillswap.service;

import com.skillswap.dto.UserSkillRequest;
import com.skillswap.dto.UserSkillResponse;
import com.skillswap.entity.Skill;
import com.skillswap.entity.User;
import com.skillswap.entity.UserSkill;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.SkillRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.repository.UserSkillRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserSkillService {

    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public UserSkillService(
            UserSkillRepository userSkillRepository, UserRepository userRepository, SkillRepository skillRepository) {
        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<UserSkillResponse> getMySkills(String email) {
        return getSkillsForUser(findUserByEmail(email).getId());
    }

    @Transactional(readOnly = true)
    public List<UserSkillResponse> getPublicUserSkills(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found.");
        }
        return getSkillsForUser(userId);
    }

    @Transactional
    public UserSkillResponse addMySkill(String email, UserSkillRequest request) {
        User user = findUserByEmail(email);
        Skill skill = findSkill(request.skillId());

        if (userSkillRepository.existsByUserIdAndSkillIdAndSkillType(
                user.getId(), skill.getId(), request.skillType())) {
            throw new BadRequestException("This skill is already in your "
                    + request.skillType().name().toLowerCase()
                    + " list.");
        }

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        applyRequest(userSkill, skill, request);
        return UserSkillResponse.from(userSkillRepository.save(userSkill));
    }

    @Transactional
    public UserSkillResponse updateMySkill(Long userSkillId, String email, UserSkillRequest request) {
        User user = findUserByEmail(email);
        UserSkill userSkill = findOwnedSkill(userSkillId, user.getId());
        Skill skill = findSkill(request.skillId());

        if (userSkillRepository.existsByUserIdAndSkillIdAndSkillTypeAndIdNot(
                user.getId(), skill.getId(), request.skillType(), userSkillId)) {
            throw new BadRequestException("This skill is already in your "
                    + request.skillType().name().toLowerCase()
                    + " list.");
        }

        applyRequest(userSkill, skill, request);
        return UserSkillResponse.from(userSkillRepository.save(userSkill));
    }

    @Transactional
    public void deleteMySkill(Long userSkillId, String email) {
        User user = findUserByEmail(email);
        userSkillRepository.delete(findOwnedSkill(userSkillId, user.getId()));
    }

    private List<UserSkillResponse> getSkillsForUser(Long userId) {
        return userSkillRepository.findByUserIdOrderBySkillNameAsc(userId).stream()
                .map(UserSkillResponse::from)
                .toList();
    }

    private User findUserByEmail(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private Skill findSkill(Long skillId) {
        return skillRepository.findById(skillId).orElseThrow(() -> new ResourceNotFoundException("Skill not found."));
    }

    private UserSkill findOwnedSkill(Long userSkillId, Long userId) {
        UserSkill userSkill = userSkillRepository
                .findById(userSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("User skill not found."));

        if (!userSkill.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("User skill not found.");
        }
        return userSkill;
    }

    private void applyRequest(UserSkill userSkill, Skill skill, UserSkillRequest request) {
        userSkill.setSkill(skill);
        userSkill.setSkillType(request.skillType());
        userSkill.setLevel(request.level());
        userSkill.setDescription(cleanOptionalText(request.description()));
    }

    private String cleanOptionalText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
