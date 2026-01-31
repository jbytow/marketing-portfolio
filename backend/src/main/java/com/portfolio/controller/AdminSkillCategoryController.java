package com.portfolio.controller;

import com.portfolio.dto.*;
import com.portfolio.service.SkillCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/skill-categories")
@RequiredArgsConstructor
public class AdminSkillCategoryController {

    private final SkillCategoryService skillCategoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillCategoryDto>>> getAllCategories(
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        List<SkillCategoryDto> categories = skillCategoryService.getAllCategories(extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SkillCategoryDto>> getCategoryById(
            @PathVariable UUID id,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        SkillCategoryDto category = skillCategoryService.getCategoryById(id, extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SkillCategoryDto>> createCategory(
            @Valid @RequestBody SkillCategoryCreateRequest request,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        SkillCategoryDto category = skillCategoryService.createCategory(request, extractLocale(locale));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(category, "Skill category created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SkillCategoryDto>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody SkillCategoryUpdateRequest request,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        SkillCategoryDto category = skillCategoryService.updateCategory(id, request, extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(category, "Skill category updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        skillCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Skill category deleted successfully"));
    }

    @PatchMapping("/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderCategories(@RequestBody ReorderRequest request) {
        skillCategoryService.reorderCategories(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Skill categories reordered successfully"));
    }

    private String extractLocale(String acceptLanguage) {
        if (acceptLanguage == null || acceptLanguage.isBlank()) {
            return "en";
        }
        String primary = acceptLanguage.split(",")[0].split(";")[0].trim();
        return primary.startsWith("pl") ? "pl" : "en";
    }
}
