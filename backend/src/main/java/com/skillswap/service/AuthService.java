package com.skillswap.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillswap.dto.AuthResponse;
import com.skillswap.dto.LoginRequest;
import com.skillswap.dto.RegisterRequest;
import com.skillswap.dto.UserResponse;
import com.skillswap.entity.User;
import com.skillswap.enums.Role;
import com.skillswap.exception.BadRequestException;
import com.skillswap.repository.UserRepository;
import com.skillswap.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);
        return createAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isEnabled() || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return createAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid user"));
        return UserResponse.from(user);
    }

    private AuthResponse createAuthResponse(User user) {
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, UserResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
