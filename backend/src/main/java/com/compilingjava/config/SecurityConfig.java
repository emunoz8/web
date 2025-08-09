package com.compilingjava.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import com.compilingjava.user.repository.UserRepository;

// import com.compilingjava.auth.JwtAuthenticationFilter; // <-- if you have one

import java.util.List;

@Configuration
public class SecurityConfig {

    // Frontend origin(s) – set via env in prod
    @Value("${app.cors.allowed-origins:*}")
    private List<String> allowedOrigins;

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        // If you log in by email, rename to findByEmail
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationEntryPoint authEntryPoint() {
        // 401 JSON instead of HTML
        return (request, response, ex) -> {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"unauthorized\"}");
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        // 403 JSON
        return (request, response, ex) -> {
            response.setStatus(403);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"forbidden\"}");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(allowedOrigins == null || allowedOrigins.isEmpty()
                ? List.of("*")
                : allowedOrigins);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        cfg.setAllowCredentials(true); // set false if you use Authorization header for JWTs and no cookies
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider authProvider
    // , JwtAuthenticationFilter jwtFilter // <-- if you have one
    ) throws Exception {

        http
                .cors(c -> {
                }) // use the bean above
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authProvider)
                .exceptionHandling(eh -> eh
                        .authenticationEntryPoint(authEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler()))
                .authorizeHttpRequests(auth -> auth
                        // auth endpoints
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/confirm-email").permitAll()
                        .requestMatchers("/api/auth/resend-verification").permitAll()
                        .requestMatchers("/api/auth/password/**").permitAll()

                        // public reads
                        .requestMatchers(HttpMethod.GET, "/api/contents/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()

                        // likes/comments require login
                        .requestMatchers(HttpMethod.POST, "/api/likes/**", "/api/comments/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/likes/**").authenticated()

                        // content management – admin only
                        .requestMatchers(HttpMethod.POST, "/api/projects/**", "/api/blog-posts/**", "/api/contents/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")

                        // actuator health (optional public)
                        .requestMatchers("/actuator/health").permitAll()

                        // everything else → auth
                        .anyRequest().authenticated());

        // If you use JWT:
        // http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        // Also disable form & basic:
        http.httpBasic(b -> b.disable())
                .formLogin(f -> f.disable());

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
