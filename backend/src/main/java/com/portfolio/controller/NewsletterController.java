package com.portfolio.controller;

import com.portfolio.dto.ApiResponse;
import com.portfolio.dto.NewsletterDto;
import com.portfolio.service.NewsletterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/newsletters")
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterService newsletterService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NewsletterDto>>> getAllPublished(
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        String lang = locale.toLowerCase().startsWith("pl") ? "pl" : "en";
        List<NewsletterDto> newsletters = newsletterService.getAllPublished(lang);
        return ResponseEntity.ok(ApiResponse.success(newsletters));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<NewsletterDto>> getBySlug(
            @PathVariable String slug,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        String lang = locale.toLowerCase().startsWith("pl") ? "pl" : "en";
        NewsletterDto newsletter = newsletterService.getBySlug(slug, lang);
        return ResponseEntity.ok(ApiResponse.success(newsletter));
    }
}
