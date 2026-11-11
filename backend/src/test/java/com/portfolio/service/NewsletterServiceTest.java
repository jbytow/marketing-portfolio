package com.portfolio.service;

import com.portfolio.dto.NewsletterCreateRequest;
import com.portfolio.dto.NewsletterUpdateRequest;
import com.portfolio.entity.Newsletter;
import com.portfolio.repository.NewsletterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("NewsletterService")
class NewsletterServiceTest {

    @Mock
    private NewsletterRepository newsletterRepository;

    @InjectMocks
    private NewsletterService newsletterService;

    @Captor
    private ArgumentCaptor<Newsletter> newsletterCaptor;

    private Newsletter sampleNewsletter;
    private UUID newsletterId;

    @BeforeEach
    void setUp() {
        newsletterId = UUID.randomUUID();
        sampleNewsletter = Newsletter.builder()
                .id(newsletterId)
                .slug("spring-recap")
                .titleEn("Spring recap")
                .titlePl("Wiosenne podsumowanie")
                .contentEn("Content EN")
                .contentPl("Treść PL")
                .displayOrder(1)
                .published(true)
                .build();
    }

    @Nested
    @DisplayName("create slug")
    class CreateSlug {

        @Test
        @DisplayName("should normalize a provided slug")
        void shouldNormalizeProvidedSlug() {
            NewsletterCreateRequest request = newCreateRequest("Some Title");
            request.setSlug(" My Slug ");
            stubSaveForCreate();

            newsletterService.create(request, "en");

            verify(newsletterRepository).save(newsletterCaptor.capture());
            assertThat(newsletterCaptor.getValue().getSlug()).isEqualTo("my-slug");
        }

        @Test
        @DisplayName("should map Polish letters including ł when generating the slug from the title")
        void shouldMapPolishLetters() {
            NewsletterCreateRequest request = newCreateRequest("Głos marki");
            stubSaveForCreate();

            newsletterService.create(request, "en");

            verify(newsletterRepository).save(newsletterCaptor.capture());
            assertThat(newsletterCaptor.getValue().getSlug()).isEqualTo("glos-marki");
        }

        @Test
        @DisplayName("should separate words the same way posts do")
        void shouldMatchPostSlugShape() {
            NewsletterCreateRequest request = newCreateRequest("A&B");
            stubSaveForCreate();

            newsletterService.create(request, "en");

            verify(newsletterRepository).save(newsletterCaptor.capture());
            assertThat(newsletterCaptor.getValue().getSlug()).isEqualTo("a-b");
        }

        @Test
        @DisplayName("should never store a blank slug for a symbol-only title")
        void shouldNotStoreBlankSlugForSymbolTitle() {
            NewsletterCreateRequest request = newCreateRequest("!!! ???");
            stubSaveForCreate();

            newsletterService.create(request, "en");

            verify(newsletterRepository).save(newsletterCaptor.capture());
            assertThat(newsletterCaptor.getValue().getSlug()).isNotBlank().doesNotStartWith("-");
        }

        @Test
        @DisplayName("should append a number to a provided slug that is already taken")
        void shouldMakeProvidedSlugUnique() {
            NewsletterCreateRequest request = newCreateRequest("Some Title");
            request.setSlug("spring-recap");
            stubSaveForCreate();
            given(newsletterRepository.existsBySlug("spring-recap")).willReturn(true);

            newsletterService.create(request, "en");

            verify(newsletterRepository).save(newsletterCaptor.capture());
            assertThat(newsletterCaptor.getValue().getSlug()).isEqualTo("spring-recap-1");
        }

        private NewsletterCreateRequest newCreateRequest(String titleEn) {
            NewsletterCreateRequest request = new NewsletterCreateRequest();
            request.setTitleEn(titleEn);
            request.setTitlePl(titleEn);
            return request;
        }

        private void stubSaveForCreate() {
            lenient().when(newsletterRepository.existsBySlug(anyString())).thenReturn(false);
            given(newsletterRepository.getMaxDisplayOrder()).willReturn(0);
            given(newsletterRepository.save(any(Newsletter.class))).willAnswer(invocation -> invocation.getArgument(0));
        }
    }

    @Nested
    @DisplayName("update slug")
    class UpdateSlug {

        @ParameterizedTest
        @ValueSource(strings = {"", "   "})
        @DisplayName("should keep the existing slug when the slug field is cleared")
        void shouldKeepSlugWhenBlank(String blankSlug) {
            given(newsletterRepository.findById(newsletterId)).willReturn(Optional.of(sampleNewsletter));
            given(newsletterRepository.save(any(Newsletter.class))).willAnswer(invocation -> invocation.getArgument(0));
            NewsletterUpdateRequest request = new NewsletterUpdateRequest();
            request.setSlug(blankSlug);

            newsletterService.update(newsletterId, request, "en");

            verify(newsletterRepository).save(newsletterCaptor.capture());
            assertThat(newsletterCaptor.getValue().getSlug()).isEqualTo("spring-recap");
        }

        @Test
        @DisplayName("should normalize a new slug")
        void shouldNormalizeNewSlug() {
            given(newsletterRepository.findById(newsletterId)).willReturn(Optional.of(sampleNewsletter));
            given(newsletterRepository.existsBySlug("my-slug")).willReturn(false);
            given(newsletterRepository.save(any(Newsletter.class))).willAnswer(invocation -> invocation.getArgument(0));
            NewsletterUpdateRequest request = new NewsletterUpdateRequest();
            request.setSlug(" My Slug ");

            newsletterService.update(newsletterId, request, "en");

            verify(newsletterRepository).save(newsletterCaptor.capture());
            assertThat(newsletterCaptor.getValue().getSlug()).isEqualTo("my-slug");
        }

        @Test
        @DisplayName("should reject a slug owned by another newsletter")
        void shouldRejectSlugOfAnotherNewsletter() {
            given(newsletterRepository.findById(newsletterId)).willReturn(Optional.of(sampleNewsletter));
            given(newsletterRepository.existsBySlug("autumn-recap")).willReturn(true);
            NewsletterUpdateRequest request = new NewsletterUpdateRequest();
            request.setSlug("Autumn Recap");

            assertThatThrownBy(() -> newsletterService.update(newsletterId, request, "en"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Slug already in use");
            verify(newsletterRepository, never()).save(any());
        }

        @Test
        @DisplayName("should accept the newsletter's own unchanged slug")
        void shouldAcceptOwnSlug() {
            given(newsletterRepository.findById(newsletterId)).willReturn(Optional.of(sampleNewsletter));
            lenient().when(newsletterRepository.existsBySlug("spring-recap")).thenReturn(true);
            given(newsletterRepository.save(any(Newsletter.class))).willAnswer(invocation -> invocation.getArgument(0));
            NewsletterUpdateRequest request = new NewsletterUpdateRequest();
            request.setSlug("spring-recap");

            newsletterService.update(newsletterId, request, "en");

            verify(newsletterRepository).save(newsletterCaptor.capture());
            assertThat(newsletterCaptor.getValue().getSlug()).isEqualTo("spring-recap");
        }
    }
}
