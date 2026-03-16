package com.compilingjava.auth.dto;

public record CsrfTokenResponse(
        String headerName,
        String parameterName,
        String token) {
}
