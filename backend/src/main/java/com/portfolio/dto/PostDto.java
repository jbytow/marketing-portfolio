package com.portfolio.dto;

import com.portfolio.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDto {
    private UUID id;
    private Category category;
    private String categoryLabel;
    private String title;
    private String titleEn;
    private String titlePl;
    private String slug;
    private String excerpt;
    private String excerptEn;
    private String excerptPl;
    private Map<String, Object> content;
    private Map<String, Object> contentEn;
    private Map<String, Object> contentPl;
    private String featuredImage;
    private Boolean published;
    private Integer displayOrder;
    private Boolean isCaseStudy;
    private List<String> hashtags;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Related media
    private List<MediaDto> media;
}
