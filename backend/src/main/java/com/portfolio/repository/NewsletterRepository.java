package com.portfolio.repository;

import com.portfolio.entity.Newsletter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsletterRepository extends JpaRepository<Newsletter, UUID> {

    Optional<Newsletter> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Newsletter> findByPublishedTrueOrderByDisplayOrderAsc();

    List<Newsletter> findAllByOrderByDisplayOrderAsc();

    @Query("SELECT COALESCE(MAX(n.displayOrder), 0) FROM Newsletter n")
    Integer getMaxDisplayOrder();
}
