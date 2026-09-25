package com.skillswap.service;

import com.skillswap.dto.ProfileResponse;
import com.skillswap.dto.UpdateProfileRequest;
import com.skillswap.entity.Profile;
import com.skillswap.entity.User;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.ProfileRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileService(ProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(String email) {
        User user = findUserByEmail(email);
        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return ProfileResponse.from(user, profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getPublicProfile(Long userId) {
        User user =
                userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Profile not found."));
        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        return ProfileResponse.from(user, profile);
    }

    @Transactional
    public ProfileResponse updateMyProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);
        Profile profile = profileRepository.findByUserId(user.getId()).orElseGet(() -> createProfile(user));

        user.setName(request.name().trim());
        profile.setBio(cleanOptionalText(request.bio()));
        profile.setLocation(cleanOptionalText(request.location()));
        profile.setPhotoUrl(cleanOptionalText(request.photoUrl()));
        profile.setGender(request.gender());
        profile.setAvailability(cleanOptionalText(request.availability()));

        userRepository.save(user);
        Profile savedProfile = profileRepository.save(profile);
        return ProfileResponse.from(user, savedProfile);
    }

    private User findUserByEmail(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private Profile createProfile(User user) {
        Profile profile = new Profile();
        profile.setUser(user);
        return profile;
    }

    private String cleanOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
