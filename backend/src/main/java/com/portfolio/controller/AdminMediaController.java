package com.portfolio.controller;

import com.portfolio.dto.ApiResponse;
import com.portfolio.dto.MediaDto;
import com.portfolio.entity.MediaType;
import com.portfolio.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private final MediaService mediaService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MediaDto>>> getAllMedia(
            @RequestParam(required = false) MediaType type,
            @PageableDefault(size = 20) Pageable pageable,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        Page<MediaDto> media;
        if (type != null) {
            media = mediaService.getMediaByType(type, pageable, extractLocale(locale));
        } else {
            media = mediaService.getAllMedia(pageable, extractLocale(locale));
        }

        return ResponseEntity.ok(ApiResponse.success(media));
    }

    @GetMapping("/unassigned")
    public ResponseEntity<ApiResponse<Page<MediaDto>>> getUnassignedMedia(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        Page<MediaDto> media = mediaService.getUnassignedMedia(pageable, extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MediaDto>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "postId", required = false) UUID postId,
            @RequestParam(value = "altTextEn", required = false) String altTextEn,
            @RequestParam(value = "altTextPl", required = false) String altTextPl,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) throws IOException {

        MediaDto media = mediaService.uploadMedia(file, postId, altTextEn, altTextPl, extractLocale(locale));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(media, "Media uploaded successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaDto>> updateMedia(
            @PathVariable UUID id,
            @RequestParam(value = "altTextEn", required = false) String altTextEn,
            @RequestParam(value = "altTextPl", required = false) String altTextPl,
            @RequestParam(value = "postId", required = false) UUID postId,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        MediaDto media = mediaService.updateMedia(id, altTextEn, altTextPl, postId, extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(media, "Media updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable UUID id) throws IOException {
        mediaService.deleteMedia(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Media deleted successfully"));
    }

    private String extractLocale(String acceptLanguage) {
        if (acceptLanguage == null || acceptLanguage.isBlank()) {
            return "en";
        }
        String primary = acceptLanguage.split(",")[0].split(";")[0].trim();
        return primary.startsWith("pl") ? "pl" : "en";
    }
}
