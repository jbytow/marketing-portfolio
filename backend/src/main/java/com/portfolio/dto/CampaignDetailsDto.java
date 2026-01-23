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
public class CampaignDetailsDto {
    private String clientName;
    private String projectType;
    private String projectTypeEn;
    private String projectTypePl;
    private Map<String, Object> results;
    private Map<String, Object> resultsEn;
    private Map<String, Object> resultsPl;
    private Map<String, Object> metrics;
}
