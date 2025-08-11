package com.compilingjava.auth.web;

import com.compilingjava.auth.dto.ResetPasswordRequest;
import com.compilingjava.auth.dto.TokenInspection;
import com.compilingjava.auth.dto.ResetLinkRequest;
import com.compilingjava.auth.service.PasswordResetService;
import com.compilingjava.common.ratelimit.RateLimiterService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/password")
public class PasswordResetController {

    private final PasswordResetService service;
    private final RateLimiterService rateLimiter;

    @PostMapping(value = "/reset-link", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> requestReset(@Valid @RequestBody ResetLinkRequest dto,
            HttpServletRequest req) {

        // Safer client IP (trust proxy headers if ForwardedHeaderFilter is enabled)
        String ip = clientIp(req);
        String kEmail = "pw-reset:email:" + dto.email().toLowerCase();
        String kIp = "pw-reset:ip:" + ip;

        boolean allowEmail = rateLimiter.tryConsume(kEmail);
        boolean allowIp = rateLimiter.tryConsume(kIp);

        if (!(allowEmail && allowIp)) {
            long retry = Math.max(
                    rateLimiter.secondsUntilNextToken(kEmail),
                    rateLimiter.secondsUntilNextToken(kIp));
            return ResponseEntity.status(429)
                    .header("Retry-After", String.valueOf(Math.max(1, retry)))
                    .build();
        }

        service.issueToken(dto.email());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/validate")
    public ResponseEntity<TokenInspection> validate(@RequestParam("token") String token) {
        var info = service.inspect(token);
        return info.valid() ? ResponseEntity.ok(info) : ResponseEntity.status(HttpStatus.GONE).body(info);
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> reset(@Valid @RequestBody ResetPasswordRequest req) {
        service.resetPassword(req.token(), req.newPassword());
        return ResponseEntity.noContent().build();

    }

    private static String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // If multiple, first is the client
            int comma = xff.indexOf(',');
            return comma > 0 ? xff.substring(0, comma).trim() : xff.trim();
        }
        String realIp = req.getHeader("X-Real-IP");
        return (realIp != null && !realIp.isBlank()) ? realIp : req.getRemoteAddr();
    }
}
