package com.compilingjava.common.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Centralized rate-limiter using Bucket4j.
 *
 * Policies:
 *  - RESEND by IP:    5 / minute (for POST /auth/verify/resend)
 *  - RESEND by email: 3 / hour   (for POST /auth/verify/resend)
 *  - Generic fallback: 3 / 5 minutes (kept for compatibility with existing callers)
 *
 * Notes:
 *  - In-memory buckets: for multi-instance deployments, use a shared store (e.g. Redis) instead.
 *  - secondsUntil* helpers only consume when the bucket ALLOWS the request; in normal usage
 *    you call tryConsume* first. If that returns false, secondsUntil* will NOT consume.
 */
@Service
public class RateLimiterService {

    // --- Bucket stores by dimension ---
    private final Map<String, Bucket> ipBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> emailBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> generic = new ConcurrentHashMap<>();

    /* =========================
     *   Bucket factories
     * ========================= */

    private Bucket bucketFixedWindow(int capacity, int refillTokens, Duration refillPeriod, int initialTokens) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillIntervally(refillTokens, refillPeriod)
                .initialTokens(initialTokens)
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket resendIpBucket(String ip) {
        return ipBuckets.computeIfAbsent(ip, k -> bucketFixedWindow(5, 5, Duration.ofMinutes(1), 5)); // 5/min
    }

    private Bucket resendEmailBucket(String email) {
        return emailBuckets.computeIfAbsent(normalizeEmail(email),
                k -> bucketFixedWindow(3, 3, Duration.ofHours(1), 3)); // 3/hour
    }

    private Bucket genericBucket(String key) {
        return generic.computeIfAbsent(key, k -> bucketFixedWindow(3, 3, Duration.ofMinutes(5), 3)); // 3 / 5min
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    /* =========================
     *   Public API — RESEND
     * ========================= */

    /** Try-consume 1 token for RESEND by IP (5/min). */
    public boolean tryConsumeResendIp(String ip) {
        return resendIpBucket(ip == null ? "unknown" : ip).tryConsume(1);
    }

    /** Seconds until next token for RESEND by IP. (Call only after tryConsumeResendIp returned false). */
    public long secondsUntilResendIp(String ip) {
        ConsumptionProbe probe = resendIpBucket(ip == null ? "unknown" : ip).tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed())
            return 0; // allowed, so no wait
        long secs = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill());
        return Math.max(secs, 1);
    }

    /** Try-consume 1 token for RESEND by email (3/hour). */
    public boolean tryConsumeResendEmail(String email) {
        return resendEmailBucket(email).tryConsume(1);
    }

    /** Seconds until next token for RESEND by email. (Call only after tryConsumeResendEmail returned false). */
    public long secondsUntilResendEmail(String email) {
        ConsumptionProbe probe = resendEmailBucket(email).tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed())
            return 0;
        long secs = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill());
        return Math.max(secs, 1);
    }

    /* =========================
     *   Backward-compatible generic helpers
     * ========================= */

    /** Generic try-consume: 3 requests per 5 minutes for the given key. */
    public boolean tryConsume(String key) {
        return genericBucket(key).tryConsume(1);
    }

    /** Seconds until next token for the generic policy (call after tryConsume(key) == false). */
    public long secondsUntilNextToken(String key) {
        ConsumptionProbe probe = genericBucket(key).tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed())
            return 0;
        long secs = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill());
        return Math.max(secs, 1);
    }
}
