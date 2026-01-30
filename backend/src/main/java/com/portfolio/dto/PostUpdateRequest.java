package com.portfolio.dto;

import com.portfolio.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostUpdateRequest {

    private Category category;
    private String titleEn;
    private String titlePl;
    private String slug;
    private String excerptEn;
    private String excerptPl;
    private Map<String, Object> contentEn;
    private Map<String, Object> contentPl;
    private String featuredImage;
    private Boolean published;
    private Integer displayOrder;
    private Boolean isCaseStudy;

    // Category-specific details
    private CampaignDetailsDto campaignDetails;
    private CaseStudyDetailsDto caseStudyDetails;
}
