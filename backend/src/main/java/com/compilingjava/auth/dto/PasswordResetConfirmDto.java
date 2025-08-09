// src/main/java/com/compilingjava/auth/dto/PasswordResetConfirmDto.java
package com.compilingjava.auth.dto;

public record PasswordResetConfirmDto(
        @jakarta.validation.constraints.NotBlank String token,
        // Make this match your password rules
        @jakarta.validation.constraints.Size(min = 8, max = 128) String newPassword) {
}