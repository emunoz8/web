package com.compilingjava.security.jwt;

import com.compilingjava.config.JwtProperties;
import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;

import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.signingKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateSessionToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
                .claim("type", "session")
                .signWith(signingKey)
                .compact();
    }

    public String generateEmailConfirmationToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtProperties.getEmailExpiration()))
                .claim("type", "email_confirmation")
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenExpired(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration()
                .before(new Date());
    }

    public String extractEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public record EmailVerifyClaims(String email, UUID jti, Instant exp) {
    }

    public String generateEmailVerificationToken(String email, Duration ttl) {
        String jti = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Instant exp = now.plus(ttl);

        return Jwts.builder()
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
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Must be our verification token
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
            // Signature verified but token exp is in the past
            throw new ExpiredOrUsedTokenException();
        } catch (InvalidTokenException | ExpiredOrUsedTokenException e) {
            throw e;
        } catch (Exception e) {
            // Any other parse/verify problem
            throw new InvalidTokenException("Invalid token");
        }
    }
}
