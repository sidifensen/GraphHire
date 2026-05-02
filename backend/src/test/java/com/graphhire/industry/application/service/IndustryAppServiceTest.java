package com.graphhire.industry.application.service;

import com.graphhire.industry.domain.model.Industry;
import com.graphhire.industry.domain.repository.IndustryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IndustryAppServiceTest {

    @Mock
    private IndustryRepository industryRepository;

    @InjectMocks
    private IndustryAppService industryAppService;

    @Test
    @DisplayName("二级行业启用校验")
    void getEnabledIndustryByIdShouldRequireLeaf() {
        Industry parent = industry(1L, "父类", null, 1, 1, 0);
        when(industryRepository.findById(1L)).thenReturn(Optional.of(parent));

        assertThrows(RuntimeException.class, () -> industryAppService.getEnabledIndustryById(1L));
    }

    @Test
    @DisplayName("新增同级重名抛错")
    void createIndustryShouldRejectDuplicateSiblingName() {
        when(industryRepository.findById(10L)).thenReturn(Optional.of(industry(10L, "父类", null, 1, 1, 0)));
        when(industryRepository.findByNameAndParentId("子类A", 10L)).thenReturn(Optional.of(industry(20L, "子类A", 10L, 2, 1, 0)));

        assertThrows(RuntimeException.class, () -> industryAppService.createIndustry("子类A", 10L, 1, null));
    }

    @Test
    @DisplayName("父类删除级联软删子类")
    void deleteIndustryShouldSoftDeleteChildren() {
        Industry parent = industry(1L, "父类", null, 1, 1, 0);
        Industry child = industry(2L, "子类", 1L, 2, 1, 0);
        when(industryRepository.findById(1L)).thenReturn(Optional.of(parent));
        when(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT, "asc")).thenReturn(List.of(parent, child));

        industryAppService.deleteIndustry(1L);

        verify(industryRepository).softDeleteById(2L);
        verify(industryRepository).softDeleteById(1L);
    }

    @Test
    @DisplayName("同级移动只影响同级排序")
    void moveIndustryShouldReorderSiblings() {
        Industry a = industry(1L, "A", null, 1, 1, 0);
        Industry b = industry(2L, "B", null, 1, 1, 1);
        Industry c = industry(3L, "C", null, 1, 1, 2);
        Industry child = industry(4L, "child", 1L, 2, 1, 0);
        when(industryRepository.findById(2L)).thenReturn(Optional.of(b));
        when(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT, "asc")).thenReturn(List.of(a, b, c, child));
        when(industryRepository.save(any(Industry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Industry moved = industryAppService.moveIndustry(2L, "UP");

        assertEquals(2L, moved.getId());
        verify(industryRepository).save(a);
        verify(industryRepository).save(b);
        verify(industryRepository).save(c);
        verify(industryRepository, never()).save(child);
    }

    private Industry industry(Long id, String name, Long parentId, Integer level, Integer enabled, Integer sort) {
        Industry industry = new Industry();
        industry.setId(id);
        industry.setName(name);
        industry.setParentId(parentId);
        industry.setLevel(level);
        industry.setEnabled(enabled);
        industry.setSort(sort);
        industry.setDeleted(0);
        return industry;
    }
}
