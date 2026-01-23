package com.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceDetailsDto {
    private String companyName;
    private String role;
    private String roleEn;
    private String rolePl;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> achievements;
    private List<String> achievementsEn;
    private List<String> achievementsPl;
}
