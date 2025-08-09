package com.compilingjava.auth.web;

import com.compilingjava.auth.dto.AuthRequest;
import com.compilingjava.auth.dto.AuthResponse;
import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.auth.service.email.EmailVerificationException;
import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.security.jwt.AuthenticationService;
import com.compilingjava.user.dto.UserRequestDto;
import com.compilingjava.user.dto.UserResponseDto;
import com.compilingjava.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final EmailSender emailSender;

    // If you want to keep a friendly hint endpoint:
    @GetMapping("/login")
    public ResponseEntity<String> loginPage() {
        return ResponseEntity.ok("POST username/password to /api/auth/login");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authenticationService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserRequestDto request) {
        UserResponseDto createdUser = userService.createUser(request);

        String token = emailVerificationService.generateToken(createdUser.getEmail());
        // TODO: externalize base URL
        String link = "http://localhost:8080/api/auth/confirm-email?token=" + token;
        emailSender.send(createdUser.getEmail(), "Verify your email", "Click to confirm: " + link);

        return ResponseEntity.ok(createdUser);
    }

    @GetMapping("/confirm-email")
    public ResponseEntity<Void> confirmEmail(@RequestParam String token) {
        // Frontend landing pages
        var success = URI.create("https://compilingjava.com/verified?status=success");
        var already = URI.create("https://compilingjava.com/verified?status=already");
        var invalid = URI.create("https://compilingjava.com/verified?status=invalid");
        var expired = URI.create("https://compilingjava.com/verified?status=expired");

        try {
            // Validate token (signature + TTL) and mark it "used" atomically
            String email = emailVerificationService.validateAndConsume(token);

            var user = userService.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Email not registered"));

            if (user.isEmailVerified()) {
                return ResponseEntity.status(303).location(already).build();
            }

            user.setEmailVerified(true);
            userService.save(user);

            // optional: delete/mark token used inside the service to prevent replay
            emailVerificationService.validateAndConsume(token);

            return ResponseEntity.status(303).location(success).build();

        } catch (EmailVerificationException e) {
            // Custom exception from your service with a reason enum
            URI where = switch (e.getReason()) {
                case EXPIRED -> expired;
                case INVALID, USED -> invalid;
            };
            return ResponseEntity.status(303).location(where).build();

        } catch (RuntimeException e) {
            // Fallback: treat as invalid
            return ResponseEntity.status(303).location(invalid).build();
        }
    }

}
