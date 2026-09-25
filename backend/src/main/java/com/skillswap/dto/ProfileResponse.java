package com.skillswap.dto;

import com.skillswap.entity.Profile;
import com.skillswap.entity.User;
import com.skillswap.enums.Gender;

public record ProfileResponse(
        Long userId,
        String name,
        String bio,
        String location,
        String photoUrl,
        Gender gender,
        String availability,
        boolean completed) {

    public static ProfileResponse from(User user, Profile profile) {
        if (profile == null) {
            return new ProfileResponse(user.getId(), user.getName(), null, null, null, null, null, false);
        }

        return new ProfileResponse(
                user.getId(),
                user.getName(),
                profile.getBio(),
                profile.getLocation(),
                profile.getPhotoUrl(),
                profile.getGender(),
                profile.getAvailability(),
                true);
    }
}
