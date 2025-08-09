package com.compilingjava.auth.web;

import com.compilingjava.auth.dto.AuthRequest;
import com.compilingjava.auth.dto.AuthResponse;
import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.security.jwt.AuthenticationService;
import com.compilingjava.user.dto.UserRequestDto;
import com.compilingjava.user.dto.UserResponseDto;
import com.compilingjava.user.model.User;
import com.compilingjava.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<String> confirmEmail(@RequestParam String token) {
        String email = emailVerificationService.validateTokenAndExtractEmail(token);

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not registered"));

        if (user.isEmailVerified()) {
            return ResponseEntity.ok("Email already verified.");
        }

        user.setEmailVerified(true);
        userService.save(user);
        return ResponseEntity.ok("Email verified successfully.");
    }

    // -------- Password reset flow --------

    // // 1) User submits email to receive a reset link
    // @PostMapping("/password/forgot")
    // public ResponseEntity<String> forgotPassword(@RequestParam("email") String email) {
    //     var tokenOpt = userService.issuePasswordResetToken(email);
    //     tokenOpt.ifPresent(token -> {
    //         String link = "http://localhost:8080/api/auth/password/reset?token=" + token;
    //         emailSender.send(email, "Reset your password", "Click to reset: " + link);
    //     });
    //     return ResponseEntity.ok("If that account exists, we sent an email with reset instructions.");
    // }

    // // 2) User posts token + new password
    // @PostMapping("/password/reset")
    // public ResponseEntity<String> resetPassword(
    //         @RequestParam("token") String token,
    //         @RequestParam("newPassword") String newPassword) {
    //     userService.resetPasswordWithToken(token, newPassword); // implement in your UserService (or PasswordResetService)
    //     return ResponseEntity.ok("Password updated.");
    // }
}
