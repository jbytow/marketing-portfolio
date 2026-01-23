package com.portfolio.service;

import com.github.slugify.Slugify;
import com.portfolio.dto.*;
import com.portfolio.entity.*;
import com.portfolio.repository.PostRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final Slugify slugify = Slugify.builder().build();

    public List<PostDto> getAllPublishedPosts(String locale) {
        return postRepository.findAllPublished().stream()
                .map(post -> mapToDto(post, locale, false))
                .toList();
    }

    public Page<PostDto> getPublishedPosts(Pageable pageable, String locale) {
        return postRepository.findByPublishedTrue(pageable)
                .map(post -> mapToDto(post, locale, false));
    }

    public List<PostDto> getPostsByCategory(Category category, String locale) {
        return postRepository.findByCategoryAndPublishedTrueOrderByDisplayOrderAsc(category).stream()
                .map(post -> mapToDto(post, locale, false))
                .toList();
    }

    public Page<PostDto> getPostsByCategory(Category category, Pageable pageable, String locale) {
        return postRepository.findByCategoryAndPublishedTrue(category, pageable)
                .map(post -> mapToDto(post, locale, false));
    }

    public PostDto getPostBySlug(String slug, String locale) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + slug));
        return mapToDto(post, locale, true);
    }

    public PostDto getPostById(UUID id, String locale) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));
        return mapToDto(post, locale, true);
    }

    // Admin methods
    public List<PostDto> getAllPosts(String locale) {
        return postRepository.findAll().stream()
                .map(post -> mapToDto(post, locale, false))
                .toList();
    }

    public List<PostDto> getAllPostsByCategory(Category category, String locale) {
        return postRepository.findAllByCategory(category).stream()
                .map(post -> mapToDto(post, locale, false))
                .toList();
    }

    @Transactional
    public PostDto createPost(PostCreateRequest request, String locale) {
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = generateUniqueSlug(request.getTitleEn());
        }

        Post post = Post.builder()
                .category(request.getCategory())
                .titleEn(request.getTitleEn())
                .titlePl(request.getTitlePl())
                .slug(slug)
                .excerptEn(request.getExcerptEn())
                .excerptPl(request.getExcerptPl())
                .contentEn(request.getContentEn())
                .contentPl(request.getContentPl())
                .featuredImage(request.getFeaturedImage())
                .published(request.getPublished() != null ? request.getPublished() : false)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() :
                        postRepository.getMaxDisplayOrder(request.getCategory()) + 1)
                .build();

        post = postRepository.save(post);

        // Create category-specific details
        createCategoryDetails(post, request);

        return mapToDto(post, locale, true);
    }

    @Transactional
    public PostDto updatePost(UUID id, PostUpdateRequest request, String locale) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));

        if (request.getCategory() != null) {
            post.setCategory(request.getCategory());
        }
        if (request.getTitleEn() != null) {
            post.setTitleEn(request.getTitleEn());
        }
        if (request.getTitlePl() != null) {
            post.setTitlePl(request.getTitlePl());
        }
        if (request.getSlug() != null) {
            post.setSlug(request.getSlug());
        }
        if (request.getExcerptEn() != null) {
            post.setExcerptEn(request.getExcerptEn());
        }
        if (request.getExcerptPl() != null) {
            post.setExcerptPl(request.getExcerptPl());
        }
        if (request.getContentEn() != null) {
            post.setContentEn(request.getContentEn());
        }
        if (request.getContentPl() != null) {
            post.setContentPl(request.getContentPl());
        }
        if (request.getFeaturedImage() != null) {
            post.setFeaturedImage(request.getFeaturedImage());
        }
        if (request.getPublished() != null) {
            post.setPublished(request.getPublished());
        }
        if (request.getDisplayOrder() != null) {
            post.setDisplayOrder(request.getDisplayOrder());
        }

        // Update category-specific details
        updateCategoryDetails(post, request);

        post = postRepository.save(post);
        return mapToDto(post, locale, true);
    }

    @Transactional
    public void deletePost(UUID id) {
        if (!postRepository.existsById(id)) {
            throw new EntityNotFoundException("Post not found: " + id);
        }
        postRepository.deleteById(id);
    }

    @Transactional
    public PostDto togglePublish(UUID id, String locale) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));
        post.setPublished(!post.getPublished());
        post = postRepository.save(post);
        return mapToDto(post, locale, true);
    }

    @Transactional
    public void reorderPosts(ReorderRequest request) {
        for (ReorderRequest.OrderItem item : request.getItems()) {
            postRepository.updateDisplayOrder(item.getId(), item.getDisplayOrder());
        }
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = slugify.slugify(title);
        String slug = baseSlug;
        int counter = 1;

        while (postRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        return slug;
    }

    private void createCategoryDetails(Post post, PostCreateRequest request) {
        switch (post.getCategory()) {
            case EXPERIENCE -> {
                if (request.getExperienceDetails() != null) {
                    ExperienceDetails details = mapExperienceDetails(request.getExperienceDetails());
                    details.setPost(post);
                    post.setExperienceDetails(details);
                }
            }
            case CAMPAIGNS -> {
                if (request.getCampaignDetails() != null) {
                    CampaignDetails details = mapCampaignDetails(request.getCampaignDetails());
                    details.setPost(post);
                    post.setCampaignDetails(details);
                }
            }
            case CASE_STUDY -> {
                if (request.getCaseStudyDetails() != null) {
                    CaseStudyDetails details = mapCaseStudyDetails(request.getCaseStudyDetails());
                    details.setPost(post);
                    post.setCaseStudyDetails(details);
                }
            }
            case INFLUENCE_MARKETING -> {
                if (request.getInfluenceMarketingDetails() != null) {
                    InfluenceMarketingDetails details = mapInfluenceMarketingDetails(request.getInfluenceMarketingDetails());
                    details.setPost(post);
                    post.setInfluenceMarketingDetails(details);
                }
            }
            default -> {}
        }
    }

    private void updateCategoryDetails(Post post, PostUpdateRequest request) {
        switch (post.getCategory()) {
            case EXPERIENCE -> {
                if (request.getExperienceDetails() != null) {
                    ExperienceDetails details = post.getExperienceDetails();
                    if (details == null) {
                        details = new ExperienceDetails();
                        details.setPost(post);
                        post.setExperienceDetails(details);
                    }
                    updateExperienceDetails(details, request.getExperienceDetails());
                }
            }
            case CAMPAIGNS -> {
                if (request.getCampaignDetails() != null) {
                    CampaignDetails details = post.getCampaignDetails();
                    if (details == null) {
                        details = new CampaignDetails();
                        details.setPost(post);
                        post.setCampaignDetails(details);
                    }
                    updateCampaignDetails(details, request.getCampaignDetails());
                }
            }
            case CASE_STUDY -> {
                if (request.getCaseStudyDetails() != null) {
                    CaseStudyDetails details = post.getCaseStudyDetails();
                    if (details == null) {
                        details = new CaseStudyDetails();
                        details.setPost(post);
                        post.setCaseStudyDetails(details);
                    }
                    updateCaseStudyDetails(details, request.getCaseStudyDetails());
                }
            }
            case INFLUENCE_MARKETING -> {
                if (request.getInfluenceMarketingDetails() != null) {
                    InfluenceMarketingDetails details = post.getInfluenceMarketingDetails();
                    if (details == null) {
                        details = new InfluenceMarketingDetails();
                        details.setPost(post);
                        post.setInfluenceMarketingDetails(details);
                    }
                    updateInfluenceMarketingDetails(details, request.getInfluenceMarketingDetails());
                }
            }
            default -> {}
        }
    }

    private ExperienceDetails mapExperienceDetails(ExperienceDetailsDto dto) {
        return ExperienceDetails.builder()
                .companyName(dto.getCompanyName())
                .roleEn(dto.getRoleEn())
                .rolePl(dto.getRolePl())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .achievementsEn(dto.getAchievementsEn())
                .achievementsPl(dto.getAchievementsPl())
                .build();
    }

    private void updateExperienceDetails(ExperienceDetails details, ExperienceDetailsDto dto) {
        if (dto.getCompanyName() != null) details.setCompanyName(dto.getCompanyName());
        if (dto.getRoleEn() != null) details.setRoleEn(dto.getRoleEn());
        if (dto.getRolePl() != null) details.setRolePl(dto.getRolePl());
        if (dto.getStartDate() != null) details.setStartDate(dto.getStartDate());
        details.setEndDate(dto.getEndDate());
        if (dto.getAchievementsEn() != null) details.setAchievementsEn(dto.getAchievementsEn());
        if (dto.getAchievementsPl() != null) details.setAchievementsPl(dto.getAchievementsPl());
    }

    private CampaignDetails mapCampaignDetails(CampaignDetailsDto dto) {
        return CampaignDetails.builder()
                .clientName(dto.getClientName())
                .projectTypeEn(dto.getProjectTypeEn())
                .projectTypePl(dto.getProjectTypePl())
                .resultsEn(dto.getResultsEn())
                .resultsPl(dto.getResultsPl())
                .metrics(dto.getMetrics())
                .build();
    }

    private void updateCampaignDetails(CampaignDetails details, CampaignDetailsDto dto) {
        if (dto.getClientName() != null) details.setClientName(dto.getClientName());
        if (dto.getProjectTypeEn() != null) details.setProjectTypeEn(dto.getProjectTypeEn());
        if (dto.getProjectTypePl() != null) details.setProjectTypePl(dto.getProjectTypePl());
        if (dto.getResultsEn() != null) details.setResultsEn(dto.getResultsEn());
        if (dto.getResultsPl() != null) details.setResultsPl(dto.getResultsPl());
        if (dto.getMetrics() != null) details.setMetrics(dto.getMetrics());
    }

    private CaseStudyDetails mapCaseStudyDetails(CaseStudyDetailsDto dto) {
        return CaseStudyDetails.builder()
                .problemEn(dto.getProblemEn())
                .problemPl(dto.getProblemPl())
                .solutionEn(dto.getSolutionEn())
                .solutionPl(dto.getSolutionPl())
                .resultsEn(dto.getResultsEn())
                .resultsPl(dto.getResultsPl())
                .metrics(dto.getMetrics())
                .testimonialTextEn(dto.getTestimonialTextEn())
                .testimonialTextPl(dto.getTestimonialTextPl())
                .testimonialAuthor(dto.getTestimonialAuthor())
                .build();
    }

    private void updateCaseStudyDetails(CaseStudyDetails details, CaseStudyDetailsDto dto) {
        if (dto.getProblemEn() != null) details.setProblemEn(dto.getProblemEn());
        if (dto.getProblemPl() != null) details.setProblemPl(dto.getProblemPl());
        if (dto.getSolutionEn() != null) details.setSolutionEn(dto.getSolutionEn());
        if (dto.getSolutionPl() != null) details.setSolutionPl(dto.getSolutionPl());
        if (dto.getResultsEn() != null) details.setResultsEn(dto.getResultsEn());
        if (dto.getResultsPl() != null) details.setResultsPl(dto.getResultsPl());
        if (dto.getMetrics() != null) details.setMetrics(dto.getMetrics());
        if (dto.getTestimonialTextEn() != null) details.setTestimonialTextEn(dto.getTestimonialTextEn());
        if (dto.getTestimonialTextPl() != null) details.setTestimonialTextPl(dto.getTestimonialTextPl());
        if (dto.getTestimonialAuthor() != null) details.setTestimonialAuthor(dto.getTestimonialAuthor());
    }

    private InfluenceMarketingDetails mapInfluenceMarketingDetails(InfluenceMarketingDetailsDto dto) {
        return InfluenceMarketingDetails.builder()
                .partnershipTypeEn(dto.getPartnershipTypeEn())
                .partnershipTypePl(dto.getPartnershipTypePl())
                .communitySize(dto.getCommunitySize())
                .engagementRate(dto.getEngagementRate())
                .platforms(dto.getPlatforms())
                .build();
    }

    private void updateInfluenceMarketingDetails(InfluenceMarketingDetails details, InfluenceMarketingDetailsDto dto) {
        if (dto.getPartnershipTypeEn() != null) details.setPartnershipTypeEn(dto.getPartnershipTypeEn());
        if (dto.getPartnershipTypePl() != null) details.setPartnershipTypePl(dto.getPartnershipTypePl());
        if (dto.getCommunitySize() != null) details.setCommunitySize(dto.getCommunitySize());
        if (dto.getEngagementRate() != null) details.setEngagementRate(dto.getEngagementRate());
        if (dto.getPlatforms() != null) details.setPlatforms(dto.getPlatforms());
    }

    private PostDto mapToDto(Post post, String locale, boolean includeContent) {
        PostDto.PostDtoBuilder builder = PostDto.builder()
                .id(post.getId())
                .category(post.getCategory())
                .categoryLabel(post.getCategory().getLabel(locale))
                .title(post.getTitle(locale))
                .titleEn(post.getTitleEn())
                .titlePl(post.getTitlePl())
                .slug(post.getSlug())
                .excerpt(post.getExcerpt(locale))
                .excerptEn(post.getExcerptEn())
                .excerptPl(post.getExcerptPl())
                .featuredImage(post.getFeaturedImage())
                .published(post.getPublished())
                .displayOrder(post.getDisplayOrder())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt());

        if (includeContent) {
            builder.content(post.getContent(locale))
                    .contentEn(post.getContentEn())
                    .contentPl(post.getContentPl());

            // Map category-specific details
            if (post.getExperienceDetails() != null) {
                builder.experienceDetails(mapExperienceDetailsToDto(post.getExperienceDetails(), locale));
            }
            if (post.getCampaignDetails() != null) {
                builder.campaignDetails(mapCampaignDetailsToDto(post.getCampaignDetails(), locale));
            }
            if (post.getCaseStudyDetails() != null) {
                builder.caseStudyDetails(mapCaseStudyDetailsToDto(post.getCaseStudyDetails(), locale));
            }
            if (post.getInfluenceMarketingDetails() != null) {
                builder.influenceMarketingDetails(mapInfluenceMarketingDetailsToDto(post.getInfluenceMarketingDetails(), locale));
            }

            // Map media
            if (post.getMedia() != null && !post.getMedia().isEmpty()) {
                builder.media(post.getMedia().stream()
                        .map(media -> mapMediaToDto(media, locale))
                        .toList());
            }
        }

        return builder.build();
    }

    private ExperienceDetailsDto mapExperienceDetailsToDto(ExperienceDetails details, String locale) {
        return ExperienceDetailsDto.builder()
                .companyName(details.getCompanyName())
                .role(details.getRole(locale))
                .roleEn(details.getRoleEn())
                .rolePl(details.getRolePl())
                .startDate(details.getStartDate())
                .endDate(details.getEndDate())
                .achievements(details.getAchievements(locale))
                .achievementsEn(details.getAchievementsEn())
                .achievementsPl(details.getAchievementsPl())
                .build();
    }

    private CampaignDetailsDto mapCampaignDetailsToDto(CampaignDetails details, String locale) {
        return CampaignDetailsDto.builder()
                .clientName(details.getClientName())
                .projectType(details.getProjectType(locale))
                .projectTypeEn(details.getProjectTypeEn())
                .projectTypePl(details.getProjectTypePl())
                .results(details.getResults(locale))
                .resultsEn(details.getResultsEn())
                .resultsPl(details.getResultsPl())
                .metrics(details.getMetrics())
                .build();
    }

    private CaseStudyDetailsDto mapCaseStudyDetailsToDto(CaseStudyDetails details, String locale) {
        return CaseStudyDetailsDto.builder()
                .problem(details.getProblem(locale))
                .problemEn(details.getProblemEn())
                .problemPl(details.getProblemPl())
                .solution(details.getSolution(locale))
                .solutionEn(details.getSolutionEn())
                .solutionPl(details.getSolutionPl())
                .results(details.getResults(locale))
                .resultsEn(details.getResultsEn())
                .resultsPl(details.getResultsPl())
                .metrics(details.getMetrics())
                .testimonialText(details.getTestimonialText(locale))
                .testimonialTextEn(details.getTestimonialTextEn())
                .testimonialTextPl(details.getTestimonialTextPl())
                .testimonialAuthor(details.getTestimonialAuthor())
                .build();
    }

    private InfluenceMarketingDetailsDto mapInfluenceMarketingDetailsToDto(InfluenceMarketingDetails details, String locale) {
        return InfluenceMarketingDetailsDto.builder()
                .partnershipType(details.getPartnershipType(locale))
                .partnershipTypeEn(details.getPartnershipTypeEn())
                .partnershipTypePl(details.getPartnershipTypePl())
                .communitySize(details.getCommunitySize())
                .engagementRate(details.getEngagementRate())
                .platforms(details.getPlatforms())
                .build();
    }

    private MediaDto mapMediaToDto(Media media, String locale) {
        return MediaDto.builder()
                .id(media.getId())
                .postId(media.getPost() != null ? media.getPost().getId() : null)
                .type(media.getType())
                .filename(media.getFilename())
                .originalName(media.getOriginalName())
                .mimeType(media.getMimeType())
                .size(media.getSize())
                .url(media.getUrl())
                .altText(media.getAltText(locale))
                .altTextEn(media.getAltTextEn())
                .altTextPl(media.getAltTextPl())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
