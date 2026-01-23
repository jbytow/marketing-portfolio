package com.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "influence_marketing_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfluenceMarketingDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false, unique = true)
    private Post post;

    @Column(name = "partnership_type_en")
    private String partnershipTypeEn;

    @Column(name = "partnership_type_pl")
    private String partnershipTypePl;

    @Column(name = "community_size")
    private Integer communitySize;

    @Column(name = "engagement_rate", precision = 5, scale = 2)
    private BigDecimal engagementRate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "platforms", columnDefinition = "jsonb")
    private List<String> platforms;

    public String getPartnershipType(String locale) {
        return "pl".equalsIgnoreCase(locale) ? partnershipTypePl : partnershipTypeEn;
    }
}
