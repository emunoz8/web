package com.compilingjava.dto;

import com.compilingjava.model.User.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private Instant createdAt;
}
