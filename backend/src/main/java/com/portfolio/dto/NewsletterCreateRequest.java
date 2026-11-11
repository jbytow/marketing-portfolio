package com.portfolio.dto;

import jakarta.validation.constraints.Size;
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
    @Size(max = 255, message = "English title must not exceed 255 characters")
    private String titleEn;

    @NotBlank(message = "Polish title is required")
    @Size(max = 255, message = "Polish title must not exceed 255 characters")
    private String titlePl;

    @Size(max = 255, message = "Slug must not exceed 255 characters")
    private String slug;
    private String contentEn;
    private String contentPl;
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String image1;
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String image2;
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String image3;
    private Integer displayOrder;
    private Boolean published;
}
