package com.compilingjava.auth.web;

import com.compilingjava.auth.service.email.EmailSender;
import com.compilingjava.auth.service.email.EmailVerificationService;
import com.compilingjava.auth.service.exceptions.ExpiredOrUsedTokenException;
import com.compilingjava.auth.service.exceptions.InvalidTokenException;
import com.compilingjava.security.jwt.AuthenticationService;
import com.compilingjava.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.util.pattern.PathPatternParser;

import java.net.URI;
import java.nio.charset.StandardCharsets;

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerSecurityTests {

        private static final String BASE = "/auth";
        private static final String CONFIRM = BASE + "/confirm-email";
        private static final String VERIFY = BASE + "/verify";
        private static final String LOGIN = BASE + "/login";

        private MockMvc mvc;

        // Pure Mockito mocks (no Spring)
        private AuthenticationService authenticationService;
        private UserService userService;
        private EmailVerificationService emailVerificationService;
        private EmailSender emailSender;

        @BeforeEach
        void setUp() {
                // 1) Mocks
                authenticationService = Mockito.mock(AuthenticationService.class);
                userService = Mockito.mock(UserService.class);
                emailVerificationService = Mockito.mock(EmailVerificationService.class);
                emailSender = Mockito.mock(EmailSender.class);

                // 2) Real controller wired with mocks
                AuthController controller = new AuthController(authenticationService, userService,
                                emailVerificationService,
                                emailSender);

                // 3) Inject @Value fields
                ReflectionTestUtils.setField(controller, "webBaseUri", URI.create("https://compilingjava.com"));
                ReflectionTestUtils.setField(controller, "emailVerifyBase", "http://localhost:8080/auth/confirm-email");

                // 4) Standalone MockMvc with Spring 6 matching + converters
                ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
                MappingJackson2HttpMessageConverter json = new MappingJackson2HttpMessageConverter(mapper);
                StringHttpMessageConverter text = new StringHttpMessageConverter(StandardCharsets.UTF_8);

                mvc = MockMvcBuilders
                                .standaloneSetup(controller)
                                .setPatternParser(new PathPatternParser())
                                .setMessageConverters(json, text)
                                .alwaysDo(print()) // helpful: dumps to surefire-output
                                // Avoid any servlet/context path confusion in tests
                                .defaultRequest(get("/").contextPath("").servletPath(""))
                                .build();
        }

        // ---------- confirm-email ----------

        @Test
        @DisplayName("GET /auth/confirm-email is public and redirects")
        void confirmEmail_isPublic_redirects() throws Exception {
                doNothing().when(emailVerificationService).verify("ok");

                mvc.perform(get(CONFIRM).param("token", "ok"))
                                .andExpect(status().is3xxRedirection())
                                .andExpect(header().string("Location",
                                                startsWith("https://compilingjava.com/verified?status=")));
        }

        @Test
        @DisplayName("confirm-email: success → .../verified?status=success")
        void confirmEmail_success_redirects_success() throws Exception {
                doNothing().when(emailVerificationService).verify("good");

                mvc.perform(get(CONFIRM).param("token", "good"))
                                .andExpect(status().is3xxRedirection())
                                .andExpect(header().string("Location", endsWith("/verified?status=success")));
        }

        @Test
        @DisplayName("confirm-email: invalid → .../verified?status=invalid")
        void confirmEmail_invalid_redirects_invalid() throws Exception {
                doThrow(new InvalidTokenException()).when(emailVerificationService).verify("bad");

                mvc.perform(get(CONFIRM).param("token", "bad"))
                                .andExpect(status().is3xxRedirection())
                                .andExpect(header().string("Location", endsWith("/verified?status=invalid")));
        }

        @Test
        @DisplayName("confirm-email: expired/used → .../verified?status=expired")
        void confirmEmail_expired_redirects_expired() throws Exception {
                doThrow(new ExpiredOrUsedTokenException()).when(emailVerificationService).verify("old");

                mvc.perform(get(CONFIRM).param("token", "old"))
                                .andExpect(status().is3xxRedirection())
                                .andExpect(header().string("Location", endsWith("/verified?status=expired")));
        }

        @Test
        @DisplayName("confirm-email: unexpected error → .../verified?status=invalid")
        void confirmEmail_unexpected_redirects_invalid() throws Exception {
                doThrow(new RuntimeException("boom")).when(emailVerificationService).verify("oops");

                mvc.perform(get(CONFIRM).param("token", "oops"))
                                .andExpect(status().is3xxRedirection())
                                .andExpect(header().string("Location", endsWith("/verified?status=invalid")));
        }

        // ---------- verify alias ----------

        @Test
        @DisplayName("GET /auth/verify delegates to confirm-email")
        void verifyAlias_redirects_like_confirmEmail() throws Exception {
                doThrow(new InvalidTokenException()).when(emailVerificationService).verify("alias");

                mvc.perform(get(VERIFY).param("token", "alias"))
                                .andExpect(status().is3xxRedirection())
                                .andExpect(header().string("Location", endsWith("/verified?status=invalid")));
        }

        // ---------- login hint ----------
        @Test
        @DisplayName("GET /auth/login returns hint text")
        void loginPage_returnsHint() throws Exception {
                mvc.perform(get(LOGIN).accept("text/plain"))
                                .andExpect(status().isOk())
                                .andExpect(header().string("Content-Type", startsWith("text/plain")))
                                .andExpect(
                                                result -> org.assertj.core.api.Assertions
                                                                .assertThat(result.getResponse().getContentAsString())
                                                                .contains("POST username/password to /api/auth/login"));
        }
}
