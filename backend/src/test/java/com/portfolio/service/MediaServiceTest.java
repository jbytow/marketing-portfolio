package com.portfolio.service;

import com.portfolio.entity.Media;
import com.portfolio.entity.MediaType;
import com.portfolio.repository.MediaRepository;
import com.portfolio.repository.PostRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("MediaService")
class MediaServiceTest {

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private MediaService mediaService;

    private static Media youTubeMedia(UUID id) {
        return Media.builder()
                .id(id)
                .type(MediaType.YOUTUBE)
                .url("https://www.youtube.com/embed/dQw4w9WgXcQ")
                .videoUrl("https://youtu.be/dQw4w9WgXcQ")
                .build();
    }

    private static Media imageMedia(UUID id) {
        return Media.builder()
                .id(id)
                .type(MediaType.IMAGE)
                .filename("images/" + id + ".jpg")
                .originalName("photo.jpg")
                .mimeType("image/jpeg")
                .size(10L)
                .url("/api/media/images/" + id + ".jpg")
                .build();
    }

    @Nested
    @DisplayName("deleteMedia")
    class DeleteMedia {

        @Test
        @DisplayName("YOUTUBE media: deletes the row and never touches storage")
        void deletesYouTubeRowWithoutStorage() throws Exception {
            UUID id = UUID.randomUUID();
            Media media = youTubeMedia(id);
            given(mediaRepository.findById(id)).willReturn(Optional.of(media));

            mediaService.deleteMedia(id);

            verify(mediaRepository).delete(media);
            verify(storageService, never()).delete(any());
        }

        @Test
        @DisplayName("IMAGE media: deletes the row and the stored file")
        void deletesImageRowAndFile() throws Exception {
            UUID id = UUID.randomUUID();
            Media media = imageMedia(id);
            given(mediaRepository.findById(id)).willReturn(Optional.of(media));

            mediaService.deleteMedia(id);

            verify(mediaRepository).delete(media);
            verify(storageService).delete(media.getFilename());
        }
    }
}
