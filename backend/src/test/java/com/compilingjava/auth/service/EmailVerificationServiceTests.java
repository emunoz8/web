package com.compilingjava.auth.service;

import com.compilingjava.auth.model.EmailVerificationToken;
import com.compilingjava.auth.repository.EmailVerificationTokenRepository;
import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.common.ratelimit.RateLimiterService;
import com.compilingjava.security.jwt.JwtService;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.auth.service.email.EmailVerificationService;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTests {

        @Mock
        JwtService jwt;
        @Mock
        EmailVerificationTokenRepository tokenRepo;
        @Mock
        UserRepository userRepo;
        @Mock
        EmailSender emailSender; // used by resend(), not exercised here
        @Mock
        RateLimiterService rateLimiter; // constructor dependency in service

        @InjectMocks
        EmailVerificationService service;

        private static EmailVerificationToken row(UUID jti, String email, Instant exp, boolean used) {
                var t = new EmailVerificationToken();
                t.setJti(jti);
                t.setEmail(email);
                t.setExpiresAt(exp);
                t.setUsed(used);
                return t;
        }

        private static User user(String email, boolean verified) {
                var u = new User();
                u.setEmail(email);
                u.setUsername(email);
                u.setEmailVerified(verified);
                return u;
        }

        @Test
        void verify_happyPath_marksUserVerified_andConsumesToken() {
                String raw = "ey.token";
                UUID jti = UUID.randomUUID();
                String email = "bob@example.com";
                Instant exp = Instant.now().plusSeconds(1800);

                when(jwt.parseEmailVerificationToken(raw))
                                .thenReturn(new JwtService.EmailVerifyClaims(email, jti, exp));

                when(tokenRepo.findActiveByJti(eq(jti), any(Instant.class)))
                                .thenReturn(Optional.of(row(jti, email, exp, false)));

                when(userRepo.findByEmail(email)).thenReturn(Optional.of(user(email, false)));
                when(tokenRepo.consumeByJti(eq(jti), any(Instant.class))).thenReturn(1);

                service.verify(raw);

                verify(tokenRepo).consumeByJti(eq(jti), any(Instant.class));
                verify(userRepo).save(argThat(u -> u.isEmailVerified() && email.equals(u.getEmail())));
        }

        @Test
        void verify_throwsOnExpiredOrUsed() {
                UUID jti = UUID.randomUUID();
                String email = "e@e.com";
                Instant exp = Instant.now().plusSeconds(60);

                when(jwt.parseEmailVerificationToken("t"))
                                .thenReturn(new JwtService.EmailVerifyClaims(email, jti, exp));
                when(tokenRepo.findActiveByJti(eq(jti), any(Instant.class)))
                                .thenReturn(Optional.empty()); // simulate expired/used

                assertThatThrownBy(() -> service.verify("t"))
                                .isInstanceOf(ExpiredOrUsedTokenException.class);

                verifyNoInteractions(userRepo);
        }

        @Test
        void verify_throwsOnEmailMismatch() {
                UUID jti = UUID.randomUUID();
                Instant exp = Instant.now().plusSeconds(600);

                when(jwt.parseEmailVerificationToken("t"))
                                .thenReturn(new JwtService.EmailVerifyClaims("fake@example.com", jti, exp));

                // DB row says a different email
                when(tokenRepo.findActiveByJti(eq(jti), any(Instant.class)))
                                .thenReturn(Optional.of(row(jti, "real@example.com", exp, false)));

                assertThatThrownBy(() -> service.verify("t"))
                                .isInstanceOf(InvalidTokenException.class);

                verify(tokenRepo, never()).consumeByJti(any(), any());
                verifyNoInteractions(userRepo);
        }

        @Test
        void validateAndConsume_returnsEmail_andConsumes() {
                String raw = "ey.token";
                UUID jti = UUID.randomUUID();
                String email = "alice@example.com";
                Instant exp = Instant.now().plusSeconds(900);

                when(jwt.parseEmailVerificationToken(raw))
                                .thenReturn(new JwtService.EmailVerifyClaims(email, jti, exp));

                when(tokenRepo.findActiveByJti(eq(jti), any(Instant.class)))
                                .thenReturn(Optional.of(row(jti, email, exp, false)));

                when(tokenRepo.consumeByJti(eq(jti), any(Instant.class))).thenReturn(1);

                String out = service.validateAndConsume(raw);

                assertThat(out).isEqualTo(email);
                verify(tokenRepo).consumeByJti(eq(jti), any(Instant.class));
        }

        @Test
        void validateAndConsume_throwsWhenAlreadyConsumed_race() {
                String raw = "ey.token";
                UUID jti = UUID.randomUUID();
                String email = "race@example.com";
                Instant exp = Instant.now().plusSeconds(900);

                when(jwt.parseEmailVerificationToken(raw))
                                .thenReturn(new JwtService.EmailVerifyClaims(email, jti, exp));

                when(tokenRepo.findActiveByJti(eq(jti), any(Instant.class)))
                                .thenReturn(Optional.of(row(jti, email, exp, false)));

                // Another request consumed it just before this one updates:
                when(tokenRepo.consumeByJti(eq(jti), any(Instant.class))).thenReturn(0);

                assertThatThrownBy(() -> service.validateAndConsume(raw))
                                .isInstanceOf(ExpiredOrUsedTokenException.class);
        }

        @Test
        void parse_throwsInvalidToken_bubblesUp() {
                when(jwt.parseEmailVerificationToken("bad"))
                                .thenThrow(new InvalidTokenException("bad"));
                assertThatThrownBy(() -> service.validateAndConsume("bad"))
                                .isInstanceOf(InvalidTokenException.class);
                verifyNoInteractions(tokenRepo, userRepo);
        }

        @Test
        void expiredClaimsThrowBeforeDbLookup() {
                UUID jti = UUID.randomUUID();
                var pastExp = Instant.now().minusSeconds(1);
                when(jwt.parseEmailVerificationToken("t"))
                                .thenReturn(new JwtService.EmailVerifyClaims("x@y.com", jti, pastExp));

                assertThatThrownBy(() -> service.validateAndConsume("t"))
                                .isInstanceOf(ExpiredOrUsedTokenException.class);

                verifyNoInteractions(tokenRepo, userRepo);
        }
}
