package com.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterUpdateRequest {
    private String titleEn;
    private String titlePl;
    private String slug;
    private String contentEn;
    private String contentPl;
    private String image1;
    private String image2;
    private String image3;
    private Integer displayOrder;
    private Boolean published;
}
