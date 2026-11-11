package com.portfolio.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
    Path tempDir;

    private Path root;

    private StorageService storageService;

    @BeforeEach
    void setUp() {
        root = tempDir.resolve("uploads");
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

    @Nested
    @DisplayName("loadAsResource")
    class LoadAsResource {

        @Test
        @DisplayName("stored file is returned")
        void loadsStoredFile() throws Exception {
            String stored = storageService.store(upload("photo.jpg", "image/jpeg"));

            assertThat(storageService.loadAsResource(stored).getContentAsByteArray()).containsExactly(1, 2, 3);
        }

        @Test
        @DisplayName("missing file -> EntityNotFoundException")
        void missingFileIsNotFound() {
            assertThatThrownBy(() -> storageService.loadAsResource("images/missing.jpg"))
                    .isInstanceOf(EntityNotFoundException.class);
        }

        @Test
        @DisplayName("a directory is not served")
        void directoryIsNotFound() throws Exception {
            Files.createDirectories(root.resolve("images"));

            assertThatThrownBy(() -> storageService.loadAsResource("images"))
                    .isInstanceOf(EntityNotFoundException.class);
        }

        @ParameterizedTest
        @ValueSource(strings = {"../outside.txt", "images/../../outside.txt", "../uploads-sibling/outside.txt"})
        @DisplayName("names escaping the upload root -> EntityNotFoundException even when the target exists")
        void pathOutsideRootIsNotFound(String name) throws Exception {
            Path outsideFile = root.resolve(name).normalize();
            Files.createDirectories(outsideFile.getParent());
            Files.write(outsideFile, new byte[]{9});

            assertThatThrownBy(() -> storageService.loadAsResource(name))
                    .isInstanceOf(EntityNotFoundException.class);
        }

        @Test
        @DisplayName("absolute path -> EntityNotFoundException")
        void absolutePathIsNotFound() throws Exception {
            Path outsideFile = Files.write(tempDir.resolve("outside.txt"), new byte[]{9});

            assertThatThrownBy(() -> storageService.loadAsResource(outsideFile.toAbsolutePath().toString()))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        @DisplayName("stored file is removed")
        void deletesStoredFile() throws Exception {
            String stored = storageService.store(upload("photo.jpg", "image/jpeg"));

            storageService.delete(stored);

            assertThat(root.resolve(stored)).doesNotExist();
        }

        @ParameterizedTest
        @ValueSource(strings = {"../outside.txt", "images/../../outside.txt"})
        @DisplayName("names escaping the upload root are rejected and the target survives")
        void pathOutsideRootIsRejected(String name) throws Exception {
            Path outsideFile = root.resolve(name).normalize();
            Files.write(outsideFile, new byte[]{9});

            assertThatThrownBy(() -> storageService.delete(name))
                    .isInstanceOf(EntityNotFoundException.class);
            assertThat(outsideFile).exists();
        }
    }
}
