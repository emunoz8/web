package com.compilingjava.common.errors;

import jakarta.validation.Valid;
import jakarta.validation.Validator;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full-context test so we hit the same exception mapping stack as production.
 * CSRF/auth filters are disabled for simplicity—we’re asserting the error JSON contract.
 */
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
@Import({
        GlobalErrorContractIT.ValidationController.class,
        GlobalErrorContractIT.ValidationBeans.class
})
class GlobalErrorContractIT {

    @Autowired
    MockMvc mockMvc;

    // --- Dummy controller used only to provoke validation errors ---
    @RestController
    @RequestMapping("/__test/validation")
    @Validated // enable @RequestParam/@PathVariable constraints
    static class ValidationController {

        static class Payload {
            @NotBlank
            @Size(min = 8)
            public String newPassword;
        }

        @PostMapping(path = "/body", consumes = MediaType.APPLICATION_JSON_VALUE)
        public void postBody(@Valid @RequestBody Payload payload) {
            // no-op
        }

        @GetMapping("/params")
        public void getParams(@RequestParam @Min(10) int min) {
            // no-op
        }
    }

    // --- Ensure method + bean validation are active in the test context ---
    @TestConfiguration
    static class ValidationBeans {
        @Bean
        Validator validator() {
            return new LocalValidatorFactoryBean();
        }

        @Bean
        MethodValidationPostProcessor methodValidationPostProcessor(Validator v) {
            MethodValidationPostProcessor p = new MethodValidationPostProcessor();
            p.setValidator(v);
            return p;
        }
    }

    // ---------- Tests: validation → 400 with our error shape ----------

    @Test
    void body_validation_returns_400_with_fieldErrors() throws Exception {
        mockMvc.perform(post("/__test/validation/body")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"newPassword\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.newPassword").exists());
    }

    @Test
    void bad_json_returns_400_with_bad_json_code() throws Exception {
        mockMvc.perform(post("/__test/validation/body")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{not-json}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_JSON"));
    }

    @Test
    void param_constraint_violation_returns_400() throws Exception {
        mockMvc.perform(get("/__test/validation/params").param("min", "5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void missing_param_returns_400_with_field_error() throws Exception {
        mockMvc.perform(get("/__test/validation/params"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.min").value("Parameter is required"));
    }

    @Test
    void type_mismatch_returns_400_with_field_error() throws Exception {
        mockMvc.perform(get("/__test/validation/params").param("min", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.min").exists());
    }
}
