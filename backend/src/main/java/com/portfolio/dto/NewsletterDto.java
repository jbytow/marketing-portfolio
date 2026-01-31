package com.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterDto {
    private UUID id;
    private String slug;
    private String title;
    private String titleEn;
    private String titlePl;
    private String content;
    private String contentEn;
    private String contentPl;
    private String image1;
    private String image2;
    private String image3;
    private Integer displayOrder;
    private Boolean published;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
