package com.compilingjava.auth.service.exceptions;

public class RateLimitedException extends RuntimeException {
    private final Long retryAfterSeconds;

    public RateLimitedException(String message, Long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public Long retryAfterSeconds() {
        return retryAfterSeconds;
    }
}
