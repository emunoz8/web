package com.compilingjava.security.jwt;

import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.config.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private static final String ISS = "https://api.compilingjava.com";
    private static final String AUD = "compilingjava-web";

    private final JwtProperties jwtProperties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.signingKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    /* =========================
     ACCESS TOKEN (Bearer JWT)
     ========================= */

    public record AccessClaims(
            String sub, // subject: user id or username
            String email, // user email
            UUID jti, // token id
            Instant exp, // expiry
            List<String> roles // authorities, e.g. ROLE_USER
    ) {
    }

    /** Preferred generator for access tokens. */
    public String generateAccessToken(String subject, String email, List<String> roles, Duration ttl) {
        Instant now = Instant.now();
        Instant exp = now.plus(ttl);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .issuer(ISS)
                .audience().add(AUD).and()
                .subject(subject)
                .claim("email", email)
                .claim("roles", roles == null ? List.of() : roles)
                .claim("typ", "access")
                .id(jti)
                .issuedAt(Date.from(now))
                .notBefore(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public String generateAccessToken(String subject, String email, List<String> roles) {
        return generateAccessToken(subject, email, roles,
                java.time.Duration.ofMillis(jwtProperties.getExpiration()));
    }

    public AccessClaims parseAccessToken(String token) {
        var parser = Jwts.parser()
                .requireIssuer(ISS)
                .requireAudience(AUD)
                .verifyWith(signingKey)
                .build();

        var claims = parser.parseSignedClaims(token).getPayload();

        Object typ = claims.get("typ");
        if (!(typ instanceof String t) || !"access".equals(t)) {
            throw new InvalidTokenException("Wrong token type");
        }

        String sub = claims.getSubject();
        String email = claims.get("email", String.class);
        String jtiStr = claims.getId();
        UUID jti = null;
        if (jtiStr != null && !jtiStr.isBlank()) {
            try {
                jti = UUID.fromString(jtiStr);
            } catch (Exception ignored) {
            }
        }

        Instant exp = claims.getExpiration().toInstant();

        @SuppressWarnings("unchecked")
        List<String> roles = Optional.ofNullable((List<Object>) claims.get("roles"))
                .map(list -> list.stream().map(Object::toString).toList())
                .orElseGet(List::of);

        var now = Instant.now();
        if (exp.isBefore(now))
            throw new InvalidTokenException("Token expired");
        var nbf = claims.getNotBefore();
        if (nbf != null && nbf.toInstant().isAfter(now))
            throw new InvalidTokenException("Token not yet valid");

        return new AccessClaims(sub, email, jti, exp, roles);
    }

    /* =========================
     EMAIL VERIFICATION TOKEN
     ========================= */

    public record EmailVerifyClaims(String email, UUID jti, Instant exp) {
    }

    public String generateEmailVerificationToken(String email, Duration ttl) {
        String jti = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Instant exp = now.plus(ttl);

        return Jwts.builder()
                .issuer(ISS)
                .audience().add(AUD).and()
                .subject(email)
                .claim("typ", "email_verify")
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public EmailVerifyClaims parseEmailVerificationToken(String token) {
        try {
            var payload = Jwts.parser()
                    .requireIssuer(ISS)
                    .requireAudience(AUD)
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Object typ = payload.get("typ");
            if (!(typ instanceof String t) || !"email_verify".equals(t)) {
                throw new InvalidTokenException("Wrong token type");
            }

            String email = payload.getSubject();
            String jti = payload.getId();
            Date exp = payload.getExpiration();
            if (email == null || jti == null || exp == null) {
                throw new InvalidTokenException("Missing required claims");
            }

            return new EmailVerifyClaims(email, UUID.fromString(jti), exp.toInstant());

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new ExpiredOrUsedTokenException();
        } catch (InvalidTokenException e) {
            throw e;
        } catch (Exception e) {
            throw new InvalidTokenException("Invalid token");
        }
    }

    /* =========================
     Back-compat helpers
     ========================= */

    /** Legacy helper; prefer {@link #generateAccessToken}. */
    public String generateSessionToken(String email) {
        // use the configured expiration as an access TTL
        long ms = jwtProperties.getExpiration(); // existing prop, milliseconds
        return generateAccessToken(
                email, // subject
                email, // email
                List.of(), // roles if you don't set here
                Duration.ofMillis(ms));
    }

    /** Legacy helper; prefer {@link #generateEmailVerificationToken}. */
    public String generateEmailConfirmationToken(String email) {
        long ms = jwtProperties.getEmailExpiration(); // existing prop, milliseconds
        return generateEmailVerificationToken(email, Duration.ofMillis(ms));
    }

    // Existing utility methods you had; leaving intact in case other code uses them.

    public String extractUsername(String token) {
        return Jwts.parser().verifyWith(signingKey).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public String extractEmailFromToken(String token) {
        return extractUsername(token);
    }

    public boolean isTokenExpired(String token) {
        Date exp = Jwts.parser().verifyWith(signingKey).build()
                .parseSignedClaims(token).getPayload().getExpiration();
        return exp.before(new Date());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}
