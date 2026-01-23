package com.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "case_study_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseStudyDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false, unique = true)
    private Post post;

    @Column(name = "problem_en", columnDefinition = "TEXT")
    private String problemEn;

    @Column(name = "problem_pl", columnDefinition = "TEXT")
    private String problemPl;

    @Column(name = "solution_en", columnDefinition = "TEXT")
    private String solutionEn;

    @Column(name = "solution_pl", columnDefinition = "TEXT")
    private String solutionPl;

    @Column(name = "results_en", columnDefinition = "TEXT")
    private String resultsEn;

    @Column(name = "results_pl", columnDefinition = "TEXT")
    private String resultsPl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metrics", columnDefinition = "jsonb")
    private Map<String, Object> metrics;

    @Column(name = "testimonial_text_en", columnDefinition = "TEXT")
    private String testimonialTextEn;

    @Column(name = "testimonial_text_pl", columnDefinition = "TEXT")
    private String testimonialTextPl;

    @Column(name = "testimonial_author")
    private String testimonialAuthor;

    public String getProblem(String locale) {
        return "pl".equalsIgnoreCase(locale) ? problemPl : problemEn;
    }

    public String getSolution(String locale) {
        return "pl".equalsIgnoreCase(locale) ? solutionPl : solutionEn;
    }

    public String getResults(String locale) {
        return "pl".equalsIgnoreCase(locale) ? resultsPl : resultsEn;
    }

    public String getTestimonialText(String locale) {
        return "pl".equalsIgnoreCase(locale) ? testimonialTextPl : testimonialTextEn;
    }
}
