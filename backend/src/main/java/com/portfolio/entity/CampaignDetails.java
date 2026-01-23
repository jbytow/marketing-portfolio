package com.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "campaign_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false, unique = true)
    private Post post;

    @Column(name = "client_name")
    private String clientName;

    @Column(name = "project_type_en")
    private String projectTypeEn;

    @Column(name = "project_type_pl")
    private String projectTypePl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "results_en", columnDefinition = "jsonb")
    private Map<String, Object> resultsEn;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "results_pl", columnDefinition = "jsonb")
    private Map<String, Object> resultsPl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metrics", columnDefinition = "jsonb")
    private Map<String, Object> metrics;

    public String getProjectType(String locale) {
        return "pl".equalsIgnoreCase(locale) ? projectTypePl : projectTypeEn;
    }

    public Map<String, Object> getResults(String locale) {
        return "pl".equalsIgnoreCase(locale) ? resultsPl : resultsEn;
    }
}
