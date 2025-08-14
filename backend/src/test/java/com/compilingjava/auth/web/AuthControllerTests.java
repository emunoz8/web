package com.compilingjava.auth.web;

import com.compilingjava.auth.dto.AuthRequest;
import com.compilingjava.auth.dto.AuthResponse;
import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.security.jwt.AuthenticationService;
import com.compilingjava.user.dto.UserRequestDto;
import com.compilingjava.user.dto.UserResponseDto;
import com.compilingjava.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.net.URI;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pure Mockito + standalone MockMvc tests for AuthController.
 * No Spring context, no @MockBean.
 */
@ExtendWith(MockitoExtension.class)
class AuthControllerTests {

        @Mock
        AuthenticationService authenticationService;
        @Mock
        UserService userService;
        @Mock
        EmailVerificationService emailVerificationService;
        @Mock
        EmailSender emailSender;

        AuthController controller;
        MockMvc mvc;

        @BeforeEach
        void setup() {
                controller = new AuthController(authenticationService, userService, emailVerificationService,
                                emailSender);

                // Inject property-backed fields since we don't have Spring @Value here
                ReflectionTestUtils.setField(controller,
                                "emailVerifyBase", "http://test-host/auth/confirm-email");
                ReflectionTestUtils.setField(controller,
                                "webBaseUri", URI.create("https://compilingjava.com"));

                mvc = MockMvcBuilders
                                .standaloneSetup(controller)
                                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                                .build();
        }

        /* ---------- /auth/login ---------- */
        @Test
        void login_returnsToken() throws Exception {
                when(authenticationService.authenticate(any(AuthRequest.class)))
                                .thenReturn(new AuthResponse("ey.access"));

                mvc.perform(post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"username\":\"edwin\",\"password\":\"Passw0rd!\"}"))
                                .andExpect(status().isOk())
                                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.token").value("ey.access"));
        }

        /* ---------- /auth/register ---------- */
        @Test
        void register_createsUser_and_sendsVerificationEmail() throws Exception {
                var created = mock(UserResponseDto.class);
                when(created.getEmail()).thenReturn("edwin@example.com");
                when(created.getUsername()).thenReturn("edwin");
                when(userService.createUser(any(UserRequestDto.class))).thenReturn(created);

                when(emailVerificationService.generateToken("edwin@example.com")).thenReturn("tok123");

                mvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "username":"edwin",
                                                  "email":"edwin@example.com",
                                                  "password":"Passw0rd!"
                                                }
                                                """))
                                .andExpect(status().isCreated());

                ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
                verify(emailSender).send(eq("edwin@example.com"),
                                contains("Verify your email"),
                                body.capture());

                assertThat(body.getValue())
                                .contains("http://test-host/auth/confirm-email?token=")
                                .contains("tok123");
        }

        /* ---------- /auth/confirm-email ---------- */
        @Test
        void confirmEmail_success_redirects_to_web() throws Exception {
                doNothing().when(emailVerificationService).verify("ok");

                mvc.perform(get("/auth/confirm-email").param("token", "ok"))
                                .andExpect(status().is3xxRedirection())
                                .andExpect(header().string("Location",
                                                startsWith("https://compilingjava.com/verified?status=success")));
        }

        @Test
        void confirmEmail_expired_redirects_with_status_expired() throws Exception {
                doThrow(new com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException())
                                .when(emailVerificationService).verify("old");

                mvc.perform(get("/auth/confirm-email").param("token", "old"))
                                .andExpect(status().is3xxRedirection())
                                .andExpect(header().string("Location",
                                                startsWith("https://compilingjava.com/verified?status=expired")));
        }

        @Test
        void confirmEmail_invalid_redirects_with_status_invalid() throws Exception {
                doThrow(new com.compilingjava.auth.service.exceptions.InvalidTokenException())
                                .when(emailVerificationService).verify("bad");

                mvc.perform(get("/auth/confirm-email").param("token", "bad"))
                                .andExpect(status().is3xxRedirection())
                                .andExpect(header().string("Location",
                                                startsWith("https://compilingjava.com/verified?status=invalid")));
        }

}
