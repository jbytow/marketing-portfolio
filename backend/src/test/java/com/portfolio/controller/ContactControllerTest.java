package com.portfolio.controller;

import com.portfolio.config.TestSecurityConfig;
import com.portfolio.security.JwtService;
import com.portfolio.service.ContactService;
import com.portfolio.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ContactController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class
        }
)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("ContactController")
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ContactService contactService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    private static String body(String name, String email, String subject, String message) {
        return """
                {"name": "%s", "email": "%s", "subject": "%s", "message": "%s"}
                """.formatted(name, email, subject, message);
    }

    @Test
    @DisplayName("a valid submission returns 200 and hands the request to ContactService once")
    void validSubmissionIsSent() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Anna", "anna@example.org", "Hello", "Nice portfolio")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(contactService).sendContactEmail(any());
    }

    @Test
    @DisplayName("an invalid e-mail returns 400 with a field error and sends nothing")
    void invalidEmailIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Anna", "not-an-email", "Hello", "Nice portfolio")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.email").exists());

        verify(contactService, never()).sendContactEmail(any());
    }

    @Test
    @DisplayName("a blank message returns 400 with a field error and sends nothing")
    void blankMessageIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Anna", "anna@example.org", "Hello", "   ")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.message").exists());

        verify(contactService, never()).sendContactEmail(any());
    }

    @Test
    @DisplayName("an oversized message returns 400 and sends nothing")
    void oversizedMessageIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Anna", "anna@example.org", "Hello", "x".repeat(5001))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.message").exists());

        verify(contactService, never()).sendContactEmail(any());
    }

    @Test
    @DisplayName("a non-JSON body returns 400 instead of 500")
    void malformedBodyIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("not json"))
                .andExpect(status().isBadRequest());

        verify(contactService, never()).sendContactEmail(any());
    }
}
