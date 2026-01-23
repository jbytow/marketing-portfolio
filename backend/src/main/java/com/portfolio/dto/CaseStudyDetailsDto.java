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
public class CaseStudyDetailsDto {
    private String problem;
    private String problemEn;
    private String problemPl;
    private String solution;
    private String solutionEn;
    private String solutionPl;
    private String results;
    private String resultsEn;
    private String resultsPl;
    private Map<String, Object> metrics;
    private String testimonialText;
    private String testimonialTextEn;
    private String testimonialTextPl;
    private String testimonialAuthor;
}
