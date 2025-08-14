// src/main/java/com/compilingjava/auth/web/EmailVerificationController.java
package com.compilingjava.auth.web;

import com.compilingjava.auth.service.email.EmailVerificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService service;

    public record ResendRequest(@NotBlank @Email String email) {
    }

    @PostMapping("/verify/resend")
    public ResponseEntity<Void> resend(@Valid @RequestBody ResendRequest body) {
        service.resend(body.email()); // always responds 204 for valid format (non-enumerating)
        return ResponseEntity.noContent().build();
    }
}
