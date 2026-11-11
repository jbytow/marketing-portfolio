package com.portfolio.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("StorageService")
class StorageServiceTest {

    private static final String ALLOWED_TYPES =
            "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf";
    private static final String UUID_REGEX = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

    @TempDir
    Path root;

    private StorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = newStorageService(ALLOWED_TYPES);
    }

    private StorageService newStorageService(String allowedTypes) {
        StorageService service = new StorageService();
        ReflectionTestUtils.setField(service, "uploadPath", root.toString());
        ReflectionTestUtils.setField(service, "allowedTypes", allowedTypes);
        service.init();
        return service;
    }

    private static MockMultipartFile upload(String originalName, String contentType) {
        return new MockMultipartFile("file", originalName, contentType, new byte[]{1, 2, 3});
    }

    @Nested
    @DisplayName("store")
    class Store {

        @Test
        @DisplayName("accepted type is stored under a UUID name in its subdirectory")
        void storesUnderUuidInSubdirectory() throws Exception {
            String stored = storageService.store(upload("photo.jpg", "image/jpeg"));

            assertThat(stored).matches("images/" + UUID_REGEX + "\\.jpg");
            assertThat(Files.readAllBytes(root.resolve(stored))).containsExactly(1, 2, 3);
        }

        @Test
        @DisplayName("video and pdf land in videos/ and documents/")
        void storesVideoAndPdfInTheirSubdirectories() throws Exception {
            assertThat(storageService.store(upload("clip.mp4", "video/mp4"))).startsWith("videos/");
            assertThat(storageService.store(upload("offer.pdf", "application/pdf"))).startsWith("documents/");
        }

        @Test
        @DisplayName("disallowed content type is rejected")
        void rejectsDisallowedType() {
            assertThatThrownBy(() -> storageService.store(upload("x.html", "text/html")))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("missing content type is rejected")
        void rejectsNullType() {
            assertThatThrownBy(() -> storageService.store(upload("x.jpg", null)))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }
}
