// src/main/java/com/compilingjava/auth/web/PasswordResetController.java
package com.compilingjava.auth.web;

import com.compilingjava.auth.dto.PasswordResetConfirmDto;
import com.compilingjava.auth.dto.PasswordResetRequestDto;
import com.compilingjava.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/password")
public class PasswordResetController {

    private final PasswordResetService service;

    // Step 1: user submits email
    @PostMapping("/forgot")
    public ResponseEntity<Void> forgot(@Valid @RequestBody PasswordResetRequestDto dto) {
        service.issueToken(dto.email());
        return ResponseEntity.noContent().build();
    }

    // Step 2: user posts token + new password
    @PostMapping("/reset")
    public ResponseEntity<Void> reset(@Valid @RequestBody PasswordResetConfirmDto dto) {
        service.resetPassword(dto.token(), dto.newPassword());
        return ResponseEntity.noContent().build();
    }
}
