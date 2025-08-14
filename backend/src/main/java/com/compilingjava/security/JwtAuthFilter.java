// src/main/java/com/compilingjava/security/JwtAuthFilter.java
package com.compilingjava.security;

import com.compilingjava.security.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Populates SecurityContext from a Bearer access token (if present and valid).
 * Skips CORS preflight (OPTIONS). Leaves context empty on parse/validation error.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final UserDetailsService users;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        // Skip CORS preflight; inspect everything else
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain)
            throws ServletException, IOException {

        // Already authenticated? continue
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            chain.doFilter(request, response);
            return;
        }

        // Must be "Authorization: Bearer <token>"
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            var c = jwt.parseAccessToken(token); // validates iss/aud/typ/signature/exp/nbf
            // Use subject (username) to load the user; make sure AuthenticationService sets sub=username
            String identity = c.sub();

            UserDetails user = users.loadUserByUsername(identity);
            var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception ex) {
            // Invalid/expired → stay anonymous; entry point will return 401 if endpoint requires auth
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}
