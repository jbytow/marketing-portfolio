package com.portfolio.service;

import com.portfolio.dto.ReorderRequest;
import com.portfolio.dto.SoftSkillCreateRequest;
import com.portfolio.dto.SoftSkillDto;
import com.portfolio.dto.SoftSkillUpdateRequest;
import com.portfolio.entity.SkillCategory;
import com.portfolio.entity.SoftSkill;
import com.portfolio.repository.SkillCategoryRepository;
import com.portfolio.repository.SoftSkillRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@ExtendWith(MockitoExtension.class)
@DisplayName("SoftSkillService")
class SoftSkillServiceTest {

    @Mock
    private SoftSkillRepository softSkillRepository;

    @Mock
    private SkillCategoryRepository skillCategoryRepository;

    @InjectMocks
    private SoftSkillService softSkillService;

    @Captor
    private ArgumentCaptor<SoftSkill> skillCaptor;

    private SkillCategory sampleCategory;
    private SoftSkill sampleSkill;
    private UUID skillId;

    @BeforeEach
    void setUp() {
        sampleCategory = SkillCategory.builder()
                .id(UUID.randomUUID())
                .nameEn("SEO, Email")
                .namePl("SEO, E-mail")
                .displayOrder(1)
                .build();
        skillId = UUID.randomUUID();
        sampleSkill = SoftSkill.builder()
                .id(skillId)
                .nameEn("Copywriting")
                .namePl("Copywriting PL")
                .descriptionEn("Writing copy")
                .descriptionPl("Pisanie tekstów")
                .professionalUsageEn("Landing pages")
                .professionalUsagePl("Strony docelowe")
                .icon("pen")
                .displayOrder(1)
                .category(sampleCategory)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("getAllSoftSkills")
    class GetAllSoftSkills {

        @Test
        @DisplayName("should map every skill with localized fields and category name")
        void shouldMapLocalizedFields() {
            SoftSkill uncategorized = SoftSkill.builder()
                    .id(UUID.randomUUID())
                    .nameEn("Negotiation")
                    .namePl("Negocjacje")
                    .displayOrder(2)
                    .build();
            given(softSkillRepository.findAllByOrderByDisplayOrderAsc())
                    .willReturn(List.of(sampleSkill, uncategorized));

            List<SoftSkillDto> result = softSkillService.getAllSoftSkills("pl");

            assertThat(result).hasSize(2);
            SoftSkillDto first = result.get(0);
            assertThat(first.getName()).isEqualTo("Copywriting PL");
            assertThat(first.getDescription()).isEqualTo("Pisanie tekstów");
            assertThat(first.getProfessionalUsage()).isEqualTo("Strony docelowe");
            assertThat(first.getNameEn()).isEqualTo("Copywriting");
            assertThat(first.getCategoryId()).isEqualTo(sampleCategory.getId());
            assertThat(first.getCategoryName()).isEqualTo("SEO, E-mail");
            assertThat(result.get(1).getCategoryId()).isNull();
            assertThat(result.get(1).getCategoryName()).isNull();
        }
    }

    @Nested
    @DisplayName("getSoftSkillById")
    class GetSoftSkillById {

        @Test
        @DisplayName("should return skill when found")
        void shouldReturnSkillWhenFound() {
            given(softSkillRepository.findById(skillId)).willReturn(Optional.of(sampleSkill));

            SoftSkillDto result = softSkillService.getSoftSkillById(skillId, "en");

            assertThat(result.getId()).isEqualTo(skillId);
            assertThat(result.getName()).isEqualTo("Copywriting");
            assertThat(result.getCategoryName()).isEqualTo("SEO, Email");
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when not found")
        void shouldThrowWhenNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            given(softSkillRepository.findById(nonExistentId)).willReturn(Optional.empty());

            assertThatThrownBy(() -> softSkillService.getSoftSkillById(nonExistentId, "en"))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining(nonExistentId.toString());
        }
    }

    @Nested
    @DisplayName("createSoftSkill")
    class CreateSoftSkill {

        private SoftSkillCreateRequest request() {
            SoftSkillCreateRequest request = new SoftSkillCreateRequest();
            request.setNameEn("Storytelling");
            request.setNamePl("Opowiadanie historii");
            request.setIcon("book");
            return request;
        }

        @Test
        @DisplayName("should create skill in the given category")
        void shouldCreateSkillInCategory() {
            SoftSkillCreateRequest request = request();
            request.setCategoryId(sampleCategory.getId());
            request.setDisplayOrder(3);
            given(skillCategoryRepository.findById(sampleCategory.getId())).willReturn(Optional.of(sampleCategory));
            given(softSkillRepository.save(any(SoftSkill.class))).willAnswer(invocation -> invocation.getArgument(0));

            SoftSkillDto result = softSkillService.createSoftSkill(request, "en");

            verify(softSkillRepository).save(skillCaptor.capture());
            SoftSkill saved = skillCaptor.getValue();
            assertThat(saved.getNameEn()).isEqualTo("Storytelling");
            assertThat(saved.getNamePl()).isEqualTo("Opowiadanie historii");
            assertThat(saved.getIcon()).isEqualTo("book");
            assertThat(saved.getDisplayOrder()).isEqualTo(3);
            assertThat(saved.getCategory()).isSameAs(sampleCategory);
            assertThat(result.getCategoryName()).isEqualTo("SEO, Email");
            verify(softSkillRepository, never()).getMaxDisplayOrder();
        }

        @Test
        @DisplayName("should create uncategorized skill and auto-increment displayOrder")
        void shouldCreateUncategorizedSkillWithNextDisplayOrder() {
            given(softSkillRepository.getMaxDisplayOrder()).willReturn(5);
            given(softSkillRepository.save(any(SoftSkill.class))).willAnswer(invocation -> invocation.getArgument(0));

            softSkillService.createSoftSkill(request(), "en");

            verify(softSkillRepository).save(skillCaptor.capture());
            assertThat(skillCaptor.getValue().getDisplayOrder()).isEqualTo(6);
            assertThat(skillCaptor.getValue().getCategory()).isNull();
            verify(skillCategoryRepository, never()).findById(any());
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when category is unknown")
        void shouldThrowWhenCategoryUnknown() {
            UUID unknownCategoryId = UUID.randomUUID();
            SoftSkillCreateRequest request = request();
            request.setCategoryId(unknownCategoryId);
            given(skillCategoryRepository.findById(unknownCategoryId)).willReturn(Optional.empty());

            assertThatThrownBy(() -> softSkillService.createSoftSkill(request, "en"))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining(unknownCategoryId.toString());
            verify(softSkillRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("updateSoftSkill")
    class UpdateSoftSkill {

        @Test
        @DisplayName("should update provided fields and keep the null ones")
        void shouldUpdateProvidedFieldsOnly() {
            given(softSkillRepository.findById(skillId)).willReturn(Optional.of(sampleSkill));
            given(skillCategoryRepository.findById(sampleCategory.getId())).willReturn(Optional.of(sampleCategory));
            given(softSkillRepository.save(any(SoftSkill.class))).willAnswer(invocation -> invocation.getArgument(0));

            SoftSkillUpdateRequest request = new SoftSkillUpdateRequest();
            request.setNamePl("Nowa nazwa");
            request.setDisplayOrder(7);
            request.setCategoryId(sampleCategory.getId());

            softSkillService.updateSoftSkill(skillId, request, "en");

            verify(softSkillRepository).save(skillCaptor.capture());
            SoftSkill saved = skillCaptor.getValue();
            assertThat(saved.getNamePl()).isEqualTo("Nowa nazwa");
            assertThat(saved.getDisplayOrder()).isEqualTo(7);
            assertThat(saved.getNameEn()).isEqualTo("Copywriting");
            assertThat(saved.getDescriptionEn()).isEqualTo("Writing copy");
            assertThat(saved.getIcon()).isEqualTo("pen");
            assertThat(saved.getCategory()).isSameAs(sampleCategory);
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when skill not found")
        void shouldThrowWhenSkillNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            given(softSkillRepository.findById(nonExistentId)).willReturn(Optional.empty());

            assertThatThrownBy(() -> softSkillService.updateSoftSkill(nonExistentId, new SoftSkillUpdateRequest(), "en"))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining(nonExistentId.toString());
        }

        @Test
        @DisplayName("should clear the category when categoryId is null")
        void shouldClearCategoryWhenCategoryIdIsNull() {
            given(softSkillRepository.findById(skillId)).willReturn(Optional.of(sampleSkill));
            given(softSkillRepository.save(any(SoftSkill.class))).willAnswer(invocation -> invocation.getArgument(0));

            SoftSkillUpdateRequest request = new SoftSkillUpdateRequest();
            request.setNameEn("Copywriting");

            SoftSkillDto result = softSkillService.updateSoftSkill(skillId, request, "en");

            verify(softSkillRepository).save(skillCaptor.capture());
            assertThat(skillCaptor.getValue().getCategory()).isNull();
            assertThat(result.getCategoryId()).isNull();
            assertThat(result.getCategoryName()).isNull();
            verify(skillCategoryRepository, never()).findById(any());
        }

        @Test
        @DisplayName("should set the category when categoryId is known")
        void shouldSetCategoryWhenKnown() {
            SkillCategory other = SkillCategory.builder()
                    .id(UUID.randomUUID())
                    .nameEn("Social Media")
                    .namePl("Media społecznościowe")
                    .build();
            given(softSkillRepository.findById(skillId)).willReturn(Optional.of(sampleSkill));
            given(skillCategoryRepository.findById(other.getId())).willReturn(Optional.of(other));
            given(softSkillRepository.save(any(SoftSkill.class))).willAnswer(invocation -> invocation.getArgument(0));

            SoftSkillUpdateRequest request = new SoftSkillUpdateRequest();
            request.setCategoryId(other.getId());

            SoftSkillDto result = softSkillService.updateSoftSkill(skillId, request, "pl");

            verify(softSkillRepository).save(skillCaptor.capture());
            assertThat(skillCaptor.getValue().getCategory()).isSameAs(other);
            assertThat(result.getCategoryId()).isEqualTo(other.getId());
            assertThat(result.getCategoryName()).isEqualTo("Media społecznościowe");
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when categoryId is unknown")
        void shouldThrowWhenCategoryUnknown() {
            UUID unknownCategoryId = UUID.randomUUID();
            given(softSkillRepository.findById(skillId)).willReturn(Optional.of(sampleSkill));
            given(skillCategoryRepository.findById(unknownCategoryId)).willReturn(Optional.empty());

            SoftSkillUpdateRequest request = new SoftSkillUpdateRequest();
            request.setCategoryId(unknownCategoryId);

            assertThatThrownBy(() -> softSkillService.updateSoftSkill(skillId, request, "en"))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining(unknownCategoryId.toString());
            verify(softSkillRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("deleteSoftSkill")
    class DeleteSoftSkill {

        @Test
        @DisplayName("should delete skill when exists")
        void shouldDeleteSkill() {
            given(softSkillRepository.existsById(skillId)).willReturn(true);

            softSkillService.deleteSoftSkill(skillId);

            verify(softSkillRepository).deleteById(skillId);
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when not found")
        void shouldThrowWhenNotFound() {
            UUID nonExistentId = UUID.randomUUID();
            given(softSkillRepository.existsById(nonExistentId)).willReturn(false);

            assertThatThrownBy(() -> softSkillService.deleteSoftSkill(nonExistentId))
                    .isInstanceOf(EntityNotFoundException.class);
            verify(softSkillRepository, never()).deleteById(any());
        }
    }

    @Nested
    @DisplayName("reorderSoftSkills")
    class ReorderSoftSkills {

        @Test
        @DisplayName("should update displayOrder of every item")
        void shouldUpdateDisplayOrderOfEveryItem() {
            UUID secondId = UUID.randomUUID();
            ReorderRequest request = new ReorderRequest(List.of(
                    new ReorderRequest.OrderItem(skillId, 2),
                    new ReorderRequest.OrderItem(secondId, 1)));

            softSkillService.reorderSoftSkills(request);

            verify(softSkillRepository).updateDisplayOrder(skillId, 2);
            verify(softSkillRepository).updateDisplayOrder(secondId, 1);
            verifyNoMoreInteractions(softSkillRepository);
        }

        @Test
        @DisplayName("should silently ignore an unknown id (the UPDATE matches no row)")
        void shouldIgnoreUnknownId() {
            UUID unknownId = UUID.randomUUID();
            ReorderRequest request = new ReorderRequest(List.of(new ReorderRequest.OrderItem(unknownId, 1)));

            softSkillService.reorderSoftSkills(request);

            verify(softSkillRepository).updateDisplayOrder(unknownId, 1);
            verifyNoMoreInteractions(softSkillRepository);
        }
    }
}
