package com.compilingjava.auth.web;

import com.compilingjava.auth.dto.AuthRequest;
import com.compilingjava.auth.dto.AuthResponse;
import com.compilingjava.auth.dto.AuthSessionResponse;
import com.compilingjava.auth.dto.CsrfTokenResponse;
import com.compilingjava.auth.dto.GoogleAuthConfigResponse;
import com.compilingjava.auth.dto.GoogleAuthRequest;
import com.compilingjava.auth.service.AuthCookieService;
import com.compilingjava.auth.service.GoogleAuthenticationService;
import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.security.jwt.AuthenticationService;
import com.compilingjava.config.JwtProperties;
import com.compilingjava.user.dto.UserRequestDto;
import com.compilingjava.user.dto.UserResponseDto;
import com.compilingjava.user.model.User;
import com.compilingjava.user.service.UserService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping({ "/auth", "/api/auth" })
public class AuthController {

    private final AuthenticationService authenticationService;
    private final GoogleAuthenticationService googleAuthenticationService;
    private final UserService userService;
    private final EmailVerificationService emailVerificationService;
    private final EmailSender emailSender;
    private final AuthCookieService authCookieService;
    private final JwtProperties jwtProperties;

    /** The API endpoint we send in emails to handle verification. */
    @Value("${app.urls.email-verify-base:http://localhost:8080/auth/confirm-email}")
    private String emailVerifyBase;

    /** Base URL for web app to redirect users after verification. */
    @Value("${app.web.base-url:https://compilingjava.com}")
    private URI webBaseUri;

    @Value("${auth.require-email-verification:true}")
    private boolean requireEmailVerification = true;

    // Optional hint endpoint for humans
    @GetMapping("/login")
    public ResponseEntity<String> loginPage() {
        return ResponseEntity.ok("POST username/password to /api/auth/login");
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
        return noContentWithAuthCookie(authenticationService.authenticate(request), response);
    }

    @PostMapping("/google")
    public ResponseEntity<Void> loginWithGoogle(@Valid @RequestBody GoogleAuthRequest request, HttpServletResponse response) {
        return noContentWithAuthCookie(googleAuthenticationService.authenticate(request.getIdToken()), response);
    }

    @GetMapping("/google/config")
    public ResponseEntity<GoogleAuthConfigResponse> googleConfig() {
        return ResponseEntity.ok(googleAuthenticationService.getPublicConfig());
    }

    @GetMapping("/session")
    public ResponseEntity<AuthSessionResponse> session(Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(toSession(user));
    }

    @GetMapping("/csrf")
    public ResponseEntity<CsrfTokenResponse> csrf(CsrfToken csrfToken) {
        return ResponseEntity.ok(new CsrfTokenResponse(
                csrfToken.getHeaderName(),
                csrfToken.getParameterName(),
                csrfToken.getToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        authCookieService.clearAccessToken(response);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserRequestDto request) {
        UserResponseDto createdUser = userService.createUser(request);

        if (requireEmailVerification) {
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
        }

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

    private ResponseEntity<Void> noContentWithAuthCookie(AuthResponse authResponse, HttpServletResponse response) {
        authCookieService.writeAccessToken(response, authResponse.getToken(), Duration.ofMillis(jwtProperties.getExpiration()));
        return ResponseEntity.noContent().build();
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalStateException("Authenticated user not found");
        }

        return userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    private AuthSessionResponse toSession(User user) {
        List<String> roles = (user.getRole() != null)
                ? List.of("ROLE_" + user.getRole().name())
                : List.of("ROLE_USER");
        return new AuthSessionResponse(
                user.getUsername(),
                user.getEmail(),
                roles,
                !user.isUsernameChanged());
    }
}
