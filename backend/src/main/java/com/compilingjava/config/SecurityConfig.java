// src/main/java/com/compilingjava/config/SecurityConfig.java
package com.compilingjava.config;

import com.compilingjava.security.JwtAuthFilter;
import com.compilingjava.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.InvalidCsrfTokenException;
import org.springframework.security.web.csrf.MissingCsrfTokenException;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173}")
    private List<String> allowedOrigins;

    /* ---------- Core beans ---------- */

    @Bean
    public UserDetailsService userDetailsService(UserRepository users) {
        // If you authenticate by email, switch to users.findByEmail(...)
        return username -> users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationEntryPoint authEntryPoint() {
        return (request, response, ex) -> {
            response.setStatus(401);
            response.setHeader("WWW-Authenticate", "Bearer");
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"unauthorized\"}");
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, ex) -> {
            response.setStatus(403);
            response.setContentType("application/json");
            if (ex instanceof MissingCsrfTokenException || ex instanceof InvalidCsrfTokenException) {
                response.getWriter().write("{\"error\":\"csrf_token_invalid\",\"message\":\"CSRF token missing or invalid.\"}");
                return;
            }
            response.getWriter().write("{\"error\":\"forbidden\"}");
        };
    }

    @Bean
    public CookieCsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookiePath("/");
        repository.setCookieName("XSRF-TOKEN");
        repository.setHeaderName("X-XSRF-TOKEN");
        return repository;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var cfg = new CorsConfiguration();

        // If credentials are used, browsers reject "*" — require explicit origins
        List<String> origins = (allowedOrigins == null || allowedOrigins.isEmpty()
                || (allowedOrigins.size() == 1 && "*".equals(allowedOrigins.get(0))))
                        ? List.of("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173")
                        : allowedOrigins;

        cfg.setAllowedOrigins(origins);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "X-XSRF-TOKEN"));
        cfg.setExposedHeaders(List.of("Location"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    /* ---------- HTTP security & filter chain ---------- */

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
            JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                .cors(c -> {
                })
                .csrf(csrf -> csrf.csrfTokenRepository(csrfTokenRepository()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(eh -> eh
                        .authenticationEntryPoint(authEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler()))
                .requestCache(rc -> rc.disable())
                .logout(l -> l.disable())
                .authorizeHttpRequests(auth -> auth
                        // CORS preflight & basic infra
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error", "/actuator/health", "/actuator/info").permitAll()

                        // Public auth endpoints (legacy + /api aliases)
                        .requestMatchers(HttpMethod.GET, "/auth/login", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/csrf", "/api/auth/csrf").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/google/config", "/api/auth/google/config").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/auth/login", "/auth/register",
                                "/api/auth/login", "/api/auth/register",
                                "/auth/google", "/api/auth/google",
                                "/auth/logout", "/api/auth/logout",
                                "/auth/verify/resend", "/api/auth/verify/resend",
                                "/auth/refresh", "/api/auth/refresh",
                                "/api/auth/password/reset-link",
                                "/api/auth/password/reset")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/auth/confirm-email", "/auth/verify",
                                "/api/auth/confirm-email", "/api/auth/verify",
                                "/api/auth/password/validate")
                        .permitAll()

                        // Public content reads
                        .requestMatchers(HttpMethod.GET,
                                "/api/contents",
                                "/api/contents/slug/**",
                                "/api/contents/id/**",
                                "/api/categories",
                                "/api/comments",
                                "/api/comments/tree",
                                "/api/contents/*/likes/count",
                                "/api/artist-suggest",
                                "/api/testing/playlist",
                                "/api/testing/currently-playing")
                        .permitAll()

                        // Authenticated interactions
                        .requestMatchers(HttpMethod.GET, "/api/testing/track-search").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/testing/playlist/items").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/comments/**", "/api/contents/*/likes").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/comments/**", "/api/contents/*/likes")
                        .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/contents/*/likes/me").authenticated()

                        // Admin content management
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Everything else
                        .anyRequest().authenticated())
                .headers(h -> h
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true).preload(true).maxAgeInSeconds(31536000))
                        // CSP is largely a frontend/browser concern; safe to keep, harmless for JSON
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'self'; " +
                                        "connect-src 'self' https://api.compilingjava.com; " +
                                        "script-src 'self'; " +
                                        "object-src 'none'; " +
                                        "base-uri 'self'; " +
                                        "frame-ancestors 'none'"))
                        .referrerPolicy(r -> r.policy(
                                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        .frameOptions(frame -> frame.deny()))
                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable());

        // 🔐 Insert our JWT filter
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
