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
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private List<String> allowedOrigins;

    /* ---------- Core beans ---------- */

    @Bean
    public UserDetailsService userDetailsService(UserRepository users) {
        // If you authenticate by email, switch to users.findByEmail(...)
        return username -> users.findByUsername(username)
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
            response.getWriter().write("{\"error\":\"forbidden\"}");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var cfg = new CorsConfiguration();

        // If credentials are used, browsers reject "*" — require explicit origins
        List<String> origins = (allowedOrigins == null || allowedOrigins.isEmpty()
                || (allowedOrigins.size() == 1 && "*".equals(allowedOrigins.get(0))))
                        ? List.of("http://localhost:3000")
                        : allowedOrigins;

        cfg.setAllowedOrigins(origins);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
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
                .csrf(csrf -> csrf.disable())
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
                        // .requestMatchers("/actuator/prometheus").permitAll() // uncomment only if you intentionally expose metrics

                        // Public auth endpoints
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/confirm-email", "/auth/verify").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/verify/resend").permitAll()
                        // Refresh: keep permitAll() only if cookie-based refresh; use authenticated() if using Authorization header
                        .requestMatchers(HttpMethod.POST, "/auth/refresh").permitAll()

                        // Public content reads
                        .requestMatchers(HttpMethod.GET, "/contents/**", "/comments/**").permitAll()

                        // Authenticated interactions
                        .requestMatchers(HttpMethod.POST, "/likes/**", "/comments/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/likes/**").authenticated()

                        // Admin content management
                        .requestMatchers(HttpMethod.POST, "/projects/**", "/blog-posts/**", "/contents/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/**").hasRole("ADMIN")

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
