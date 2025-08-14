package com.compilingjava.security.jwt;

import com.compilingjava.auth.dto.AuthRequest;
import com.compilingjava.auth.dto.AuthResponse;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse authenticate(AuthRequest request) {
        // Load by USERNAME (matches your UserDetailsService)
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }
        if (!user.isEmailVerified()) {
            throw new IllegalStateException("Email not verified. Please check your inbox.");
        }

        // Map roles -> e.g., ROLE_USER / ROLE_ADMIN
        List<String> roles = (user.getRole() != null)
                ? List.of("ROLE_" + user.getRole().name())
                : List.of("ROLE_USER");

        // Issue ACCESS token: sub = username, claim email = user's email
        String accessToken = jwtService.generateAccessToken(
                user.getUsername(), // sub (what UserDetailsService expects)
                user.getEmail(), // email claim
                roles // claims for convenience (optional)
        );

        return new AuthResponse(accessToken);
    }
}
