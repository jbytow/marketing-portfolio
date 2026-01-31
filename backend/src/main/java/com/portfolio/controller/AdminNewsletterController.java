package com.portfolio.controller;

import com.portfolio.dto.ApiResponse;
import com.portfolio.dto.NewsletterCreateRequest;
import com.portfolio.dto.NewsletterDto;
import com.portfolio.dto.NewsletterUpdateRequest;
import com.portfolio.service.NewsletterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/newsletters")
@RequiredArgsConstructor
public class AdminNewsletterController {

    private final NewsletterService newsletterService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NewsletterDto>>> getAll(
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        String lang = locale.toLowerCase().startsWith("pl") ? "pl" : "en";
        List<NewsletterDto> newsletters = newsletterService.getAll(lang);
        return ResponseEntity.ok(ApiResponse.success(newsletters));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsletterDto>> getById(
            @PathVariable UUID id,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        String lang = locale.toLowerCase().startsWith("pl") ? "pl" : "en";
        NewsletterDto newsletter = newsletterService.getById(id, lang);
        return ResponseEntity.ok(ApiResponse.success(newsletter));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NewsletterDto>> create(
            @Valid @RequestBody NewsletterCreateRequest request,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        String lang = locale.toLowerCase().startsWith("pl") ? "pl" : "en";
        NewsletterDto newsletter = newsletterService.create(request, lang);
        return ResponseEntity.ok(ApiResponse.success(newsletter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsletterDto>> update(
            @PathVariable UUID id,
            @RequestBody NewsletterUpdateRequest request,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        String lang = locale.toLowerCase().startsWith("pl") ? "pl" : "en";
        NewsletterDto newsletter = newsletterService.update(id, request, lang);
        return ResponseEntity.ok(ApiResponse.success(newsletter));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        newsletterService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
