package com.compilingjava.auth.dto;

import java.time.Instant;

public record TokenInspection(
        boolean valid,
        TokenReason reason,
        String maskedEmail,
        Instant expiresAt

) {
}