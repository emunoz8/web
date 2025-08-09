package com.compilingjava.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.compilingjava.user.repository.UserRepository;

@Configuration
public class SecurityConfig {

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public auth endpoints
                        .anyRequest().permitAll());

        // .requestMatchers("/api/auth/login").permitAll()
        // .requestMatchers("/api/auth/password/**").permitAll() // forgot/reset

        // // Public read-only endpoints (adjust to your actual routes)
        // .requestMatchers(HttpMethod.GET, "/api/contents/**").permitAll()
        // .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()

        // Optional: lock down create/update/delete to ADMIN
        // (uncomment/adjust if you have these endpoints)
        // .requestMatchers(HttpMethod.POST, "/api/projects/**", "/api/blog-posts/**", "/api/contents/**").hasRole("ADMIN")
        // .requestMatchers(HttpMethod.PUT,  "/api/**").hasRole("ADMIN")
        // .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")

        // Everything else requires authentication
        // .anyRequest().authenticated());

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
