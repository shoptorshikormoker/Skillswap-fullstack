package com.skillswap.service;

import com.skillswap.dto.SearchResultResponse;
import com.skillswap.dto.SkillResponse;
import com.skillswap.entity.Profile;
import com.skillswap.entity.User;
import com.skillswap.entity.UserSkill;
import com.skillswap.enums.SkillType;
import com.skillswap.repository.ProfileRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.repository.UserSkillRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchService {

    private final UserSkillRepository userSkillRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public SearchService(
            UserSkillRepository userSkillRepository,
            ProfileRepository profileRepository,
            UserRepository userRepository) {
        this.userSkillRepository = userSkillRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<SearchResultResponse> searchTeachers(String skillName, Long categoryId, String currentUserEmail) {
        Long currentUserId = findCurrentUserId(currentUserEmail);
        List<UserSkill> matches =
                userSkillRepository
                        .searchBySkillAndCategory(SkillType.TEACH, normalizeSearchText(skillName), categoryId)
                        .stream()
                        .filter(userSkill -> !userSkill.getUser().getId().equals(currentUserId))
                        .toList();

        Map<Long, List<UserSkill>> matchesByUser = matches.stream()
                .collect(Collectors.groupingBy(
                        userSkill -> userSkill.getUser().getId(), LinkedHashMap::new, Collectors.toList()));

        Map<Long, Profile> profilesByUser = profileRepository.findByUserIdIn(matchesByUser.keySet()).stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getId(), Function.identity()));

        List<SearchResultResponse> results = new ArrayList<>();
        matchesByUser.forEach((userId, userMatches) -> {
            Profile profile = profilesByUser.get(userId);
            UserSkill firstMatch = userMatches.getFirst();
            results.add(new SearchResultResponse(
                    userId,
                    firstMatch.getUser().getName(),
                    profile == null ? null : profile.getBio(),
                    profile == null ? null : profile.getLocation(),
                    profile == null ? null : profile.getPhotoUrl(),
                    userMatches.stream()
                            .map(UserSkill::getSkill)
                            .map(SkillResponse::from)
                            .toList()));
        });
        return results;
    }

    private Long findCurrentUserId(String currentUserEmail) {
        if (currentUserEmail == null) {
            return null;
        }

        return userRepository
                .findByEmailIgnoreCase(currentUserEmail)
                .map(User::getId)
                .orElse(null);
    }

    private String normalizeSearchText(String skillName) {
        return skillName == null || skillName.isBlank() ? null : skillName.trim();
    }
}
