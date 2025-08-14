package com.compilingjava.security.jwt;

import com.compilingjava.config.JwtProperties;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTests {

        private JwtService newSvc() {
                JwtProperties props = new JwtProperties();
                // >= 32 chars for HS256
                props.setSecret("dev-test-secret-0123456789-0123456789-ABCD");
                props.setExpiration(900_000L); // 15 min (ms)
                props.setEmailExpiration(2_700_000L); // 45 min (ms)
                return new JwtService(props);
        }

        @Test
        void accessToken_roundTrip() {
                var svc = newSvc();
                String token = svc.generateAccessToken(
                                "edwin", "edwin@example.com", List.of("ROLE_USER"), Duration.ofMinutes(15));

                var c = svc.parseAccessToken(token);
                assertThat(c.sub()).isEqualTo("edwin");
                assertThat(c.email()).isEqualTo("edwin@example.com");
                assertThat(c.roles()).contains("ROLE_USER");
                assertThat(c.jti()).isInstanceOf(UUID.class);
                assertThat(c.exp()).isAfter(Instant.now());
        }

        @Test
        void emailVerification_roundTrip() {
                var svc = newSvc();
                String token = svc.generateEmailVerificationToken("alice@example.com", Duration.ofMinutes(45));
                var claims = svc.parseEmailVerificationToken(token);
                assertThat(claims.email()).isEqualTo("alice@example.com");
                assertThat(claims.jti()).isInstanceOf(UUID.class);
                assertThat(claims.exp()).isAfter(Instant.now());
        }

        @Test
        void parseAccessToken_rejects_wrong_typ() {
                var svc = newSvc();
                // Make a verify token and feed it to parseAccessToken -> should throw
                String verify = svc.generateEmailVerificationToken("x@y.com", Duration.ofMinutes(5));
                assertThrows(InvalidTokenException.class, () -> svc.parseAccessToken(verify));
        }

        @Test
        void parseEmailVerification_throwsExpired() {
                var svc = newSvc();
                String token = svc.generateEmailVerificationToken("x@y.com", Duration.ofSeconds(0));
                assertThrows(ExpiredOrUsedTokenException.class, () -> svc.parseEmailVerificationToken(token));
        }
}
