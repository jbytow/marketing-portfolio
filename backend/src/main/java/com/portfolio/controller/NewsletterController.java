package com.portfolio.controller;

import com.portfolio.dto.ApiResponse;
import com.portfolio.dto.NewsletterDto;
import com.portfolio.service.NewsletterService;
import com.portfolio.util.LocaleUtils;
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

        List<NewsletterDto> newsletters = newsletterService.getAllPublished(LocaleUtils.extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(newsletters));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<NewsletterDto>> getBySlug(
            @PathVariable String slug,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        NewsletterDto newsletter = newsletterService.getBySlug(slug, LocaleUtils.extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(newsletter));
    }
}
