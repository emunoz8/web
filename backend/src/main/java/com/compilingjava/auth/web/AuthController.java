package com.compilingjava.auth.web;

import com.compilingjava.auth.dto.AuthRequest;
import com.compilingjava.auth.dto.AuthResponse;
import com.compilingjava.auth.dto.VerificationResendRequest;
import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.auth.service.email.EmailVerificationException;
import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.security.jwt.AuthenticationService;
import com.compilingjava.user.dto.UserRequestDto;
import com.compilingjava.user.dto.UserResponseDto;
import com.compilingjava.user.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final EmailSender emailSender;

    @Value("${app.urls.email-verify-base:http://localhost:8080/api/auth/confirm-email}")
    private String emailVerifyBase;

    @Value("${app.web.base-url:https://compilingjava.com}")
    private String webBaseUrl;

    @Value("${app.web.base-url:https://compilingjava.com}")
    private URI webBaseUri; // Spring converts String -> URI

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
        try {
            emailVerificationService.verify(token);
            return seeOther(verifiedUri("success"));
        } catch (ExpiredOrUsedTokenException e) {
            return seeOther(verifiedUri("expired"));
        } catch (InvalidTokenException e) {
            return seeOther(verifiedUri("invalid"));
        } catch (Exception e) {
            return seeOther(verifiedUri("invalid"));
        }
    }

    // com.compilingjava.auth.web.AuthController (or VerificationController)
    @PostMapping("/api/auth/verify/resend")
    public ResponseEntity<Void> resend(@Valid @RequestBody VerificationResendRequest req,
            HttpServletRequest http) {
        // optional: rate-limit by email + IP
        // rateLimiter.tryConsume("verify:email:"+req.email().toLowerCase());
        // rateLimiter.tryConsume("verify:ip:"+clientIp(http));

        // Always 204 to avoid account enumeration
        emailVerificationService.resend(req.email()); // no-op if unknown/already verified
        return ResponseEntity.noContent().build();
    }

    // ----- helpers -----
    private URI verifiedUri(String status) {
        return UriComponentsBuilder
                .fromUri(webBaseUri) // not deprecated
                .path("/verified")
                .queryParam("status", status)
                .build()
                .toUri();
    }

    private static ResponseEntity<Void> seeOther(URI where) {
        return ResponseEntity.status(HttpStatus.SEE_OTHER).location(where).build();
    }

}
