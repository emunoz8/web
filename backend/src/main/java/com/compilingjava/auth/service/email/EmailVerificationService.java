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

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final JwtService jwt;
    private final EmailVerificationTokenRepository repo;
    private final EmailVerificationTokenRepository tokens;
    private final UserRepository users;
    private final EmailSender emailer;

    @Value("${app.web.base-url:https://compilingjava.com}")
    private String webBaseUrl;

    /**
     * TTL for email verification tokens.
     * Default 45 minutes if not provided.
     */
    @Value("${jwt.access.ttl-ms:2700000}") // 45 * 60 * 1000
    private long ttlMs;

    /**
     * Issue a new verification token for the given email.
     * - Revokes (marks used) any prior outstanding tokens for that email
     * - Generates a new short-lived JWT (typ=email_verify)
     * - Persists JTI to enforce single-use
     */

    @Transactional
    public String generateToken(String email) {
        // Revoke any outstanding tokens so only the latest works
        repo.revokeAllForEmail(email, Instant.now(Clock.systemUTC()));

        // Create JWT and persist its JTI
        String token = jwt.generateEmailVerificationToken(email, Duration.ofMillis(ttlMs));
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
     * Validate and CONSUME the token in a race-safe, single-call operation.
     * Returns the associated email if valid.
     */
    @Transactional
    public String validateAndConsume(String token) {
        EmailVerifyClaims c = parseAndBasicCheck(token);

        // Ensure it is still valid (not used, not expired) from DB
        var now = Instant.now();
        var row = repo.findValidByJti(c.jti(), now)
                .orElseThrow(() -> new ExpiredOrUsedTokenException());

        // Atomically mark used; if 0 rows updated someone already used it
        int updated = repo.markUsed(c.jti(), now);
        if (updated == 0) {
            throw new ExpiredOrUsedTokenException();
        }
        return row.getEmail();
    }

    /**
     * Remove expired/used tokens. Call from a daily scheduler or a maintenance job.
     */
    @Transactional
    public int cleanupExpired() {
        return repo.cleanup(Instant.now());
    }

    public void resend(String email) {
        // No enumeration: only act if the user exists and is not verified
        users.findByEmail(email).ifPresent(u -> {
            if (u.isEmailVerified())
                return;
            String token = generateToken(email); // revokes older, persists new
            // Build link and send outside of transaction boundary
            String link = UriComponentsBuilder.fromUriString(webBaseUrl)
                    .path("/confirm-email")
                    .queryParam("token", token)
                    .build()
                    .toUriString();
            try {
                emailer.sendHtml(email, "Verify your email", htmlBody(link));
            } catch (EmailDeliveryException e) {
                // Keep the endpoint blind; log if you want—don't surface to client
                // Optionally: metrics/alerting here
            }
        });
    }

    // ---- helpers ----

    private EmailVerifyClaims parseAndBasicCheck(String token) {
        EmailVerifyClaims c;
        try {
            c = jwt.parseEmailVerificationToken(token); // verifies signature + typ=email_verify + required claims
        } catch (Exception e) {
            throw new InvalidTokenException();
        }
        // Extra explicit exp check (defensive; parser normally throws if exp < now)
        if (Instant.now().isAfter(c.exp())) {
            throw new ExpiredOrUsedTokenException();
        }
        return c;
    }

    @Transactional
    public void verify(String rawToken) {
        EmailVerificationToken t = tokens.findByToken(rawToken)
                .orElseThrow(InvalidTokenException::new);

        if (t.getUsedAt() != null || t.getExpiresAt().isBefore(Instant.now())) {
            throw new ExpiredOrUsedTokenException();
        }

        // Assuming the token references the User entity:
        User u = users.findByEmail(t.getEmail())
                .orElseThrow(InvalidTokenException::new);

        if (u == null) {
            throw new InvalidTokenException(); // or adapt if your token stores only an email string
        }

        if (!u.isEmailVerified()) {
            u.setEmailVerified(true);
            users.save(u);
        }

        t.setUsedAt(Instant.now());
        tokens.save(t);
    }

}
