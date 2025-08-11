package com.compilingjava.common.errors;

import com.compilingjava.auth.service.exceptions.EmailDeliveryException;
import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.auth.service.exceptions.RateLimitedException;
import com.compilingjava.auth.service.exceptions.WeakPasswordException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {

    // 410 Gone — reset/verify link expired or used (and "invalid" if you prefer)
    @ExceptionHandler({ ExpiredOrUsedTokenException.class, InvalidTokenException.class })
    public ResponseEntity<ErrorResponse> handleTokenGone(RuntimeException ex, HttpServletRequest req) {
        return build(HttpStatus.GONE, "TOKEN_GONE", safeMsg(ex, "Link is expired or invalid."), req, null);
    }

    // 400 Bad Request — weak password, malformed input, etc.
    @ExceptionHandler(WeakPasswordException.class)
    public ResponseEntity<ErrorResponse> handleWeakPassword(WeakPasswordException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "WEAK_PASSWORD", safeMsg(ex, "Password does not meet requirements."), req,
                null);
    }

    // 429 Too Many Requests — surface Retry-After
    @ExceptionHandler(RateLimitedException.class)
    public ResponseEntity<ErrorResponse> handleRateLimited(RateLimitedException ex, HttpServletRequest req) {
        ResponseEntity<ErrorResponse> resp = build(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED",
                safeMsg(ex, "Too many requests."), req, ex.retryAfterSeconds());
        return ResponseEntity.status(resp.getStatusCode())
                .headers(h -> {
                    if (ex.retryAfterSeconds() != null)
                        h.add(HttpHeaders.RETRY_AFTER, String.valueOf(ex.retryAfterSeconds()));
                    h.addAll(resp.getHeaders());
                })
                .body(resp.getBody());
    }

    // Bean validation (@Valid) -> field errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe -> fields.put(fe.getField(), fe.getDefaultMessage()));
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed.", req, null, fields);
    }

    // For programmatic validator calls
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex,
            HttpServletRequest req) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v -> fields.put(v.getPropertyPath().toString(), v.getMessage()));
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed.", req, null, fields);
    }

    // If you sometimes throw ResponseStatusException / ErrorResponseException
    @ExceptionHandler({ ErrorResponseException.class })
    public ResponseEntity<ErrorResponse> handleResponseStatus(ErrorResponseException ex, HttpServletRequest req) {
        HttpStatus status = (HttpStatus) ex.getStatusCode();
        String code = status.is4xxClientError() ? "BAD_REQUEST" : "ERROR";
        return build(status, code, ex.getMessage(), req, null);
    }

    // Fallback 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAny(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Something went wrong.", req, null);
    }

    @ExceptionHandler(com.compilingjava.auth.service.exceptions.EmailDeliveryException.class)
    public ResponseEntity<ErrorResponse> emailFail(EmailDeliveryException ex, HttpServletRequest req) {
        return build(HttpStatus.SERVICE_UNAVAILABLE, "EMAIL_SEND_FAILED",
                "We couldn't send the email right now. Please try again shortly.", req, null);
    }

    // ---- helpers ----
    private ResponseEntity<ErrorResponse> build(HttpStatus status, String code, String msg,
            HttpServletRequest req, Long retryAfterSeconds) {
        return build(status, code, msg, req, retryAfterSeconds, null);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String code, String msg,
            HttpServletRequest req, Long retryAfterSeconds,
            Map<String, String> fieldErrors) {
        ErrorResponse body = new ErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                code,
                msg,
                req.getRequestURI(),
                fieldErrors);
        var headers = new HttpHeaders();
        if (retryAfterSeconds != null)
            headers.add(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        return new ResponseEntity<>(body, headers, status);
    }

    private static String safeMsg(Throwable ex, String fallback) {
        String m = ex.getMessage();
        return (m == null || m.isBlank()) ? fallback : m;
    }
}
