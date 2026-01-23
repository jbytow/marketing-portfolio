package com.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSettingsDto {
    private String heroTitle;
    private String heroTitleEn;
    private String heroTitlePl;
    private String heroSubtitle;
    private String heroSubtitleEn;
    private String heroSubtitlePl;
    private String aboutText;
    private String aboutTextEn;
    private String aboutTextPl;
    private String profileImage;
    private String email;
    private String phone;
    private Map<String, String> socialLinks;
    private String metaDescription;
    private String metaDescriptionEn;
    private String metaDescriptionPl;
}
