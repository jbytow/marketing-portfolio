package com.portfolio.controller;

import com.portfolio.config.TestSecurityConfig;
import com.portfolio.security.JwtService;
import com.portfolio.service.MediaService;
import com.portfolio.service.StorageService;
import com.portfolio.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = MediaController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class
        }
)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("MediaController")
class MediaControllerTest {

    private static final String IMAGE_NAME = "3f2b6c1e-8a4d-4f7e-9b1a-2c3d4e5f6a7b.jpg";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MediaService mediaService;

    @MockBean
    private StorageService storageService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    @Nested
    @DisplayName("GET /api/media/{subDir}/{filename}")
    class ServeMedia {

        @Test
        @DisplayName("existing file is served with its Content-Type")
        void servesExistingFile() throws Exception {
            given(storageService.loadAsResource("images/" + IMAGE_NAME))
                    .willReturn(new ByteArrayResource(new byte[]{1, 2, 3}));

            mockMvc.perform(get("/api/media/images/" + IMAGE_NAME))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Type", "image/jpeg"))
                    .andExpect(content().bytes(new byte[]{1, 2, 3}));
        }
    }
}
