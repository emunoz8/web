package com.compilingjava;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.compilingjava.auth.web.AuthController;
import com.compilingjava.auth.web.PasswordResetController;
import com.compilingjava.comment.web.CommentController;
import com.compilingjava.content.web.AdminContentController;
import com.compilingjava.content.web.ContentController;
import com.compilingjava.like.web.LikeController;
import com.compilingjava.user.web.UserController;
import com.compilingjava.user.repository.UserRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import com.compilingjava.security.jwt.AuthenticationService;
import com.compilingjava.content.service.BlogPostService;
import com.compilingjava.comment.service.CommentService;
import com.compilingjava.content.service.ContentService;
import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.like.service.LikeService;
import com.compilingjava.auth.service.PasswordResetService;
import com.compilingjava.content.service.ProjectService;
import com.compilingjava.common.ratelimit.RateLimiterService;
import com.compilingjava.user.mapper.UserMapper;
import com.compilingjava.user.service.UserService;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(controllers = { AuthController.class, PasswordResetController.class, CommentController.class,
        AdminContentController.class, ContentController.class, LikeController.class, UserController.class })
class ApiWebMvcSmokeTests {

    private static ResultMatcher not5xx() {
        return result -> {
            int s = result.getResponse().getStatus();
            assertTrue(s < 500, "Expected not 5xx, got " + s + " for " + result.getRequest().getRequestURI());
        };
    }

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    AuthenticationService authenticationService;
    @MockitoBean
    BlogPostService blogPostService;
    @MockitoBean
    CommentService commentService;
    @MockitoBean
    ContentService contentService;
    @MockitoBean
    EmailSender emailSender;
    @MockitoBean
    EmailVerificationService emailVerificationService;
    @MockitoBean
    LikeService likeService;
    @MockitoBean
    PasswordResetService passwordResetService;
    @MockitoBean
    ProjectService projectService;
    @MockitoBean
    RateLimiterService rateLimiterService;
    @MockitoBean
    UserMapper userMapper;
    @MockitoBean
    UserRepository userRepository;
    @MockitoBean
    UserService userService;

    @Test
    void GET_api_auth() throws Exception {
        mockMvc.perform(get("/api/auth"))
                .andExpect(not5xx());
    }

    @Test
    void POST_api_auth_login() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"example\":\"value\"}"))
                .andExpect(not5xx());
    }

    @Test
    void POST_api_auth_register() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"example\":\"value\"}"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_auth_confirm_email() throws Exception {
        mockMvc.perform(get("/api/auth/confirm-email"))
                .andExpect(not5xx());
    }

    @Test
    void POST_api_auth_verify_resend() throws Exception {
        mockMvc.perform(post("/api/auth/verify/resend")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"example\":\"value\"}"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_auth_password() throws Exception {
        mockMvc.perform(get("/api/auth/password"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_auth_password_validate() throws Exception {
        mockMvc.perform(get("/api/auth/password/validate"))
                .andExpect(not5xx());
    }

    @Test
    void POST_api_auth_password_reset() throws Exception {
        mockMvc.perform(post("/api/auth/password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"00000000-0000-0000-0000-000000000000\",\"newPassword\":\"Secret123!\"}"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_comments() throws Exception {
        mockMvc.perform(get("/api/comments"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_comments_tree() throws Exception {
        mockMvc.perform(get("/api/comments/tree"))
                .andExpect(not5xx());
    }

    @Test
    void DELETE_api_comments_1() throws Exception {
        mockMvc.perform(delete("/api/comments/1"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_admin() throws Exception {
        mockMvc.perform(get("/api/admin"))
                .andExpect(not5xx());
    }

    @Test
    void POST_api_admin_blogs() throws Exception {
        mockMvc.perform(post("/api/admin/blogs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"example\":\"value\"}"))
                .andExpect(not5xx());
    }

    @Test
    void DELETE_api_admin_contents_1() throws Exception {
        mockMvc.perform(delete("/api/admin/contents/1"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_contents() throws Exception {
        mockMvc.perform(get("/api/contents"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_contents_slug_my_post() throws Exception {
        mockMvc.perform(get("/api/contents/slug/my-post"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_contents_id_1() throws Exception {
        mockMvc.perform(get("/api/contents/id/1"))
                .andExpect(not5xx());
    }

    @Test
    void GET_api_contents_1_likes() throws Exception {
        mockMvc.perform(get("/api/contents/1/likes"))
                .andExpect(not5xx());
    }
}