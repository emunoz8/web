// src/main/java/com/compilingjava/auth/dto/PasswordResetRequestDto.java
package com.compilingjava.auth.dto;

public record PasswordResetRequestDto(
                @jakarta.validation.constraints.Email @jakarta.validation.constraints.NotBlank String email) {
}