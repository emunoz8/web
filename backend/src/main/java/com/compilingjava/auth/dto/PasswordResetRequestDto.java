// src/main/java/com/compilingjava/auth/dto/PasswordResetRequestDto.java
package com.compilingjava.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequestDto(
        @NotBlank @Email String email) {
}
