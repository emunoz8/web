package com.compilingjava.security.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import com.compilingjava.auth.web.AuthController;
import com.compilingjava.auth.web.PasswordResetController;
import com.compilingjava.content.web.AdminContentController;
import com.compilingjava.content.web.ContentController;
import com.compilingjava.comment.web.CommentController;
import com.compilingjava.like.web.LikeController;
import com.compilingjava.user.web.UserController;

// Mock dependencies (services) so controllers can be instantiated

import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.security.jwt.AuthenticationService;

import com.compilingjava.auth.service.PasswordResetService;
import com.compilingjava.content.service.ContentService;
import com.compilingjava.comment.service.CommentService;

import com.compilingjava.like.service.LikeService;

import com.compilingjava.content.service.ProjectService;
import com.compilingjava.content.service.BlogPostService;
import com.compilingjava.common.ratelimit.RateLimiterService;
import com.compilingjava.auth.service.email.EmailSender;

import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.context.support.WithAnonymousUser;

@WebMvcTest(controllers = {
        AuthController.class,
        PasswordResetController.class,
        ContentController.class,
        AdminContentController.class,
        CommentController.class,
        LikeController.class,
        UserController.class
})
@Import(ApiSecurityTests.TestSecurityConfig.class)
class ApiSecurityTests {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    AuthenticationService authenticationService;
    @MockitoBean
    EmailVerificationService emailVerificationService;
    @MockitoBean
    PasswordResetService passwordResetService;
    @MockitoBean
    ContentService contentService;
    @MockitoBean
    CommentService commentService;
    @MockitoBean
    LikeService likeService;
    @MockitoBean
    ProjectService projectService;
    @MockitoBean
    BlogPostService blogPostService;
    @MockitoBean
    RateLimiterService rateLimiterService;
    @MockitoBean
    EmailSender emailSender;

    // Minimal Security filter chain for tests to avoid pulling full app SecurityConfig
    @Configuration
    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable());
            http.authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/contents/**", "/api/comments/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/contents/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/contents/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/contents/**").hasRole("ADMIN")
                    .anyRequest().authenticated());
            http.httpBasic(Customizer.withDefaults());
            return http.build();
        }
    }

    private static ResultMatcher unauthorized() {
        return result -> {
            int s = result.getResponse().getStatus();
            assertTrue(s == 401, "Expected 401 Unauthorized, got " + s);
        };
    }

    private static ResultMatcher forbidden() {
        return result -> {
            int s = result.getResponse().getStatus();
            assertTrue(s == 403, "Expected 403 Forbidden, got " + s);
        };
    }

    private static ResultMatcher not401or403or5xx() {
        return result -> {
            int s = result.getResponse().getStatus();
            assertTrue(s != 401 && s != 403 && s < 500, "Expected not 401/403/5xx, got " + s);
        };
    }

    // ---------- Public endpoints: not blocked ----------

    @Test
    @WithAnonymousUser
    void public_get_contents_list_is_not_blocked() throws Exception {
        mockMvc.perform(get("/api/contents"))
                .andExpect(not401or403or5xx());
    }

    @Test
    @WithAnonymousUser
    void public_get_contents_by_slug_is_not_blocked() throws Exception {
        mockMvc.perform(get("/api/contents/slug/{slug}", "my-post"))
                .andExpect(not401or403or5xx());
    }

    @Test
    @WithAnonymousUser
    void public_get_comments_for_content_is_not_blocked() throws Exception {
        mockMvc.perform(get("/api/comments/content/{contentId}", 1))
                .andExpect(not401or403or5xx());
    }

    @Test
    @WithAnonymousUser
    void public_password_reset_link_is_not_blocked() throws Exception {
        mockMvc.perform(post("/api/auth/password/reset-link")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"user@example.com\"}"))
                .andExpect(not401or403or5xx());
    }

    @Test
    @WithAnonymousUser
    void public_password_validate_is_not_blocked() throws Exception {
        mockMvc.perform(get("/api/auth/password/validate").param("token", "00000000-0000-0000-0000-000000000000"))
                .andExpect(not401or403or5xx());
    }

    // ---------- Protected endpoints: role required ----------

    @Test
    @WithAnonymousUser
    void unauthenticated_post_contents_is_401() throws Exception {
        mockMvc.perform(post("/api/contents")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"t\",\"slug\":\"s\",\"contentType\":\"BLOG\"}"))
                .andExpect(unauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void user_post_contents_is_403() throws Exception {
        mockMvc.perform(post("/api/contents")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"t\",\"slug\":\"s\",\"contentType\":\"BLOG\"}"))
                .andExpect(forbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_post_contents_is_not_blocked_by_security() throws Exception {
        mockMvc.perform(post("/api/contents")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"t\",\"slug\":\"s\",\"contentType\":\"BLOG\"}"))
                .andExpect(not401or403or5xx());
    }

    @Test
    @WithAnonymousUser
    void unauthenticated_delete_contents_is_401() throws Exception {
        mockMvc.perform(delete("/api/contents/{id}", 1))
                .andExpect(unauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void user_delete_contents_is_403() throws Exception {
        mockMvc.perform(delete("/api/contents/{id}", 1))
                .andExpect(forbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_delete_contents_is_not_blocked_by_security() throws Exception {
        mockMvc.perform(delete("/api/contents/{id}", 1))
                .andExpect(not401or403or5xx());
    }
}