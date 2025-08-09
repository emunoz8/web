package com.compilingjava.auth.web;

import com.compilingjava.auth.dto.PasswordResetConfirmDto;
import com.compilingjava.auth.dto.PasswordResetRequestDto;
import com.compilingjava.auth.service.PasswordResetService;
import com.compilingjava.auth.service.email.EmailVerificationException; // reuse a simple Reason enum if you have a similar Reset exception
//import com.compilingjava.common.ratelimit.RateLimiterService; // from earlier snippet

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import com.compilingjava.common.ratelimit.RateLimiterService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/password")
public class PasswordResetController {

    private final PasswordResetService service;
    private final RateLimiterService rateLimiter;

    // Frontend page where the user will enter a new password
    @Value("${app.urls.password-reset-base:https://compilingjava.com/reset-password}")
    private String resetBaseUrl;

    /**
     * Step 1: user submits email – always 204 (enumeration-safe).
     * Sends an email with a link like:
     *   https://compilingjava.com/reset-password?token=...
     */
    @PostMapping("/forgot")
    public ResponseEntity<Void> forgot(@Valid @RequestBody PasswordResetRequestDto dto, HttpServletRequest req) {
        // Rate limit by email and IP (e.g., 3 per 5 min, configured in RateLimiterService)
        String kEmail = "pw-forgot:email:" + dto.email().toLowerCase();
        String kIp = "pw-forgot:ip:" + req.getRemoteAddr();
        if (!rateLimiter.tryConsume(kEmail) || !rateLimiter.tryConsume(kIp)) {
            long retry = Math.max(rateLimiter.secondsUntilNextToken(kEmail), rateLimiter.secondsUntilNextToken(kIp));
            return ResponseEntity.status(429).header("Retry-After", String.valueOf(Math.max(1, retry))).build();
        }

        service.issueToken(dto.email());

        return ResponseEntity.noContent().build();
    }

    /**
     * Optional Step 1.5: Token pre-validation for the frontend.
     * Lets your SPA call this to check the token before showing the reset form.
     */
    @GetMapping("/validate")
    public ResponseEntity<Void> validate(@RequestParam("token") String token) {
        if (service.isTokenUsable(token)) {
            return ResponseEntity.noContent().build(); // 204 = OK
        }
        return ResponseEntity.status(HttpStatus.GONE).build(); // 410 Gone = invalid/expired/used
    }

    /**
     * Step 2: user posts token + new password. If valid, consumes token and sets the new password.
     */
    @PostMapping("/reset")
    public ResponseEntity<Void> reset(@Valid @RequestBody PasswordResetConfirmDto dto) {
        try {
            service.resetPassword(dto.token(), dto.newPassword()); // should atomically validate+consume
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            // invalid token / user not found / weak password (depending on your service error)
            return ResponseEntity.badRequest().build();
        } catch (SecurityException e) {
            // token expired/used or other auth issue
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
