package com.compilingjava.auth.dto;

import java.util.List;

public record AuthSessionResponse(
        String username,
        String email,
        List<String> roles,
        boolean canChangeUsername) {
}
