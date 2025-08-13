package com.compilingjava.auth.service;

import com.compilingjava.auth.model.EmailVerificationToken;
import com.compilingjava.auth.repository.EmailVerificationTokenRepository;
import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.security.jwt.JwtService;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTests {

    @Mock
    JwtService jwt;
    @Mock
    EmailVerificationTokenRepository tokenRepository;
    @Mock
    UserRepository userRepository;
    @Mock
    EmailSender emailSender;

    @InjectMocks
    EmailVerificationService service;

    @BeforeEach
    void maybeSetLinkBase() {
        try {
            ReflectionTestUtils.setField(service, "verifyLinkBase", "https://app.example/verify?token=");
        } catch (IllegalArgumentException ignored) {
            // Field not present in your service — that's fine.
        }
    }

    private static User user(long id, String email) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setUsername(email);
        u.setEmailVerified(false);
        return u;
    }

    // Use the real entity, not a mock (avoids final-method stubbing issues)
    private static EmailVerificationToken token(Instant exp, boolean used) {
        EmailVerificationToken t = new EmailVerificationToken();
        t.setExpiresAt(exp);
        t.setUsedAt(used ? Instant.EPOCH : null);
        return t;
    }

    @Test
    void verify_happy_path_marks_user_verified_and_token_used() {
        String raw = "abc.def.ghi";
        UUID jti = UUID.randomUUID();
        var claims = new JwtService.EmailVerifyClaims("bob@example.com", jti, Instant.now().plusSeconds(3600));

        when(jwt.parseEmailVerificationToken(raw)).thenReturn(claims);
        var t = token(Instant.now().plusSeconds(3600), false);
        when(tokenRepository.findByJtiForUpdate(jti)).thenReturn(Optional.of(t));

        User u = user(1L, "bob@example.com");
        // IMPORTANT: use any() here so null is accepted (anyString() would NOT match null)
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(u));

        service.verify(raw);

        assertThat(u.isEmailVerified()).isTrue();
        verify(tokenRepository).save(t);
        verify(userRepository).save(u);

    }

    @Test
    void verify_invalid_jwt_throws_InvalidTokenException() {
        when(jwt.parseEmailVerificationToken("bad")).thenThrow(new InvalidTokenException("x"));
        assertThatThrownBy(() -> service.verify("bad")).isInstanceOf(InvalidTokenException.class);
        verifyNoInteractions(tokenRepository, userRepository);
    }

    @Test
    void verify_token_record_missing_throws_InvalidTokenException() {
        UUID jti = UUID.randomUUID();
        var claims = new JwtService.EmailVerifyClaims("e@e.com", jti, Instant.now().plusSeconds(60));
        when(jwt.parseEmailVerificationToken("t")).thenReturn(claims);
        when(tokenRepository.findByJtiForUpdate(jti)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.verify("t")).isInstanceOf(InvalidTokenException.class);
        verifyNoInteractions(userRepository);
    }

    @Test
    void verify_used_or_expired_throws_ExpiredOrUsedTokenException() {
        UUID jti = UUID.randomUUID();
        var claims = new JwtService.EmailVerifyClaims("e@e.com", jti, Instant.now().plusSeconds(60));
        when(jwt.parseEmailVerificationToken("t")).thenReturn(claims);
        when(tokenRepository.findByJtiForUpdate(jti))
                .thenReturn(Optional.of(token(Instant.now().plusSeconds(60), true)));

        assertThatThrownBy(() -> service.verify("t")).isInstanceOf(ExpiredOrUsedTokenException.class);
        verifyNoInteractions(userRepository);
    }

    @Test
    void verify_user_missing_throws_InvalidTokenException() {
        UUID jti = UUID.randomUUID();
        var claims = new JwtService.EmailVerifyClaims("ghost@example.com", jti, Instant.now().plusSeconds(60));
        when(jwt.parseEmailVerificationToken("t")).thenReturn(claims);
        when(tokenRepository.findByJtiForUpdate(jti))
                .thenReturn(Optional.of(token(Instant.now().plusSeconds(60), false)));

        // IMPORTANT: make it missing for ANY (including null)
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.verify("t")).isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void verify_expired_token_throws_ExpiredOrUsedTokenException() {
        UUID jti = UUID.randomUUID();
        var claims = new JwtService.EmailVerifyClaims("user@example.com", jti, Instant.now().minusSeconds(1));
        when(jwt.parseEmailVerificationToken("t")).thenReturn(claims);
        when(tokenRepository.findByJtiForUpdate(jti))
                .thenReturn(Optional.of(token(Instant.now().minusSeconds(1), false)));

        assertThatThrownBy(() -> service.verify("t")).isInstanceOf(ExpiredOrUsedTokenException.class);
        verifyNoInteractions(userRepository);
    }
}
