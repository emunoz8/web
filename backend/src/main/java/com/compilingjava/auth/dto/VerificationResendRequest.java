package com.compilingjava.auth.dto;

public record VerificationResendRequest(
        @jakarta.validation.constraints.Email String email) {
}
