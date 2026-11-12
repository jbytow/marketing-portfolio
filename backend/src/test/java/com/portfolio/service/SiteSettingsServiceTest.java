package com.portfolio.service;

import com.portfolio.dto.SiteSettingsDto;
import com.portfolio.dto.SiteSettingsUpdateRequest;
import com.portfolio.dto.StatItemDto;
import com.portfolio.entity.SiteSettings;
import com.portfolio.repository.SiteSettingsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("SiteSettingsService")
class SiteSettingsServiceTest {

    @Mock
    private SiteSettingsRepository siteSettingsRepository;

    @InjectMocks
    private SiteSettingsService siteSettingsService;

    private SiteSettings existing;

    @BeforeEach
    void setUp() {
        existing = SiteSettings.builder()
                .id(1)
                .heroTitleEn("Hero")
                .heroTitlePl("Bohater")
                .ownerName("Owner")
                .siteName("Site")
                .email("owner@example.com")
                .build();
    }

    private SiteSettings saveAndCapture(SiteSettingsUpdateRequest request) {
        clearInvocations(siteSettingsRepository);
        given(siteSettingsRepository.findById(1)).willReturn(Optional.of(existing));
        given(siteSettingsRepository.save(any(SiteSettings.class))).willAnswer(invocation -> invocation.getArgument(0));

        siteSettingsService.updateSettings(request, "en");

        ArgumentCaptor<SiteSettings> captor = ArgumentCaptor.forClass(SiteSettings.class);
        verify(siteSettingsRepository).save(captor.capture());
        return captor.getValue();
    }

    @Nested
    @DisplayName("getSettings")
    class GetSettings {

        @Test
        @DisplayName("returns the stored row for the requested locale")
        void returnsStoredRow() {
            given(siteSettingsRepository.findById(1)).willReturn(Optional.of(existing));

            SiteSettingsDto result = siteSettingsService.getSettings("pl");

            assertThat(result.getHeroTitle()).isEqualTo("Bohater");
            assertThat(result.getOwnerName()).isEqualTo("Owner");
        }

        @Test
        @DisplayName("throws EntityNotFoundException when the singleton row is missing, without writing")
        void missingRowThrowsAndNeverSaves() {
            given(siteSettingsRepository.findById(1)).willReturn(Optional.empty());

            assertThatThrownBy(() -> siteSettingsService.getSettings("en"))
                    .isInstanceOf(EntityNotFoundException.class);

            verify(siteSettingsRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("updateSettings")
    class UpdateSettings {

        @Test
        @DisplayName("missing row throws EntityNotFoundException and never saves")
        void missingRowThrowsAndNeverSaves() {
            given(siteSettingsRepository.findById(1)).willReturn(Optional.empty());

            assertThatThrownBy(() -> siteSettingsService.updateSettings(new SiteSettingsUpdateRequest(), "en"))
                    .isInstanceOf(EntityNotFoundException.class);

            verify(siteSettingsRepository, never()).save(any());
        }

        @Test
        @DisplayName("partial update changes only the supplied fields")
        void partialUpdateKeepsUnspecifiedFields() {
            SiteSettings saved = saveAndCapture(SiteSettingsUpdateRequest.builder()
                    .heroTitleEn("New hero")
                    .build());

            assertThat(saved.getHeroTitleEn()).isEqualTo("New hero");
            assertThat(saved.getHeroTitlePl()).isEqualTo("Bohater");
            assertThat(saved.getOwnerName()).isEqualTo("Owner");
            assertThat(saved.getSiteName()).isEqualTo("Site");
            assertThat(saved.getEmail()).isEqualTo("owner@example.com");
        }

        @Test
        @DisplayName("roseForceMotion toggles on and off and is kept when omitted")
        void roseForceMotionToggles() {
            SiteSettings saved = saveAndCapture(SiteSettingsUpdateRequest.builder().roseForceMotion(true).build());
            assertThat(saved.isRoseForceMotion()).isTrue();

            existing = saved;
            saved = saveAndCapture(SiteSettingsUpdateRequest.builder().heroTitleEn("x").build());
            assertThat(saved.isRoseForceMotion()).isTrue();

            existing = saved;
            saved = saveAndCapture(SiteSettingsUpdateRequest.builder().roseForceMotion(false).build());
            assertThat(saved.isRoseForceMotion()).isFalse();
        }

        @Test
        @DisplayName("statsItems are stored as maps with icon, value and both labels")
        void statsItemsAreMapped() {
            SiteSettings saved = saveAndCapture(SiteSettingsUpdateRequest.builder()
                    .statsItems(List.of(StatItemDto.builder()
                            .icon("star").value("10+").labelEn("Years").labelPl("Lat").build()))
                    .build());

            assertThat(saved.getStatsItems()).hasSize(1);
            assertThat(saved.getStatsItems().get(0))
                    .containsEntry("icon", "star")
                    .containsEntry("value", "10+")
                    .containsEntry("labelEn", "Years")
                    .containsEntry("labelPl", "Lat");
        }

        @Test
        @DisplayName("stats labels in the response follow the requested locale")
        void statsLabelsFollowLocale() {
            existing.setStatsItems(List.of(Map.of("icon", "star", "value", "10+", "labelEn", "Years", "labelPl", "Lat")));
            given(siteSettingsRepository.findById(1)).willReturn(Optional.of(existing));

            assertThat(siteSettingsService.getSettings("pl").getStatsItems().get(0).getLabel()).isEqualTo("Lat");
            assertThat(siteSettingsService.getSettings("en").getStatsItems().get(0).getLabel()).isEqualTo("Years");
        }

        @Test
        @DisplayName("cleared social links are dropped, filled ones are kept")
        void blankSocialLinksAreDropped() {
            Map<String, String> links = new LinkedHashMap<>();
            links.put("linkedin", "");
            links.put("github", "  ");
            links.put("facebook", null);
            links.put("x", "https://x.com/a");

            SiteSettings saved = saveAndCapture(SiteSettingsUpdateRequest.builder().socialLinks(links).build());

            assertThat(saved.getSocialLinks()).containsOnlyKeys("x").containsEntry("x", "https://x.com/a");
        }
    }
}
