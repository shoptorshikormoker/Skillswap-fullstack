package com.skillswap.controller;

import com.skillswap.dto.UserSkillRequest;
import com.skillswap.dto.UserSkillResponse;
import com.skillswap.service.UserSkillService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-skills")
public class UserSkillController {

    private final UserSkillService userSkillService;

    public UserSkillController(UserSkillService userSkillService) {
        this.userSkillService = userSkillService;
    }

    @GetMapping("/me")
    public List<UserSkillResponse> getMySkills(Principal principal) {
        return userSkillService.getMySkills(principal.getName());
    }

    @PostMapping("/me")
    @ResponseStatus(HttpStatus.CREATED)
    public UserSkillResponse addMySkill(Principal principal, @Valid @RequestBody UserSkillRequest request) {
        return userSkillService.addMySkill(principal.getName(), request);
    }

    @PutMapping("/me/{userSkillId}")
    public UserSkillResponse updateMySkill(
            @PathVariable Long userSkillId, Principal principal, @Valid @RequestBody UserSkillRequest request) {
        return userSkillService.updateMySkill(userSkillId, principal.getName(), request);
    }

    @DeleteMapping("/me/{userSkillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMySkill(@PathVariable Long userSkillId, Principal principal) {
        userSkillService.deleteMySkill(userSkillId, principal.getName());
    }

    @GetMapping("/users/{userId}")
    public List<UserSkillResponse> getPublicUserSkills(@PathVariable Long userId) {
        return userSkillService.getPublicUserSkills(userId);
    }
}
