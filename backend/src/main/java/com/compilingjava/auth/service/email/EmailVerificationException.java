package com.compilingjava.auth.service.email;

public class EmailVerificationException extends RuntimeException {
    public enum Reason {
        EXPIRED, INVALID, USED
    }

    private final Reason reason;

    public EmailVerificationException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public EmailVerificationException(Reason reason, String message, Throwable cause) {
        super(message, cause);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
