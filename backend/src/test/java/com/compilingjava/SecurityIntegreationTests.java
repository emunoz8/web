// src/test/java/com/compilingjava/SecurityIntegrationTests.java
package com.compilingjava;

import com.compilingjava.auth.service.email.EmailVerificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = { App.class, SecurityIntegrationTests.TestBeans.class }, properties = {
        // let our test bean replace the component-scanned one
        "spring.main.allow-bean-definition-overriding=true"
})
@ActiveProfiles("test") // <- ensure H2 / Flyway-off from application-test.yml
@AutoConfigureMockMvc
class SecurityIntegrationTests {

    @Autowired
    MockMvc mvc;

    @TestConfiguration
    static class TestBeans {
        /** Replace the production bean (same name) with a no-op to avoid DB/JWT work. */
        @Bean(name = "emailVerificationService")
        @Primary
        EmailVerificationService emailVerificationService() {
            return new EmailVerificationService(null, null, null, null, null) {
                @Override
                public void resend(String rawEmail) {
                    /* no-op */ }
            };
        }
    }

    @Test
    void resend_is_public_returns_204_for_valid_email() throws Exception {
        mvc.perform(post("/auth/verify/resend")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"you@example.com\"}"))
                .andExpect(status().isNoContent());
    }

    @Test
    void resend_missing_or_bad_body_returns_400() throws Exception {
        mvc.perform(post("/auth/verify/resend")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/auth/verify/resend")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"not-an-email\"}"))
                .andExpect(status().isBadRequest());
    }
}
