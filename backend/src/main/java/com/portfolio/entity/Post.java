package com.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.portfolio.config.CategoryConverter;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Convert(converter = CategoryConverter.class)
    @Column(name = "category", nullable = false)
    private Category category;

    @Column(name = "title_en", nullable = false)
    private String titleEn;

    @Column(name = "title_pl", nullable = false)
    private String titlePl;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "excerpt_en", columnDefinition = "TEXT")
    private String excerptEn;

    @Column(name = "excerpt_pl", columnDefinition = "TEXT")
    private String excerptPl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_en", columnDefinition = "jsonb")
    private Map<String, Object> contentEn;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_pl", columnDefinition = "jsonb")
    private Map<String, Object> contentPl;

    @Column(name = "featured_image")
    private String featuredImage;

    @Column(name = "published")
    @Builder.Default
    private Boolean published = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_case_study")
    @Builder.Default
    private Boolean isCaseStudy = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToOne(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private CampaignDetails campaignDetails;

    @OneToOne(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private CaseStudyDetails caseStudyDetails;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Media> media = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public String getTitle(String locale) {
        return "pl".equalsIgnoreCase(locale) ? titlePl : titleEn;
    }

    public String getExcerpt(String locale) {
        return "pl".equalsIgnoreCase(locale) ? excerptPl : excerptEn;
    }

    public Map<String, Object> getContent(String locale) {
        return "pl".equalsIgnoreCase(locale) ? contentPl : contentEn;
    }
}
