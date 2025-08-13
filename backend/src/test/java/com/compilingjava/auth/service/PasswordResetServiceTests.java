package com.compilingjava.auth.service;

import com.compilingjava.auth.model.PasswordResetToken;
import com.compilingjava.auth.repository.PasswordResetTokenRepository;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceResetTests {

    @Mock
    UserRepository userRepository;
    @Mock
    PasswordResetTokenRepository tokenRepository;
    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    PasswordResetService service;

    private static User user(String email, String hash) {
        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(hash);
        return u;
    }

    private static PasswordResetToken token(User u) {
        PasswordResetToken t = new PasswordResetToken();
        t.setUser(u);
        // expiresAt/usedAt are enforced by the repository query (active only), so we don't need to set them here
        return t;
    }

    @Test
    void resetPassword_updatesPassword_and_marksTokenUsed() {
        UUID jti = UUID.randomUUID();
        String tokenString = jti.toString();

        User u = user("bob@example.com", "old-hash");
        PasswordResetToken prt = token(u);

        when(tokenRepository.findActiveByToken(eq(jti), any(Instant.class)))
                .thenReturn(Optional.of(prt));
        when(passwordEncoder.encode("N3wP@ss!")).thenReturn("encoded-hash");
        when(tokenRepository.markUsed(eq(jti), any(Instant.class))).thenReturn(1);

        service.resetPassword(tokenString, "N3wP@ss!");

        // user saved with new hash
        verify(userRepository).save(argThat(saved -> "encoded-hash".equals(saved.getPasswordHash())
                && "bob@example.com".equals(saved.getEmail())));

        // token consumption attempted exactly once
        verify(tokenRepository).markUsed(eq(jti), any(Instant.class));

        // no unexpected calls
        verifyNoMoreInteractions(tokenRepository, userRepository, passwordEncoder);
    }

    @Test
    void resetPassword_throws_when_token_invalid_or_expired() {
        UUID jti = UUID.randomUUID();
        String tokenString = jti.toString();

        when(tokenRepository.findActiveByToken(eq(jti), any(Instant.class)))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resetPassword(tokenString, "x"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid or expired token");

        verifyNoInteractions(userRepository, passwordEncoder);
        verify(tokenRepository, never()).markUsed(any(UUID.class), any(Instant.class));
    }

    @Test
    void resetPassword_throws_when_markUsed_reports_race() {
        UUID jti = UUID.randomUUID();
        String tokenString = jti.toString();

        User u = user("alice@example.com", "old");
        PasswordResetToken prt = token(u);

        when(tokenRepository.findActiveByToken(eq(jti), any(Instant.class)))
                .thenReturn(Optional.of(prt));
        when(passwordEncoder.encode("Secret123!")).thenReturn("enc");
        when(tokenRepository.markUsed(eq(jti), any(Instant.class))).thenReturn(0); // raced/used/expired between checks

        assertThatThrownBy(() -> service.resetPassword(tokenString, "Secret123!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid or expired token");

        // We attempted to save the user before discovering the race;
        // in real runtime @Transactional would roll this back.
        verify(userRepository).save(argThat(saved -> "enc".equals(saved.getPasswordHash())));
        verify(tokenRepository).markUsed(eq(jti), any(Instant.class));
    }
}
