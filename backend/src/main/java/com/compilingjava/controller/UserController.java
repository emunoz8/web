package com.compilingjava.controller;

import com.compilingjava.dto.UserRequestDto;
import com.compilingjava.dto.UserResponseDto;
import com.compilingjava.mapper.UserMapper;
import com.compilingjava.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

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

}
