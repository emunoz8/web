package com.compilingjava.auth.web;

import com.compilingjava.auth.dto.AuthRequest;
import com.compilingjava.auth.dto.AuthResponse;
import com.compilingjava.auth.dto.VerificationResendRequest;
import com.compilingjava.auth.service.email.EmailSender;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final EmailSender emailSender;

    /** The API endpoint we send in emails to handle verification. */
    @Value("${app.urls.email-verify-base:http://localhost:8080/auth/confirm-email}")
    private String emailVerifyBase;

    /** Base URL for web app to redirect users after verification. */
    @Value("${app.web.base-url:https://compilingjava.com}")
    private URI webBaseUri;

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

        // Create single-use, short-lived token and email it
        String token = emailVerificationService.generateToken(createdUser.getEmail());
        String link = UriComponentsBuilder.fromUriString(emailVerifyBase)
                .queryParam("token", token)
                .build(true) // keep token as-is (encoded already if needed)
                .toUriString();

        emailSender.send(
                createdUser.getEmail(),
                "Verify your email",
                "Hi " + createdUser.getUsername() + ",\n\nClick to confirm: " + link + "\n\n"
                        + "If you didn’t request this, you can ignore this email.");

        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    /** Public: user clicks the email link. */
    @GetMapping("/confirm-email")
    public ResponseEntity<Void> confirmEmail(@RequestParam String token) {
        try {
            emailVerificationService.verify(token); // validate + consume + mark user verified
            return seeOther(verifiedUri("success"));
        } catch (ExpiredOrUsedTokenException e) {
            return seeOther(verifiedUri("expired"));
        } catch (InvalidTokenException e) {
            return seeOther(verifiedUri("invalid"));
        } catch (Exception e) {
            return seeOther(verifiedUri("invalid"));
        }
    }

    /** Alias for compatibility if you ever send /api/auth/verify?token=... */
    @GetMapping("/verify")
    public ResponseEntity<Void> verifyAlias(@RequestParam String token) {
        return confirmEmail(token);
    }

    // ----- helpers -----
    private URI verifiedUri(String status) {
        return UriComponentsBuilder
                .fromUri(webBaseUri)
                .path("/verified")
                .queryParam("status", status)
                .build()
                .toUri();
    }

    private static ResponseEntity<Void> seeOther(URI where) {
        return ResponseEntity.status(HttpStatus.SEE_OTHER).location(where).build();
    }
}
