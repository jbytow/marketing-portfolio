package com.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "experience_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false, unique = true)
    private Post post;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "role_en", nullable = false)
    private String roleEn;

    @Column(name = "role_pl", nullable = false)
    private String rolePl;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "achievements_en", columnDefinition = "jsonb")
    private List<String> achievementsEn;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "achievements_pl", columnDefinition = "jsonb")
    private List<String> achievementsPl;

    public String getRole(String locale) {
        return "pl".equalsIgnoreCase(locale) ? rolePl : roleEn;
    }

    public List<String> getAchievements(String locale) {
        return "pl".equalsIgnoreCase(locale) ? achievementsPl : achievementsEn;
    }
}
