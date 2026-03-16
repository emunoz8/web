package com.compilingjava.user.web;

import com.compilingjava.auth.service.AuthCookieService;
import com.compilingjava.config.JwtProperties;
import com.compilingjava.security.jwt.JwtService;
import com.compilingjava.user.dto.UsernameUpdateRequest;
import com.compilingjava.user.dto.UserRequestDto;
import com.compilingjava.user.dto.UserResponseDto;
import com.compilingjava.user.mapper.UserMapper;
import com.compilingjava.user.model.User;
import com.compilingjava.user.service.UserService;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final JwtService jwtService;
    private final AuthCookieService authCookieService;
    private final JwtProperties jwtProperties;

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRequestDto request) {
        UserResponseDto createdUser = userService.createUser(request);
        return ResponseEntity.ok(createdUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(userMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/me/username")
    public ResponseEntity<Void> updateMyUsername(Authentication auth,
            HttpServletResponse response,
            @Valid @RequestBody UsernameUpdateRequest request) {
        User updated = userService.updateUsername(auth.getName(), request.getUsername());

        List<String> roles = (updated.getRole() != null)
                ? List.of("ROLE_" + updated.getRole().name())
                : List.of("ROLE_USER");

        String newToken = jwtService.generateAccessToken(
                updated.getUsername(),
                updated.getEmail(),
                roles,
                !updated.isUsernameChanged());

        authCookieService.writeAccessToken(response, newToken, Duration.ofMillis(jwtProperties.getExpiration()));
        return ResponseEntity.noContent().build();
    }

}
