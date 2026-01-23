package com.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfluenceMarketingDetailsDto {
    private String partnershipType;
    private String partnershipTypeEn;
    private String partnershipTypePl;
    private Integer communitySize;
    private BigDecimal engagementRate;
    private List<String> platforms;
}
