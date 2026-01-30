package com.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoftSkillUpdateRequest {
    private String nameEn;
    private String namePl;
    private String descriptionEn;
    private String descriptionPl;
    private String professionalUsageEn;
    private String professionalUsagePl;
    private String icon;
    private Integer displayOrder;
}
