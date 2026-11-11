package com.portfolio.controller;

import com.portfolio.config.TestSecurityConfig;
import com.portfolio.dto.MediaDto;
import com.portfolio.security.JwtService;
import com.portfolio.service.MediaService;
import com.portfolio.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AdminMediaController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class
        }
)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("AdminMediaController")
class AdminMediaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MediaService mediaService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    private static Page<MediaDto> emptyPage() {
        return new PageImpl<>(List.<MediaDto>of(), PageRequest.of(0, 20), 0);
    }

    private static void assertNewestFirstDefaults(Pageable pageable) {
        assertThat(pageable.getPageSize()).isEqualTo(20);
        assertThat(pageable.getSort().getOrderFor("createdAt"))
                .isNotNull()
                .extracting(Sort.Order::getDirection)
                .isEqualTo(Sort.Direction.DESC);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/media sorts newest first by default")
    void listSortsNewestFirst() throws Exception {
        given(mediaService.getAllMedia(any(Pageable.class), eq("en"))).willReturn(emptyPage());

        mockMvc.perform(get("/api/admin/media").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(mediaService).getAllMedia(captor.capture(), eq("en"));
        assertNewestFirstDefaults(captor.getValue());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/media?type= sorts newest first by default")
    void listByTypeSortsNewestFirst() throws Exception {
        given(mediaService.getMediaByType(any(), any(Pageable.class), eq("en"))).willReturn(emptyPage());

        mockMvc.perform(get("/api/admin/media").param("type", "IMAGE").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(mediaService).getMediaByType(any(), captor.capture(), eq("en"));
        assertNewestFirstDefaults(captor.getValue());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/media/unassigned sorts newest first by default")
    void unassignedSortsNewestFirst() throws Exception {
        given(mediaService.getUnassignedMedia(any(Pageable.class), eq("en"))).willReturn(emptyPage());

        mockMvc.perform(get("/api/admin/media/unassigned").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(mediaService).getUnassignedMedia(captor.capture(), eq("en"));
        assertNewestFirstDefaults(captor.getValue());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PATCH /api/admin/media/reorder returns 400 when an item has no id")
    void reorderRejectsInvalidBody() throws Exception {
        mockMvc.perform(patch("/api/admin/media/reorder")
                        .param("postId", UUID.randomUUID().toString())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":[{\"displayOrder\":1}]}"))
                .andExpect(status().isBadRequest());

        verify(mediaService, never()).reorderMedia(any(), any());
    }
}
