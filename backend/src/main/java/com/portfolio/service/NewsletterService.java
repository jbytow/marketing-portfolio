package com.portfolio.service;

import com.portfolio.dto.NewsletterCreateRequest;
import com.portfolio.dto.NewsletterDto;
import com.portfolio.dto.NewsletterUpdateRequest;
import com.portfolio.entity.Newsletter;
import com.portfolio.repository.NewsletterRepository;
import com.portfolio.util.SlugUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsletterService {

    private final NewsletterRepository newsletterRepository;

    public List<NewsletterDto> getAllPublished(String locale) {
        return newsletterRepository.findByPublishedTrueOrderByDisplayOrderAsc()
                .stream()
                .map(n -> mapToDto(n, locale))
                .collect(Collectors.toList());
    }

    public List<NewsletterDto> getAll(String locale) {
        return newsletterRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(n -> mapToDto(n, locale))
                .collect(Collectors.toList());
    }

    public NewsletterDto getBySlug(String slug, String locale) {
        Newsletter newsletter = newsletterRepository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Newsletter not found: " + slug));
        return mapToDto(newsletter, locale);
    }

    public NewsletterDto getById(UUID id, String locale) {
        Newsletter newsletter = newsletterRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Newsletter not found: " + id));
        return mapToDto(newsletter, locale);
    }

    @Transactional
    public NewsletterDto create(NewsletterCreateRequest request, String locale) {
        Newsletter newsletter = Newsletter.builder()
                .titleEn(request.getTitleEn())
                .titlePl(request.getTitlePl())
                .slug(generateUniqueSlug(request.getSlug() == null || request.getSlug().isBlank()
                        ? request.getTitleEn()
                        : request.getSlug()))
                .contentEn(request.getContentEn())
                .contentPl(request.getContentPl())
                .image1(request.getImage1())
                .image2(request.getImage2())
                .image3(request.getImage3())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : newsletterRepository.getMaxDisplayOrder() + 1)
                .published(request.getPublished() != null ? request.getPublished() : false)
                .build();

        Newsletter saved = newsletterRepository.save(newsletter);
        return mapToDto(saved, locale);
    }

    @Transactional
    public NewsletterDto update(UUID id, NewsletterUpdateRequest request, String locale) {
        Newsletter newsletter = newsletterRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Newsletter not found: " + id));

        if (request.getTitleEn() != null) {
            newsletter.setTitleEn(request.getTitleEn());
        }
        if (request.getTitlePl() != null) {
            newsletter.setTitlePl(request.getTitlePl());
        }
        // A cleared or resent slug keeps the current one, so a published URL never silently changes or empties.
        // The raw comparison comes first: legacy slugs stored before normalization must survive unrelated edits.
        if (request.getSlug() != null && !request.getSlug().isBlank()
                && !request.getSlug().equals(newsletter.getSlug())) {
            String slug = SlugUtils.toSlug(request.getSlug());
            if (!slug.equals(newsletter.getSlug())) {
                if (newsletterRepository.existsBySlug(slug)) {
                    throw new IllegalArgumentException("Slug already in use");
                }
                newsletter.setSlug(slug);
            }
        }
        if (request.getContentEn() != null) {
            newsletter.setContentEn(request.getContentEn());
        }
        if (request.getContentPl() != null) {
            newsletter.setContentPl(request.getContentPl());
        }
        if (request.getImage1() != null) {
            newsletter.setImage1(request.getImage1());
        }
        if (request.getImage2() != null) {
            newsletter.setImage2(request.getImage2());
        }
        if (request.getImage3() != null) {
            newsletter.setImage3(request.getImage3());
        }
        if (request.getDisplayOrder() != null) {
            newsletter.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getPublished() != null) {
            newsletter.setPublished(request.getPublished());
        }

        Newsletter saved = newsletterRepository.save(newsletter);
        return mapToDto(saved, locale);
    }

    @Transactional
    public void delete(UUID id) {
        if (!newsletterRepository.existsById(id)) {
            throw new EntityNotFoundException("Newsletter not found: " + id);
        }
        newsletterRepository.deleteById(id);
    }

    private String generateUniqueSlug(String source) {
        String baseSlug = SlugUtils.toSlug(source);
        String slug = baseSlug;
        int counter = 1;

        while (newsletterRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        return slug;
    }

    private NewsletterDto mapToDto(Newsletter newsletter, String locale) {
        return NewsletterDto.builder()
                .id(newsletter.getId())
                .slug(newsletter.getSlug())
                .title(newsletter.getTitle(locale))
                .titleEn(newsletter.getTitleEn())
                .titlePl(newsletter.getTitlePl())
                .content(newsletter.getContent(locale))
                .contentEn(newsletter.getContentEn())
                .contentPl(newsletter.getContentPl())
                .image1(newsletter.getImage1())
                .image2(newsletter.getImage2())
                .image3(newsletter.getImage3())
                .displayOrder(newsletter.getDisplayOrder())
                .published(newsletter.getPublished())
                .createdAt(newsletter.getCreatedAt())
                .updatedAt(newsletter.getUpdatedAt())
                .build();
    }
}
