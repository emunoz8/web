package com.compilingjava.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.compilingjava.dto.AuthRequest;
import com.compilingjava.dto.AuthResponse;

@Service
public class AuthenticationService {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthenticationService(
            AuthenticationManager authManager,
            JwtService jwtService) {
        this.authManager = authManager;
        this.jwtService = jwtService;

    }

    public AuthResponse authenticate(AuthRequest request) {
        UserDetails user;
        String token;

        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        user = (UserDetails) auth.getPrincipal();
        token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }
}
