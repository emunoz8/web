package com.compilingjava;

import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.config.JwtProperties;
import com.compilingjava.security.jwt.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtServiceTests {

    // 64 ASCII chars -> 64 bytes (>= 256 bits) => strong enough for HS256
    private static final String SECRET = "0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF";

    private JwtService jwt;
    private JwtProperties props;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    @BeforeEach
    void setUp() {
        props = mock(JwtProperties.class);
        // Only the secret is always needed to construct JwtService
        when(props.getSecret()).thenReturn(SECRET);

        jwt = new JwtService(props);
    }

    @Test
    void sessionToken_roundTrip_is_valid_and_not_expired() {
        // Stub expiration only for this test (used by generateSessionToken)
        when(props.getExpiration()).thenReturn(3_600_000L); // 1h in ms

        String email = "alice@example.com";
        String token = jwt.generateSessionToken(email);

        assertThat(jwt.extractUsername(token)).isEqualTo(email);
        assertThat(jwt.isTokenExpired(token)).isFalse();

        var user = new User(email, "pw", Collections.emptyList());
        assertThat(jwt.isTokenValid(token, user)).isTrue();
    }

    @Test
    void emailVerification_generate_and_parse_returns_claims() {
        String email = "bob@example.com";
        String token = jwt.generateEmailVerificationToken(email, Duration.ofMinutes(5));

        JwtService.EmailVerifyClaims claims = jwt.parseEmailVerificationToken(token);

        assertThat(claims.email()).isEqualTo(email);
        assertThat(claims.jti()).isNotNull();
        assertThat(claims.exp()).isAfter(Instant.now());
    }

    @Test
    void emailVerification_expired_throws_ExpiredOrUsedTokenException() {
        String email = "carol@example.com";
        // negative TTL => exp in the past
        String token = jwt.generateEmailVerificationToken(email, Duration.ofSeconds(-5));

        assertThatThrownBy(() -> jwt.parseEmailVerificationToken(token))
                .isInstanceOf(ExpiredOrUsedTokenException.class);
    }

    @Test
    void emailVerification_wrong_type_throws_InvalidTokenException() {
        // Build a token with a wrong "typ" but valid signature and required claims
        SecretKey k = key();
        String wrongType = Jwts.builder()
                .subject("dave@example.com")
                .claim("typ", "not_email_verify")
                .id("abc123")
                .issuedAt(new Date())
                .expiration(Date.from(Instant.now().plusSeconds(300)))
                .signWith(k, Jwts.SIG.HS256)
                .compact();

        assertThatThrownBy(() -> jwt.parseEmailVerificationToken(wrongType))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Wrong token type");
    }

    @Test
    void emailVerification_missing_required_claims_throws_InvalidTokenException() {
        // Missing jti and exp should fail with "Missing required claims"
        SecretKey k = key();
        String missing = Jwts.builder()
                .claim("typ", "email_verify")
                .subject("erin@example.com")
                .issuedAt(new Date())
                .signWith(k, Jwts.SIG.HS256)
                .compact();

        assertThatThrownBy(() -> jwt.parseEmailVerificationToken(missing))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Missing required claims");
    }

    @Test
    void emailVerification_tampered_signature_throws_InvalidTokenException() {
        String email = "frank@example.com";
        String token = jwt.generateEmailVerificationToken(email, Duration.ofMinutes(5));

        String tampered = tamperPayload(token); // flip one bit in payload (signature now invalid)

        assertThatThrownBy(() -> jwt.parseEmailVerificationToken(tampered))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void emailConfirmation_roundTrip_subject_ok() {
        when(props.getEmailExpiration()).thenReturn(300_000L); // 5m
        String email = "conf@example.com";
        String token = jwt.generateEmailConfirmationToken(email);
        assertThat(jwt.extractUsername(token)).isEqualTo(email);
        assertThat(jwt.isTokenExpired(token)).isFalse();
    }

    @Test
    void isTokenValid_false_when_username_mismatch() {
        when(props.getExpiration()).thenReturn(3_600_000L);
        String token = jwt.generateSessionToken("alice@example.com");
        var other = new org.springframework.security.core.userdetails.User(
                "bob@example.com", "pw", java.util.Collections.emptyList());
        assertThat(jwt.isTokenValid(token, other)).isFalse();
    }

    @Test
    void isTokenValid_throws_when_expired() {
        // craft an already-expired token using the same secret
        var k = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                SECRET.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        String token = io.jsonwebtoken.Jwts.builder()
                .subject("alice@example.com")
                .issuedAt(new java.util.Date(System.currentTimeMillis() - 10_000))
                .expiration(new java.util.Date(System.currentTimeMillis() - 5_000))
                .signWith(k, io.jsonwebtoken.Jwts.SIG.HS256)
                .compact();

        var user = new org.springframework.security.core.userdetails.User(
                "alice@example.com", "pw", java.util.Collections.emptyList());

        // current JwtService extracts subject first -> ExpiredJwtException is thrown
        assertThatThrownBy(() -> jwt.isTokenValid(token, user))
                .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }

    @Test
    void emailVerification_malformed_token_throws_InvalidTokenException() {
        assertThatThrownBy(() -> jwt.parseEmailVerificationToken("not.a.jwt"))
                .isInstanceOf(com.compilingjava.auth.service.exceptions.InvalidTokenException.class);
    }

    @Test
    void extractEmailFromToken_returns_subject() {
        when(props.getEmailExpiration()).thenReturn(60_000L); // 1m
        String email = "alias@example.com";
        String token = jwt.generateEmailConfirmationToken(email);
        assertThat(jwt.extractEmailFromToken(token)).isEqualTo(email);
    }

    @Test
    void isTokenExpired_throws_when_token_is_expired() {
        var k = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                SECRET.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        // definitely in the past
        String token = io.jsonwebtoken.Jwts.builder()
                .subject("any@example.com")
                .issuedAt(new java.util.Date(System.currentTimeMillis() - 60_000))
                .expiration(new java.util.Date(System.currentTimeMillis() - 30_000))
                .signWith(k, io.jsonwebtoken.Jwts.SIG.HS256)
                .compact();

        assertThatThrownBy(() -> jwt.isTokenExpired(token))
                .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }

    @Test
    void isTokenExpired_false_on_future_token() {
        var k = key();
        String token = Jwts.builder()
                .subject("any@example.com")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000)) // +60s
                .signWith(k, Jwts.SIG.HS256)
                .compact();

        assertThat(jwt.isTokenExpired(token)).isFalse();
    }

    @Test
    void emailVerification_missing_subject_throws_InvalidTokenException() {
        var k = key();
        String token = Jwts.builder()
                .claim("typ", "email_verify")
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 300_000))
                .signWith(k, Jwts.SIG.HS256)
                .compact();

        assertThatThrownBy(() -> jwt.parseEmailVerificationToken(token))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Missing required claims");
    }

    @Test
    void emailVerification_invalid_jti_uuid_throws_InvalidTokenException() {
        var k = key();
        String token = Jwts.builder()
                .claim("typ", "email_verify")
                .subject("uuidbad@example.com")
                .id("not-a-uuid")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 300_000))
                .signWith(k, Jwts.SIG.HS256)
                .compact();

        // UUID.fromString(...) inside JwtService will throw -> mapped to InvalidTokenException
        assertThatThrownBy(() -> jwt.parseEmailVerificationToken(token))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void emailVerification_wrong_signing_key_throws_InvalidTokenException() {
        // Same claims, but signed with a DIFFERENT key -> signature verification fails
        var otherKey = Keys.hmacShaKeyFor(
                "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF".getBytes(StandardCharsets.UTF_8));

        String token = Jwts.builder()
                .claim("typ", "email_verify")
                .subject("sigbad@example.com")
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 300_000))
                .signWith(otherKey, Jwts.SIG.HS256)
                .compact();

        assertThatThrownBy(() -> jwt.parseEmailVerificationToken(token))
                .isInstanceOf(InvalidTokenException.class);
    }

    // --- helpers ---

    /** Flip one bit in the payload while keeping header & signature intact to force signature verification failure. */
    private static String tamperPayload(String jwt) {
        String[] parts = jwt.split("\\.");
        if (parts.length != 3)
            throw new IllegalArgumentException("Not a JWS compact token");
        byte[] payload = Base64.getUrlDecoder().decode(parts[1]);
        payload[0] ^= 0x01; // flip a bit
        String newPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload);
        return parts[0] + "." + newPayload + "." + parts[2];
    }
}
