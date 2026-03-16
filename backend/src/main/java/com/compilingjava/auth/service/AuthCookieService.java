package com.compilingjava.auth.service;

import com.compilingjava.config.AuthCookieProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthCookieService {

    private final AuthCookieProperties properties;

    public AuthCookieService(AuthCookieProperties properties) {
        this.properties = properties;
    }

    public void writeAccessToken(HttpServletResponse response, String token, Duration ttl) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(token, ttl).toString());
    }

    public void clearAccessToken(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("", Duration.ZERO).toString());
    }

    public String readAccessToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (properties.getName().equals(cookie.getName())) {
                String value = cookie.getValue();
                return value == null || value.isBlank() ? null : value;
            }
        }

        return null;
    }

    private ResponseCookie buildCookie(String value, Duration ttl) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(properties.getName(), value)
                .httpOnly(true)
                .secure(properties.isSecure())
                .path(properties.getPath())
                .sameSite(properties.getSameSite())
                .maxAge(ttl);

        String domain = properties.getDomain();
        if (domain != null && !domain.isBlank()) {
            builder.domain(domain.trim());
        }

        return builder.build();
    }
}
