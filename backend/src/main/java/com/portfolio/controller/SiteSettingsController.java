package com.portfolio.controller;

import com.portfolio.dto.ApiResponse;
import com.portfolio.dto.SiteSettingsDto;
import com.portfolio.service.SiteSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SiteSettingsController {

    private final SiteSettingsService siteSettingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<SiteSettingsDto>> getSettings(
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        SiteSettingsDto settings = siteSettingsService.getSettings(extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    private String extractLocale(String acceptLanguage) {
        if (acceptLanguage == null || acceptLanguage.isBlank()) {
            return "en";
        }
        String primary = acceptLanguage.split(",")[0].split(";")[0].trim();
        return primary.startsWith("pl") ? "pl" : "en";
    }
}
