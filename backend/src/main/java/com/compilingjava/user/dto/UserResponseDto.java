package com.compilingjava.user.dto;

import java.time.Instant;

import com.compilingjava.user.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private User.Role role;
    private Instant createdAt;
}
