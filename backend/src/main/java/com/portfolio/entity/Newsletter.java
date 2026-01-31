package com.portfolio.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "newsletters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Newsletter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "title_en", nullable = false)
    private String titleEn;

    @Column(name = "title_pl", nullable = false)
    private String titlePl;

    @Column(name = "content_en", columnDefinition = "TEXT")
    private String contentEn;

    @Column(name = "content_pl", columnDefinition = "TEXT")
    private String contentPl;

    @Column(name = "image1", length = 500)
    private String image1;

    @Column(name = "image2", length = 500)
    private String image2;

    @Column(name = "image3", length = 500)
    private String image3;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean published = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Locale-aware getters
    public String getTitle(String locale) {
        return "pl".equalsIgnoreCase(locale) ? titlePl : titleEn;
    }

    public String getContent(String locale) {
        return "pl".equalsIgnoreCase(locale) ? contentPl : contentEn;
    }
}
