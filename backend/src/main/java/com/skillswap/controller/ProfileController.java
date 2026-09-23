package com.skillswap.controller;

import com.skillswap.dto.ProfileResponse;
import com.skillswap.dto.UpdateProfileRequest;
import com.skillswap.service.ProfileService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ProfileResponse getMyProfile(Principal principal) {
        return profileService.getMyProfile(principal.getName());
    }

    @PutMapping("/me")
    public ProfileResponse updateMyProfile(Principal principal, @Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateMyProfile(principal.getName(), request);
    }

    @GetMapping("/{userId}")
    public ProfileResponse getPublicProfile(@PathVariable Long userId) {
        return profileService.getPublicProfile(userId);
    }
}
