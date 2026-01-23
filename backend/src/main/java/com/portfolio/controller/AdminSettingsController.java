package com.portfolio.controller;

import com.portfolio.dto.ApiResponse;
import com.portfolio.dto.SiteSettingsDto;
import com.portfolio.dto.SiteSettingsUpdateRequest;
import com.portfolio.service.SiteSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SiteSettingsService siteSettingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<SiteSettingsDto>> getSettings(
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        SiteSettingsDto settings = siteSettingsService.getSettings(extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SiteSettingsDto>> updateSettings(
            @RequestBody SiteSettingsUpdateRequest request,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        SiteSettingsDto settings = siteSettingsService.updateSettings(request, extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(settings, "Settings updated successfully"));
    }

    private String extractLocale(String acceptLanguage) {
        if (acceptLanguage == null || acceptLanguage.isBlank()) {
            return "en";
        }
        String primary = acceptLanguage.split(",")[0].split(";")[0].trim();
        return primary.startsWith("pl") ? "pl" : "en";
    }
}
