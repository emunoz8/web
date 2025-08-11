// src/main/java/com/compilingjava/auth/dto/PasswordResetRequestDto.java
package com.compilingjava.auth.dto;

public record ResetLinkRequest(
        @jakarta.validation.constraints.Email @jakarta.validation.constraints.NotBlank String email) {
}