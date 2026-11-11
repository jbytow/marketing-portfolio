package com.portfolio.controller;

import com.portfolio.config.TestSecurityConfig;
import com.portfolio.entity.Newsletter;
import com.portfolio.repository.NewsletterRepository;
import com.portfolio.security.JwtService;
import com.portfolio.service.NewsletterService;
import com.portfolio.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// The real NewsletterService runs here so the test covers the service exception -> HTTP status mapping.
@WebMvcTest(
        controllers = NewsletterController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class
        }
)
@Import({TestSecurityConfig.class, NewsletterService.class})
@ActiveProfiles("test")
@ExtendWith(OutputCaptureExtension.class)
@DisplayName("NewsletterController")
class NewsletterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NewsletterRepository newsletterRepository;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    @Test
    @DisplayName("GET /api/newsletters/{slug} should return 404 without an error log for an unknown slug")
    void shouldReturn404ForUnknownSlug(CapturedOutput output) throws Exception {
        given(newsletterRepository.findBySlug("unknown")).willReturn(Optional.empty());

        mockMvc.perform(get("/api/newsletters/unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        assertThat(output.getAll()).doesNotContain("Unexpected error");
    }

    @Test
    @DisplayName("GET /api/newsletters/{slug} should answer a draft with the same 404 envelope as an unknown slug")
    void shouldReturn404ForDraft() throws Exception {
        Newsletter draft = Newsletter.builder()
                .id(UUID.randomUUID())
                .slug("draft-recap")
                .titleEn("Draft recap")
                .titlePl("Szkic podsumowania")
                .published(false)
                .build();
        given(newsletterRepository.findBySlug("draft-recap")).willReturn(Optional.of(draft));

        mockMvc.perform(get("/api/newsletters/draft-recap"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Newsletter not found: draft-recap"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/newsletters/{slug} should return the newsletter in the requested language")
    void shouldReturnNewsletterInPolish() throws Exception {
        Newsletter newsletter = Newsletter.builder()
                .id(UUID.randomUUID())
                .slug("spring-recap")
                .titleEn("Spring recap")
                .titlePl("Wiosenne podsumowanie")
                .published(true)
                .build();
        given(newsletterRepository.findBySlug("spring-recap")).willReturn(Optional.of(newsletter));

        mockMvc.perform(get("/api/newsletters/spring-recap").header("Accept-Language", "pl-PL,pl;q=0.9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Wiosenne podsumowanie"));
    }
}
