package com.compilingjava.auth.service.email;

import org.springframework.stereotype.Service;

import com.compilingjava.security.jwt.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final JwtService jwtService;

    public String generateToken(String email) {
        return jwtService.generateEmailVerificationToken(email);
    }

    public String validateTokenAndExtractEmail(String token) {
        return jwtService.extractEmailFromToken(token);
    }
}
