package com.portfolio.controller;

import com.portfolio.dto.ApiResponse;
import com.portfolio.dto.PostDto;
import com.portfolio.entity.Category;
import com.portfolio.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PostDto>>> getPosts(
            @RequestParam(required = false) Category category,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        List<PostDto> posts;
        if (category != null) {
            posts = postService.getPostsByCategory(category, extractLocale(locale));
        } else {
            posts = postService.getAllPublishedPosts(extractLocale(locale));
        }

        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<Page<PostDto>>> getPostsPaged(
            @RequestParam(required = false) Category category,
            @PageableDefault(size = 10) Pageable pageable,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        Page<PostDto> posts;
        if (category != null) {
            posts = postService.getPostsByCategory(category, pageable, extractLocale(locale));
        } else {
            posts = postService.getPublishedPosts(pageable, extractLocale(locale));
        }

        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/case-studies")
    public ResponseEntity<ApiResponse<List<PostDto>>> getCaseStudies(
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        List<PostDto> caseStudies = postService.getCaseStudies(extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(caseStudies));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PostDto>> getPost(
            @PathVariable String slug,
            @RequestHeader(value = "Accept-Language", defaultValue = "en") String locale) {

        PostDto post = postService.getPostBySlug(slug, extractLocale(locale));
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    private String extractLocale(String acceptLanguage) {
        if (acceptLanguage == null || acceptLanguage.isBlank()) {
            return "en";
        }
        String primary = acceptLanguage.split(",")[0].split(";")[0].trim();
        return primary.startsWith("pl") ? "pl" : "en";
    }
}
