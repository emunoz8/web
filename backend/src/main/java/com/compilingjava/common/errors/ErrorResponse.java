package com.compilingjava.common.errors;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
                Instant timestamp,
                int status,
                String error, // e.g., "Gone", "Bad Request"
                String code, // stable app code, e.g., TOKEN_GONE
                String message, // human-readable
                String path, // request URI
                Map<String, String> fieldErrors // for validation, optional
) {
}
