package com.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterCreateRequest {

    @NotBlank(message = "English title is required")
    private String titleEn;

    @NotBlank(message = "Polish title is required")
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
