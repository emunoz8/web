package com.compilingjava.user.service;

import com.compilingjava.auth.model.PasswordResetToken;
import com.compilingjava.auth.repository.PasswordResetTokenRepository;
import com.compilingjava.user.dto.UserRequestDto;
import com.compilingjava.user.dto.UserResponseDto;
import com.compilingjava.user.mapper.UserMapper;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final UserMapper userMapper;

    private long resetTtlMinutes;

    public UserResponseDto createUser(UserRequestDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = userMapper.toEntity(dto);

        user.setRole(userRepository.count() == 0 ? User.Role.ADMIN : User.Role.USER);

        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public Optional<String> issuePasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Do nothing (don’t leak existence)
            return Optional.empty();
        }

        User user = userOpt.get();

        // Invalidate any currently active tokens for this user
        resetTokenRepository.markAllUnusedTokensExpiredForUser(user.getId(), Instant.now());

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID());
        token.setExpiresAt(Instant.now().plus(resetTtlMinutes, ChronoUnit.MINUTES));

        resetTokenRepository.save(token);
        return Optional.of(token.getToken().toString());
    }

    /**
     * Resets the password if the token is valid (unused and unexpired).
     */
    @Transactional
    public void resetPasswordWithToken(String tokenString, String newPassword) {
        UUID token;
        try {
            token = UUID.fromString(tokenString);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid token");
        }

        PasswordResetToken prt = resetTokenRepository
                .findActiveByToken(token, Instant.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        User user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        prt.setUsedAt(Instant.now());
        resetTokenRepository.save(prt);

        // Optional cleanup: delete old/used tokens
        resetTokenRepository.deleteAllExpiredForUser(user.getId(), Instant.now());
    }

}
