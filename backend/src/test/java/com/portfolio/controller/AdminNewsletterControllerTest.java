package com.portfolio.controller;

import com.portfolio.config.TestSecurityConfig;
import com.portfolio.dto.NewsletterCreateRequest;
import com.portfolio.dto.NewsletterDto;
import com.portfolio.dto.NewsletterUpdateRequest;
import com.portfolio.security.JwtService;
import com.portfolio.service.NewsletterService;
import com.portfolio.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AdminNewsletterController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class
        }
)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("AdminNewsletterController")
class AdminNewsletterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NewsletterService newsletterService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("should return 201 when a newsletter is created")
    void shouldReturn201OnCreate() throws Exception {
        given(newsletterService.create(any(NewsletterCreateRequest.class), eq("en")))
                .willReturn(NewsletterDto.builder().id(UUID.randomUUID()).title("Issue 1").build());

        mockMvc.perform(post("/api/admin/newsletters")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titleEn\":\"Issue 1\",\"titlePl\":\"Numer 1\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Issue 1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("should return 400 for a blank title on update")
    void shouldRejectBlankTitleOnUpdate() throws Exception {
        mockMvc.perform(put("/api/admin/newsletters/" + UUID.randomUUID())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titlePl\":\"  \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.titlePl").exists());

        verify(newsletterService, never()).update(any(), any(NewsletterUpdateRequest.class), any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("should return 400 for an over-long slug on update")
    void shouldRejectOverLongSlugOnUpdate() throws Exception {
        mockMvc.perform(put("/api/admin/newsletters/" + UUID.randomUUID())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slug\":\"" + "x".repeat(256) + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.slug").exists());
    }
}
