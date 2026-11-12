package com.portfolio.controller;

import tools.jackson.databind.ObjectMapper;
import com.portfolio.config.TestSecurityConfig;
import com.portfolio.dto.PostCreateRequest;
import com.portfolio.dto.PostDto;
import com.portfolio.dto.PostUpdateRequest;
import com.portfolio.dto.ReorderRequest;
import com.portfolio.entity.Category;
import com.portfolio.security.JwtService;
import com.portfolio.service.PostService;
import com.portfolio.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = AdminPostController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration.class
        }
)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("AdminPostController")
class AdminPostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PostService postService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserService userService;

    private PostDto createSamplePostDto() {
        return PostDto.builder()
                .id(UUID.randomUUID())
                .category(Category.CAMPAIGNS)
                .categoryLabel("Campaigns")
                .title("Sample Post")
                .titleEn("Sample Post")
                .titlePl("Przykładowy Post")
                .slug("sample-post")
                .excerpt("Sample excerpt")
                .published(false)
                .displayOrder(1)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("GET /api/admin/posts")
    class GetAllPosts {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return all posts for authenticated admin")
        void shouldReturnAllPostsForAdmin() throws Exception {
            List<PostDto> posts = List.of(createSamplePostDto());
            given(postService.getAllPosts("en")).willReturn(posts);

            mockMvc.perform(get("/api/admin/posts")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data", hasSize(1)));
        }

        @Test
        @DisplayName("should return 403 for unauthenticated user")
        void shouldReturn403ForUnauthenticated() throws Exception {
            mockMvc.perform(get("/api/admin/posts")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should filter by category when provided")
        void shouldFilterByCategory() throws Exception {
            PostDto post = createSamplePostDto();
            given(postService.getAllPostsByCategory(Category.CAMPAIGNS, "en"))
                    .willReturn(List.of(post));

            mockMvc.perform(get("/api/admin/posts")
                            .param("category", "CAMPAIGNS")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0].category").value("CAMPAIGNS"));
        }
    }

    @Nested
    @DisplayName("GET /api/admin/posts/{id}")
    class GetPostById {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return post by id for authenticated admin")
        void shouldReturnPostById() throws Exception {
            UUID postId = UUID.randomUUID();
            PostDto post = createSamplePostDto();
            given(postService.getPostById(postId, "en")).willReturn(post);

            mockMvc.perform(get("/api/admin/posts/" + postId)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.title").value("Sample Post"));
        }
    }

    @Nested
    @DisplayName("POST /api/admin/posts")
    class CreatePost {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should create post for authenticated admin")
        void shouldCreatePost() throws Exception {
            PostCreateRequest request = new PostCreateRequest();
            request.setCategory(Category.CAMPAIGNS);
            request.setTitleEn("New Post");
            request.setTitlePl("Nowy Post");

            PostDto createdPost = createSamplePostDto();
            given(postService.createPost(any(PostCreateRequest.class), eq("en")))
                    .willReturn(createdPost);

            mockMvc.perform(post("/api/admin/posts")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("should return 403 for unauthenticated user")
        void shouldReturn403ForUnauthenticated() throws Exception {
            PostCreateRequest request = new PostCreateRequest();
            request.setCategory(Category.CAMPAIGNS);
            request.setTitleEn("New Post");
            request.setTitlePl("Nowy Post");

            mockMvc.perform(post("/api/admin/posts")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("DELETE /api/admin/posts/{id}")
    class DeletePost {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should delete post for authenticated admin")
        void shouldDeletePost() throws Exception {
            UUID postId = UUID.randomUUID();

            mockMvc.perform(delete("/api/admin/posts/" + postId)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(postService).deletePost(postId);
        }
    }

    @Nested
    @DisplayName("PATCH /api/admin/posts/{id}/publish")
    class TogglePublish {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should toggle publish status for authenticated admin")
        void shouldTogglePublish() throws Exception {
            UUID postId = UUID.randomUUID();
            PostDto updatedPost = PostDto.builder()
                    .id(postId)
                    .published(true)
                    .build();
            given(postService.togglePublish(postId, "en")).willReturn(updatedPost);

            mockMvc.perform(patch("/api/admin/posts/" + postId + "/publish")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").doesNotExist());
        }
    }

    @Nested
    @DisplayName("PUT /api/admin/posts/{id}")
    class UpdatePost {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should update post for authenticated admin")
        void shouldUpdatePost() throws Exception {
            UUID postId = UUID.randomUUID();
            PostUpdateRequest request = new PostUpdateRequest();
            request.setTitleEn("Updated");
            given(postService.updatePost(eq(postId), any(PostUpdateRequest.class), eq("en")))
                    .willReturn(createSamplePostDto());

            mockMvc.perform(put("/api/admin/posts/" + postId)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for blank titleEn")
        void shouldRejectBlankTitle() throws Exception {
            mockMvc.perform(put("/api/admin/posts/" + UUID.randomUUID())
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"titleEn\":\"   \"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.titleEn").exists());

            verify(postService, never()).updatePost(any(), any(), any());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for over-long title")
        void shouldRejectOverLongTitle() throws Exception {
            mockMvc.perform(put("/api/admin/posts/" + UUID.randomUUID())
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"titlePl\":\"" + "x".repeat(256) + "\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.titlePl").exists());
        }
    }

    @Nested
    @DisplayName("POST /api/admin/posts validation")
    class CreatePostValidation {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for blank titleEn")
        void shouldRejectBlankTitle() throws Exception {
            mockMvc.perform(post("/api/admin/posts")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"category\":\"CAMPAIGNS\",\"titleEn\":\" \",\"titlePl\":\"Nowy\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.titleEn").exists());

            verify(postService, never()).createPost(any(), any());
        }
    }

    @Nested
    @DisplayName("PATCH /api/admin/posts/reorder")
    class ReorderPosts {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for an empty body")
        void shouldRejectEmptyBody() throws Exception {
            mockMvc.perform(patch("/api/admin/posts/reorder")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.items").exists());

            verify(postService, never()).reorderPosts(any());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for an item without displayOrder")
        void shouldRejectItemWithoutDisplayOrder() throws Exception {
            mockMvc.perform(patch("/api/admin/posts/reorder")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"items\":[{\"id\":\"" + UUID.randomUUID() + "\"}]}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors['items[0].displayOrder']").exists());

            verify(postService, never()).reorderPosts(any());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for an item without id")
        void shouldRejectItemWithoutId() throws Exception {
            mockMvc.perform(patch("/api/admin/posts/reorder")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"items\":[{\"displayOrder\":1}]}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors['items[0].id']").exists());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should reorder posts for a valid body")
        void shouldReorderPosts() throws Exception {
            mockMvc.perform(patch("/api/admin/posts/reorder")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"items\":[{\"id\":\"" + UUID.randomUUID() + "\",\"displayOrder\":2}]}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));

            verify(postService).reorderPosts(any(ReorderRequest.class));
        }
    }
}
