package com.portfolio.dto;

import com.portfolio.entity.SoftSkill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoftSkillDto {
    private UUID id;
    private String name;
    private String nameEn;
    private String namePl;
    private String description;
    private String descriptionEn;
    private String descriptionPl;
    private String professionalUsage;
    private String professionalUsageEn;
    private String professionalUsagePl;
    private String icon;
    private Integer displayOrder;
    private UUID categoryId;
    private String categoryName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static SoftSkillDto from(SoftSkill skill, String locale) {
        return SoftSkillDto.builder()
                .id(skill.getId())
                .name(skill.getName(locale))
                .nameEn(skill.getNameEn())
                .namePl(skill.getNamePl())
                .description(skill.getDescription(locale))
                .descriptionEn(skill.getDescriptionEn())
                .descriptionPl(skill.getDescriptionPl())
                .professionalUsage(skill.getProfessionalUsage(locale))
                .professionalUsageEn(skill.getProfessionalUsageEn())
                .professionalUsagePl(skill.getProfessionalUsagePl())
                .icon(skill.getIcon())
                .displayOrder(skill.getDisplayOrder())
                .categoryId(skill.getCategory() != null ? skill.getCategory().getId() : null)
                .categoryName(skill.getCategory() != null ? skill.getCategory().getName(locale) : null)
                .createdAt(skill.getCreatedAt())
                .updatedAt(skill.getUpdatedAt())
                .build();
    }
}
