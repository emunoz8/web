package com.compilingjava.auth.dto;

public record ResetPasswordRequest(
        String token,
        @jakarta.validation.constraints.Size(min = 8, max = 128) String newPassword) {
}