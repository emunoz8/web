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

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;

    // Where your frontend reset page lives (query param token is appended)
    @Value("${app.reset.base-url:https://compilingjava.com/reset-password}")
    private String resetBaseUrl;

    private static final Duration TOKEN_TTL = Duration.ofHours(1);

    /**
     * Public: user typed an email to request a reset.
     * Return nothing; always 204 so we don't leak whether the email exists.
     */
    @Transactional
    public void issueToken(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // kill old tokens (optional but recommended)
            tokenRepository.deleteById(user.getId());

            UUID token = UUID.randomUUID();
            PasswordResetToken prt = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(Instant.now().plus(TOKEN_TTL))
                    .build();
            tokenRepository.save(prt);

            String link = resetBaseUrl + "?token=" + token;
            emailSender.send(
                    user.getEmail(),
                    "Reset your password",
                    """
                            Hi %s,

                            Someone (hopefully you) requested a password reset.
                            Click the link to set a new password:

                            %s

                            This link expires in %d hour(s).

                            If you didn’t request this, you can ignore this email.
                            """.formatted(user.getUsername(), link, TOKEN_TTL.toHours()));
        });
    }

    /**
     * Public: front-end posts token + new password.
     */
    @Transactional
    public void resetPassword(String tokenString, String newPassword) {
        UUID token = parse(tokenString);

        PasswordResetToken prt = tokenRepository.findActiveByToken(token, Instant.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        if (prt.isUsed() || prt.isExpired()) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        User user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        prt.setUsedAt(Instant.now());
        tokenRepository.save(prt);
    }

    // Optional housekeeping you can call on a cron or @Scheduled
    @Transactional
    public void cleanupExpired() {
        tokenRepository.deleteAllExpiredForUser(null, null);
    }

    private UUID parse(String token) {
        try {
            return UUID.fromString(token);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid token");
        }
    }
}
