package com.compilingjava.common.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    // One bucket per key (email/IP/etc.)
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Example policy: 3 requests / 5 minutes, start full
    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(3) // bucket size
                .refillIntervally(3, Duration.ofMinutes(5)) // add 3 tokens every 5 minutes
                .initialTokens(3) // start full
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket bucketFor(String key) {
        return buckets.computeIfAbsent(key, k -> newBucket());
    }

    /** Try to consume 1 token for the given key. Returns true if allowed, false if limited. */
    public boolean tryConsume(String key) {
        return bucketFor(key).tryConsume(1);
    }

    /** Seconds until the next token becomes available (0 if already allowed). */
    public long secondsUntilNextToken(String key) {
        // Probe for consuming 1 token; does NOT consume if not allowed
        ConsumptionProbe probe = bucketFor(key).tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed())
            return 0; // already allowed right now
        long nanos = probe.getNanosToWaitForRefill();
        long secs = TimeUnit.NANOSECONDS.toSeconds(nanos);
        return secs > 0 ? secs : 1; // round up to at least 1s
    }
}
