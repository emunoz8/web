package com.compilingjava.user.mapper;

import com.compilingjava.user.dto.UserRequestDto;
import com.compilingjava.user.dto.UserResponseDto;
import com.compilingjava.user.model.User;

import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRequestDto dto) {
        if (dto == null)
            return null;

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());

        // IMPORTANT: do NOT set the raw password here.
        // The service will encode and set it.
        user.setRole(User.Role.USER);
        user.setEmailVerified(false);
        return user;
    }

    public UserResponseDto toDto(User user) {
        if (user == null)
            return null;

        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt());
    }
}
