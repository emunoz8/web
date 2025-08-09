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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
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

    @Value("${app.urls.email-verify-base}")
    private String emailVerifyBase;

    // Optional hint endpoint for humans
    @GetMapping("/login")
    public ResponseEntity<String> loginPage() {
        return ResponseEntity.ok("POST username/password to /api/auth/login");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserRequestDto request) {
        UserResponseDto createdUser = userService.createUser(request);

        String token = emailVerificationService.generateToken(createdUser.getEmail());
        String link = emailVerifyBase + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);

        emailSender.send(
                createdUser.getEmail(),
                "Verify your email",
                "Hi " + createdUser.getUsername() + ",\n\nClick to confirm: " + link);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping("/confirm-email")
    public ResponseEntity<Void> confirmEmail(@RequestParam String token) {
        URI success = URI.create("https://compilingjava.com/verified?status=success");
        URI invalid = URI.create("https://compilingjava.com/verified?status=invalid");
        URI expired = URI.create("https://compilingjava.com/verified?status=expired");

        try {
            String email = emailVerificationService.validateAndConsume(token); // single-use
            var user = userService.findByEmail(email).orElseThrow();

            if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                userService.save(user);
            }
            return ResponseEntity.status(HttpStatus.SEE_OTHER).location(success).build();

        } catch (EmailVerificationException e) {
            URI where = switch (e.getReason()) {
                case EXPIRED -> expired;
                case INVALID, USED -> invalid;
            };
            return ResponseEntity.status(HttpStatus.SEE_OTHER).location(where).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SEE_OTHER).location(invalid).build();
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resend(@RequestParam String email) {
        userService.findByEmail(email)
                .filter(u -> !u.isEmailVerified())
                .ifPresent(u -> {
                    String token = emailVerificationService.generateToken(u.getEmail()); // revokes old
                    String link = emailVerifyBase + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
                    emailSender.send(u.getEmail(), "Verify your email", "Click to confirm: " + link);
                });

        // Always 204 to avoid account enumeration
        return ResponseEntity.noContent().build();
    }
}
