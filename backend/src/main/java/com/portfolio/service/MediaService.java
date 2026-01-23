package com.portfolio.service;

import com.portfolio.dto.MediaDto;
import com.portfolio.entity.Media;
import com.portfolio.entity.MediaType;
import com.portfolio.entity.Post;
import com.portfolio.repository.MediaRepository;
import com.portfolio.repository.PostRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MediaService {

    private final MediaRepository mediaRepository;
    private final PostRepository postRepository;
    private final StorageService storageService;

    public MediaDto getMediaById(UUID id, String locale) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found: " + id));
        return mapToDto(media, locale);
    }

    public Resource getMediaResource(UUID id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found: " + id));
        return storageService.loadAsResource(media.getFilename());
    }

    public List<MediaDto> getMediaByPost(UUID postId, String locale) {
        return mediaRepository.findByPostIdOrderByCreatedAtDesc(postId).stream()
                .map(media -> mapToDto(media, locale))
                .toList();
    }

    public Page<MediaDto> getAllMedia(Pageable pageable, String locale) {
        return mediaRepository.findAll(pageable)
                .map(media -> mapToDto(media, locale));
    }

    public Page<MediaDto> getUnassignedMedia(Pageable pageable, String locale) {
        return mediaRepository.findByPostIdIsNull(pageable)
                .map(media -> mapToDto(media, locale));
    }

    public Page<MediaDto> getMediaByType(MediaType type, Pageable pageable, String locale) {
        return mediaRepository.findByType(type, pageable)
                .map(media -> mapToDto(media, locale));
    }

    @Transactional
    public MediaDto uploadMedia(MultipartFile file, UUID postId, String altTextEn, String altTextPl, String locale) throws IOException {
        String filename = storageService.store(file);
        MediaType type = storageService.getMediaType(file.getContentType());

        Post post = null;
        if (postId != null) {
            post = postRepository.findById(postId)
                    .orElseThrow(() -> new EntityNotFoundException("Post not found: " + postId));
        }

        Media media = Media.builder()
                .post(post)
                .type(type)
                .filename(filename)
                .originalName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .size(file.getSize())
                .url("/api/media/" + filename)
                .altTextEn(altTextEn)
                .altTextPl(altTextPl)
                .build();

        media = mediaRepository.save(media);
        return mapToDto(media, locale);
    }

    @Transactional
    public MediaDto updateMedia(UUID id, String altTextEn, String altTextPl, UUID postId, String locale) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found: " + id));

        if (altTextEn != null) {
            media.setAltTextEn(altTextEn);
        }
        if (altTextPl != null) {
            media.setAltTextPl(altTextPl);
        }
        if (postId != null) {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new EntityNotFoundException("Post not found: " + postId));
            media.setPost(post);
        }

        media = mediaRepository.save(media);
        return mapToDto(media, locale);
    }

    @Transactional
    public void deleteMedia(UUID id) throws IOException {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found: " + id));

        storageService.delete(media.getFilename());
        mediaRepository.delete(media);
    }

    private MediaDto mapToDto(Media media, String locale) {
        return MediaDto.builder()
                .id(media.getId())
                .postId(media.getPost() != null ? media.getPost().getId() : null)
                .type(media.getType())
                .filename(media.getFilename())
                .originalName(media.getOriginalName())
                .mimeType(media.getMimeType())
                .size(media.getSize())
                .url(media.getUrl())
                .altText(media.getAltText(locale))
                .altTextEn(media.getAltTextEn())
                .altTextPl(media.getAltTextPl())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
