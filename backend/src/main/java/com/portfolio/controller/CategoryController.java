package com.portfolio.controller;

import com.portfolio.dto.ApiResponse;
import com.portfolio.dto.CategoryDto;
import com.portfolio.entity.Category;
import com.portfolio.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories(
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        List<CategoryDto> categories = categoryService.getAllCategories(extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{category}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategory(
            @PathVariable Category category,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        CategoryDto categoryDto = categoryService.getCategory(category, extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(categoryDto));
    }

    private String extractLocale(String acceptLanguage) {
        if (acceptLanguage == null || acceptLanguage.isBlank()) {
            return "en";
        }
        String primary = acceptLanguage.split(",")[0].split(";")[0].trim();
        return primary.startsWith("pl") ? "pl" : "en";
    }
}
