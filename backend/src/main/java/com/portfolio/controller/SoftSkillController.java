package com.portfolio.controller;

import com.portfolio.dto.ApiResponse;
import com.portfolio.dto.SoftSkillDto;
import com.portfolio.service.SoftSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/soft-skills")
@RequiredArgsConstructor
public class SoftSkillController {

    private final SoftSkillService softSkillService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SoftSkillDto>>> getAllSoftSkills(
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        List<SoftSkillDto> skills = softSkillService.getAllSoftSkills(extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SoftSkillDto>> getSoftSkillById(
            @PathVariable UUID id,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        SoftSkillDto skill = softSkillService.getSoftSkillById(id, extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(skill));
    }

    private String extractLocale(String acceptLanguage) {
        if (acceptLanguage == null || acceptLanguage.isBlank()) {
            return "en";
        }
        String primary = acceptLanguage.split(",")[0].split(";")[0].trim();
        return primary.startsWith("pl") ? "pl" : "en";
    }
}
