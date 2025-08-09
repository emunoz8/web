// src/main/java/com/compilingjava/auth/service/PasswordResetService.java
package com.compilingjava.auth.service;

import com.compilingjava.auth.model.PasswordResetToken;
import com.compilingjava.auth.repository.PasswordResetTokenRepository;
import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;

    /**
     * BACKEND redirect endpoint base (recommended):
     *   https://api.compilingjava.com/api/auth/password/reset-link
     * It will redirect the browser to your SPA: https://compilingjava.com/reset-password?token=...
     *
     * If you prefer linking straight to the SPA, set this to:
     *   https://compilingjava.com/reset-password
     */
    @Value("${app.urls.password-reset-link-base:https://api.compilingjava.com/api/auth/password/reset-link}")
    private String resetLinkBase;

    private static final Duration TOKEN_TTL = Duration.ofHours(1);

    /** Step 1: user typed an email. Enumeration-safe (always silent). */
    @Transactional
    public void issueToken(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // Revoke any outstanding tokens for this user (don’t use deleteById(user.getId()))
            tokenRepository.revokeAllForUser(user, Instant.now());

            UUID token = UUID.randomUUID();
            PasswordResetToken prt = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .createdAt(Instant.now())
                    .expiresAt(Instant.now().plus(TOKEN_TTL))
                    .build();

            tokenRepository.save(prt);

            String link = resetLinkBase + "?token=" + URLEncoder.encode(token.toString(), StandardCharsets.UTF_8);
            String body = """
                    Hi %s,

                    Someone (hopefully you) requested a password reset.
                    Click the link below to set a new password (valid for %d hour%s):

                    %s

                    If you didn’t request this, you can ignore this email.
                    """.formatted(user.getUsername(), TOKEN_TTL.toHours(),
                    TOKEN_TTL.toHours() == 1 ? "" : "s", link);

            emailSender.send(user.getEmail(), "Reset your password", body);
        });
    }

    /** Optional pre-check for the SPA: is this token valid & unused right now? */
    @Transactional(readOnly = true)
    public boolean isTokenUsable(String tokenString) {
        UUID token = parse(tokenString);
        Instant now = Instant.now();
        return tokenRepository.findActiveByToken(token, now).isPresent();
    }

    /** Step 2: user submits token + new password. Atomically consumes the token. */
    @Transactional
    public void resetPassword(String tokenString, String newPassword) {
        UUID token = parse(tokenString);
        Instant now = Instant.now();

        PasswordResetToken prt = tokenRepository.findActiveByToken(token, now)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        // Update password
        User user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Atomically mark token used
        int updated = tokenRepository.markUsed(token, now);
        if (updated == 0) {
            // Someone raced and used it first
            throw new IllegalArgumentException("Invalid or expired token");
        }

        // (Optional) revoke all refresh tokens so the user is logged out everywhere
        // refreshTokenService.revokeAllForUser(user.getUsername());
    }

    /** Nightly cleanup (expired or already-used tokens). */
    @Transactional
    public int cleanupExpired() {
        return tokenRepository.cleanup(Instant.now());
    }

    // ---- helpers ----

    private UUID parse(String raw) {
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid token");
        }
    }
}
