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
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.validation.FieldError;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {

    // 410 Gone — reset/verify link expired or used
    @ExceptionHandler({ ExpiredOrUsedTokenException.class, InvalidTokenException.class })
    public ResponseEntity<ErrorResponse> handleTokenGone(RuntimeException ex, HttpServletRequest req) {
        return build(HttpStatus.GONE, "TOKEN_GONE", safeMsg(ex, "Link is expired or invalid."), req, null);
    }

    // 400 Bad Request — weak password, malformed input, etc.
    @ExceptionHandler(WeakPasswordException.class)
    public ResponseEntity<ErrorResponse> handleWeakPassword(WeakPasswordException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "WEAK_PASSWORD",
                safeMsg(ex, "Password does not meet requirements."), req, null);
    }

    // 429 Too Many Requests — include Retry-After
    @ExceptionHandler(RateLimitedException.class)
    public ResponseEntity<ErrorResponse> handleRateLimited(RateLimitedException ex, HttpServletRequest req) {
        return build(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED",
                safeMsg(ex, "Too many requests."), req, ex.retryAfterSeconds());
    }

    // 400 — Bean validation on @RequestBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            String msg = fe.getDefaultMessage();
            fields.put(fe.getField(), (msg == null || msg.isBlank()) ? "Invalid value" : msg);
        }
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed.", req, null, fields);
    }

    // 400 — Constraint violations on @RequestParam/@PathVariable/@Validated
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex,
            HttpServletRequest req) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v -> fields.put(v.getPropertyPath().toString(), v.getMessage()));
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed.", req, null, fields);
    }

    // 400 — Missing required request parameter
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex,
            HttpServletRequest req) {
        Map<String, String> fields = Map.of(ex.getParameterName(), "Parameter is required");
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed.", req, null, fields);
    }

    // 400 — Wrong type for request parameter/path variable
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
            HttpServletRequest req) {

        var body = ex.getRequiredType();

        String expected = body != null ? body.getSimpleName() : "required type";
        Map<String, String> fields = Map.of(ex.getName(), "Must be of type " + expected);
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed.", req, null, fields);
    }

    // 400 — Malformed JSON
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "BAD_JSON", "Malformed JSON request.", req, null);
    }

    // 401 / 403 — Security
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuth(AuthenticationException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Authentication required.", req, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Insufficient permissions.", req, null);
    }

    // For ResponseStatusException / ErrorResponseException
    @ExceptionHandler(ErrorResponseException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ErrorResponseException ex, HttpServletRequest req) {
        HttpStatus status = (HttpStatus) ex.getStatusCode();
        String code = status.is4xxClientError() ? "BAD_REQUEST" : "ERROR";
        return build(status, code, ex.getMessage(), req, null);
    }

    // Email failures
    @ExceptionHandler(EmailDeliveryException.class)
    public ResponseEntity<ErrorResponse> emailFail(EmailDeliveryException ex, HttpServletRequest req) {
        return build(HttpStatus.SERVICE_UNAVAILABLE, "EMAIL_SEND_FAILED",
                "We couldn't send the email right now. Please try again shortly.", req, null);
    }

    // Fallback 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAny(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Something went wrong.", req, null);
    }

    // 405 — wrong HTTP verb
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> methodNotAllowed(HttpRequestMethodNotSupportedException ex,
            HttpServletRequest req) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "HTTP method not allowed.", req, null);
    }

    // 415 — content-type not supported
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> mediaType(HttpMediaTypeNotSupportedException ex, HttpServletRequest req) {
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE", "Unsupported Content-Type.", req,
                null);
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
        HttpHeaders headers = new HttpHeaders();
        if (retryAfterSeconds != null) {
            headers.add(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        }
        return new ResponseEntity<>(body, headers, status);
    }

    private static String safeMsg(Throwable ex, String fallback) {
        String m = ex.getMessage();
        return (m == null || m.isBlank()) ? fallback : m;
    }
}
