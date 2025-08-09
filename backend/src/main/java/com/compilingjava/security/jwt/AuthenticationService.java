package com.compilingjava.security.jwt;

import com.compilingjava.auth.dto.AuthRequest;
import com.compilingjava.auth.dto.AuthResponse;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse authenticate(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        if (!user.isEmailVerified()) {
            throw new IllegalStateException("Email not verified. Please check your inbox.");
        }

        String token = jwtService.generateSessionToken(request.getEmail());

        return new AuthResponse(token);
    }
}
