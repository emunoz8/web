package com.compilingjava.auth.service.email;

import com.compilingjava.auth.model.EmailVerificationToken;
import com.compilingjava.auth.repository.EmailVerificationTokenRepository;
import com.compilingjava.security.jwt.JwtService;
import com.compilingjava.security.jwt.JwtService.EmailVerifyClaims;
import com.compilingjava.auth.service.email.EmailVerificationException.Reason;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final JwtService jwt;
    private final EmailVerificationTokenRepository repo;

    /**
     * TTL for email verification tokens.
     * Default 45 minutes if not provided.
     */
    @Value("${jwt.email-verify.ttl-ms:2700000}") // 45 * 60 * 1000
    private long ttlMs;

    /**
     * Issue a new verification token for the given email.
     * - Revokes (marks used) any prior outstanding tokens for that email
     * - Generates a new short-lived JWT (typ=email_verify)
     * - Persists JTI to enforce single-use
     */
    @Transactional
    public String generateToken(String email) {
        // Revoke older outstanding tokens so only the latest link works
        repo.revokeAllForEmail(email, Instant.now());

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
                .orElseThrow(() -> new EmailVerificationException(Reason.INVALID, "token not valid"));

        // Atomically mark used; if 0 rows updated someone already used it
        int updated = repo.markUsed(c.jti(), now);
        if (updated == 0) {
            throw new EmailVerificationException(Reason.USED, "token already used");
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

    /**
     * Convenience: resend a fresh token (revokes prior outstanding token(s)).
     */
    @Transactional
    public String resend(String email) {
        return generateToken(email);
    }

    // ---- helpers ----

    private EmailVerifyClaims parseAndBasicCheck(String token) {
        EmailVerifyClaims c;
        try {
            c = jwt.parseEmailVerificationToken(token); // verifies signature + typ=email_verify + required claims
        } catch (Exception e) {
            throw new EmailVerificationException(Reason.INVALID, "malformed token");
        }
        // Extra explicit exp check (defensive; parser normally throws if exp < now)
        if (Instant.now().isAfter(c.exp())) {
            throw new EmailVerificationException(Reason.EXPIRED, "token expired");
        }
        return c;
    }
}
