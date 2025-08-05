package com.compilingjava.controller;

import com.compilingjava.dto.AuthRequest;
import com.compilingjava.dto.AuthResponse;
import com.compilingjava.dto.UserRequestDto;
import com.compilingjava.dto.UserResponseDto;
import com.compilingjava.model.User;
import com.compilingjava.service.AuthenticationService;
import com.compilingjava.service.EmailVerificationService;
import com.compilingjava.service.UserService;
import com.compilingjava.service.email.EmailSender;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final EmailSender emailSender;

    @GetMapping("/login")
    public ResponseEntity<String> loginPage() {
        return ResponseEntity
                .ok("Please log in using a POST request to /api/auth/login with your username and password.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = authenticationService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserRequestDto request) {
        UserResponseDto createdUser = userService.createUser(request);

        String token = emailVerificationService.generateToken(createdUser.getEmail());
        String confirmationLink = "http://localhost:8080/api/auth/confirm-email?token=" + token;

        emailSender.send(createdUser.getEmail(), "Verify your email", "Click to confirm: " + confirmationLink);

        return ResponseEntity.ok(createdUser);
    }

    @GetMapping("/confirm-email")
    public ResponseEntity<String> confirmEmail(@RequestParam String token) {
        try {
            String email = emailVerificationService.validateTokenAndExtractEmail(token);

            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Email not registered"));

            if (user.isEmailVerified()) {
                return ResponseEntity.ok("Email already verified.");
            }

            user.setEmailVerified(true);
            userService.save(user);

            return ResponseEntity.ok("Email verified successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
