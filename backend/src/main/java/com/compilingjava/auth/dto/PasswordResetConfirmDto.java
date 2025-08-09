// src/main/java/com/compilingjava/auth/dto/PasswordResetConfirmDto.java
package com.compilingjava.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetConfirmDto(
                @NotBlank String token,
                @NotBlank @Size(min = 8, max = 100) String newPassword) {
}
