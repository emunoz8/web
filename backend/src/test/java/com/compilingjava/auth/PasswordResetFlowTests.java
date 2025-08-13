package com.compilingjava.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.context.ActiveProfiles;

import com.compilingjava.auth.service.PasswordResetService;
import com.compilingjava.common.ratelimit.RateLimiterService;
import com.compilingjava.auth.dto.TokenInspection;
import com.compilingjava.auth.dto.TokenReason;

// imports at top of test:
import com.compilingjava.security.jwt.JwtService; // <-- from your stack trace package

@SpringBootTest(properties = {
                "spring.flyway.enabled=false",
                "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
                "spring.datasource.driver-class-name=org.h2.Driver",
                "spring.datasource.username=sa",
                "spring.datasource.password=",
                "spring.jpa.hibernate.ddl-auto=none",
                "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect"
})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")

class PasswordResetFlowTests {

        @Autowired
        MockMvc mockMvc;

        @MockitoBean
        PasswordResetService passwordResetService;
        @MockitoBean
        RateLimiterService rateLimiterService;
        @MockitoBean
        JwtService jwtService;

        @Test
        void request_reset_link_success_returns_204() throws Exception {
                when(rateLimiterService.tryConsume(any())).thenReturn(true);
                doNothing().when(passwordResetService).issueToken(eq("user@example.com"));

                mockMvc.perform(post("/api/auth/password/reset-link")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"user@example.com\"}"))
                                .andExpect(status().isNoContent());
        }

        @Test
        void request_reset_link_rate_limited_returns_429() throws Exception {
                when(rateLimiterService.tryConsume(any())).thenReturn(false);
                when(rateLimiterService.secondsUntilNextToken(any())).thenReturn(60L);

                mockMvc.perform(post("/api/auth/password/reset-link")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"user@example.com\"}"))
                                .andExpect(status().isTooManyRequests());
        }

        @Test
        void validate_valid_token_returns_200_with_payload() throws Exception {
                TokenInspection ok = new TokenInspection(true, TokenReason.OK, "u***@example.com",
                                Instant.now().plusSeconds(600));
                when(passwordResetService.inspect(eq("good-token"))).thenReturn(ok);

                mockMvc.perform(get("/api/auth/password/validate").param("token", "good-token")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.valid").value(true))
                                .andExpect(jsonPath("$.reason").value("OK"));
        }

        @Test
        void validate_expired_token_returns_410() throws Exception {
                TokenInspection expired = new TokenInspection(false, TokenReason.EXPIRED, null,
                                Instant.now().minusSeconds(60));
                when(passwordResetService.inspect(eq("expired"))).thenReturn(expired);

                mockMvc.perform(get("/api/auth/password/validate").param("token", "expired")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isGone());
        }

        @Test
        void reset_password_success_returns_204() throws Exception {
                doNothing().when(passwordResetService).resetPassword(eq("good-token"), eq("Secret123!"));

                mockMvc.perform(post("/api/auth/password/reset")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content("{\"token\":\"good-token\",\"newPassword\":\"Secret123!\"}"))
                                .andExpect(status().isNoContent());
        }

        @Test
        void request_reset_link_429_sets_retry_after_header() throws Exception {
                when(rateLimiterService.tryConsume(any())).thenReturn(false);
                when(rateLimiterService.secondsUntilNextToken(any())).thenReturn(60L); // both email and IP

                mockMvc.perform(post("/api/auth/password/reset-link")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"user@example.com\"}"))
                                .andExpect(status().isTooManyRequests())
                                .andExpect(header().string("Retry-After", "60"));
        }

        @Test
        void validate_invalid_token_returns_410() throws Exception {
                TokenInspection invalid = new TokenInspection(false, TokenReason.INVALID, null,
                                Instant.now().plusSeconds(600));
                when(passwordResetService.inspect(eq("invalid"))).thenReturn(invalid);

                mockMvc.perform(get("/api/auth/password/validate").param("token", "invalid")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isGone())
                                .andExpect(jsonPath("$.reason").value("INVALID"));
        }

        @Test
        void validate_used_token_returns_410() throws Exception {
                TokenInspection used = new TokenInspection(false, TokenReason.USED, null,
                                Instant.now().plusSeconds(600));
                when(passwordResetService.inspect(eq("used"))).thenReturn(used);

                mockMvc.perform(get("/api/auth/password/validate").param("token", "used")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isGone())
                                .andExpect(jsonPath("$.reason").value("USED"));
        }

        @Test
        void validate_wrong_type_token_returns_410() throws Exception {
                TokenInspection wrong = new TokenInspection(false, TokenReason.WRONG_TYPE, null,
                                Instant.now().plusSeconds(600));
                when(passwordResetService.inspect(eq("wrong-type"))).thenReturn(wrong);

                mockMvc.perform(get("/api/auth/password/validate").param("token", "wrong-type")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isGone())
                                .andExpect(jsonPath("$.reason").value("WRONG_TYPE"));
        }

        @Test
        void reset_password_weak_password_returns_400_and_field_error() throws Exception {
                // No service invocation; validation triggers before service call
                mockMvc.perform(post("/api/auth/password/reset")
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .content("{\"token\":\"good-token\",\"newPassword\":\"short\"}"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                                .andExpect(jsonPath("$.fieldErrors.newPassword").exists());
        }

}
