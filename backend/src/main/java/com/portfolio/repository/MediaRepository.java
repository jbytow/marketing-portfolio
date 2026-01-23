package com.portfolio.repository;

import com.portfolio.entity.Media;
import com.portfolio.entity.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {

    List<Media> findByPostIdOrderByCreatedAtDesc(UUID postId);

    Page<Media> findByPostIdIsNull(Pageable pageable);

    Page<Media> findByType(MediaType type, Pageable pageable);

    List<Media> findByPostIdIsNullOrderByCreatedAtDesc();

    boolean existsByFilename(String filename);
}
