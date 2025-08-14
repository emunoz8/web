package com.compilingjava.auth.service.email;

import com.compilingjava.auth.model.EmailVerificationToken;
import com.compilingjava.auth.repository.EmailVerificationTokenRepository;
import com.compilingjava.security.jwt.JwtService;
import com.compilingjava.security.jwt.JwtService.EmailVerifyClaims;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import com.compilingjava.auth.service.exceptions.EmailDeliveryException;
import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.common.ratelimit.RateLimiterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final JwtService jwt;
    private final EmailVerificationTokenRepository repo;
    private final UserRepository users;
    private final EmailSender emailer;
    private final RateLimiterService rateLimiter;

    @Value("${app.web.base-url:https://compilingjava.com}")
    private String webBaseUrl;

    /** TTL for email verification tokens (default 45m). */
    @Value("${jwt.email-verify.ttl-ms:2700000}")
    private long ttlMs;

    /** How long to keep used/expired rows before cleanup (default 7 days). */
    @Value("${app.tokens.cleanup-retention-days:7}")
    private int cleanupRetentionDays;

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    /**
     * Issue a new verification token for the given email.
     * - Revokes any prior outstanding tokens for that email
     * - Generates a new short-lived JWT (typ=email_verify)
     * - Persists JTI to enforce single-use
     */
    @Transactional
    public String generateToken(String email) {
        String norm = normalize(email);
        repo.revokeAllForEmail(norm, Instant.now());
        String token = jwt.generateEmailVerificationToken(norm, Duration.ofMillis(ttlMs));
        EmailVerifyClaims claims = jwt.parseEmailVerificationToken(token);

        EmailVerificationToken row = new EmailVerificationToken();
        row.setJti(claims.jti());
        row.setEmail(claims.email());
        row.setExpiresAt(claims.exp());
        repo.save(row);

        return token;
    }

    private String htmlBody(String link) {
        return """
                <p>Confirm your email for compilingjava.com</p>
                <p><a href="%s">Click here to verify</a></p>
                <p>If you didn’t request this, you can ignore this email.</p>
                """.formatted(link);
    }

    /**
     * Validate and CONSUME the token in a race-safe, two-step flow:
     *  1) Check active (not used, not expired) via DB
     *  2) Atomically mark used; if 0 rows updated, it was already used
     * Returns the associated email if valid.
     */
    @Transactional
    public String validateAndConsume(String token) {
        EmailVerifyClaims c = parseAndBasicCheck(token);
        UUID jti = c.jti();
        Instant now = Instant.now();

        var row = repo.findActiveByJti(jti, now)
                .orElseThrow(ExpiredOrUsedTokenException::new);

        // extra defense: ensure email in DB matches JWT claim
        if (!row.getEmail().equalsIgnoreCase(c.email())) {
            throw new InvalidTokenException();
        }

        int updated = repo.consumeByJti(jti, now);
        if (updated == 0) {
            throw new ExpiredOrUsedTokenException();
        }
        return row.getEmail();
    }

    /**
     * Public verify flow: consumes token and marks the user verified.
     */
    @Transactional
    public void verify(String rawToken) {
        String email = validateAndConsume(rawToken);
        User u = users.findByEmail(email).orElseThrow(InvalidTokenException::new);
        if (!u.isEmailVerified()) {
            u.setEmailVerified(true);
            users.save(u);
        }
    }

    /**
     * Remove expired/used tokens older than the retention window.
     */
    @Transactional
    public int cleanupExpired() {
        Instant cutoff = Instant.now().minus(Duration.ofDays(cleanupRetentionDays));
        return repo.cleanup(cutoff);
    }

    /**
     * Resend verification email (PUBLIC endpoint usage).
     * - Non-enumerating: always return 204 to the client (controller) on valid syntax.
     * - Rate-limited by email (3/hour via RateLimiterService).
     * - Swallows exceptions to avoid leaking deliverability or internal errors.
     */
    @Transactional
    public void resend(String rawEmail) {
        String email = normalize(rawEmail);
        if (email.isBlank())
            return;

        // Per-email limiter (3/hour). Uses RateLimiterService dedicated policy.
        if (!rateLimiter.tryConsumeResendEmail(email)) {
            log.debug("Email resend rate-limited for {}", email);
            return; // silently drop to avoid enumeration/abuse
        }

        try {
            users.findByEmail(email).ifPresent(u -> {
                if (u.isEmailVerified())
                    return;

                String token = generateToken(email);
                String link = UriComponentsBuilder.fromUriString(webBaseUrl)
                        .path("/confirm-email")
                        .queryParam("token", token)
                        .build()
                        .toUriString();

                try {
                    emailer.sendHtml(email, "Verify your email", htmlBody(link));
                } catch (EmailDeliveryException ignored) {
                    // intentionally swallow to avoid leaking deliverability details
                }
            });
        } catch (Exception ex) {
            // Swallow to preserve non-enumeration; log for ops
            log.warn("Resend verification suppressed for {}: {}", email, ex.toString());
        }
    }

    private EmailVerifyClaims parseAndBasicCheck(String token) {
        EmailVerifyClaims c;
        try {
            c = jwt.parseEmailVerificationToken(token); // verifies signature/typ/iss/aud/exp/nbf
        } catch (Exception e) {
            throw new InvalidTokenException();
        }
        if (Instant.now().isAfter(c.exp())) {
            throw new ExpiredOrUsedTokenException();
        }
        return c;
    }
}
