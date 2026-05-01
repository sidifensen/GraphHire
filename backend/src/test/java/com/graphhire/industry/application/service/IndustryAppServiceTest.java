package com.graphhire.industry.application.service;

import com.graphhire.industry.domain.model.Industry;
import com.graphhire.industry.domain.repository.IndustryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IndustryAppServiceTest {

    @Mock
    private IndustryRepository industryRepository;

    @InjectMocks
    private IndustryAppService industryAppService;

    @Test
    @DisplayName("上移后顺序连续且目标前移")
    void moveUpShouldNormalizeSortOrder() {
        Industry a = industry(1L, "A", 0);
        Industry b = industry(2L, "B", 10);
        Industry c = industry(3L, "C", 20);
        when(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT_ORDER, "asc")).thenReturn(List.of(a, b, c));
        when(industryRepository.save(org.mockito.ArgumentMatchers.any(Industry.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        Industry moved = industryAppService.moveIndustry(2L, "UP");

        assertEquals(2L, moved.getId());
        assertEquals(0, moved.getSortOrder());
        ArgumentCaptor<Industry> captor = ArgumentCaptor.forClass(Industry.class);
        verify(industryRepository, atLeast(3)).save(captor.capture());
        List<Industry> saved = captor.getAllValues();
        assertEquals(0, saved.get(0).getSortOrder());
        assertEquals(1, saved.get(1).getSortOrder());
        assertEquals(2, saved.get(2).getSortOrder());
    }

    @Test
    @DisplayName("下移后顺序连续且目标后移")
    void moveDownShouldNormalizeSortOrder() {
        Industry a = industry(1L, "A", 0);
        Industry b = industry(2L, "B", 10);
        Industry c = industry(3L, "C", 20);
        when(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT_ORDER, "asc")).thenReturn(List.of(a, b, c));
        when(industryRepository.save(org.mockito.ArgumentMatchers.any(Industry.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        Industry moved = industryAppService.moveIndustry(2L, "DOWN");

        assertEquals(2L, moved.getId());
        assertEquals(2, moved.getSortOrder());
        ArgumentCaptor<Industry> captor = ArgumentCaptor.forClass(Industry.class);
        verify(industryRepository, atLeast(3)).save(captor.capture());
        List<Industry> saved = captor.getAllValues();
        assertEquals(0, saved.get(0).getSortOrder());
        assertEquals(1, saved.get(1).getSortOrder());
        assertEquals(2, saved.get(2).getSortOrder());
    }

    @Test
    @DisplayName("边界上移不越界")
    void moveUpOnFirstShouldKeepPosition() {
        Industry a = industry(1L, "A", 0);
        Industry b = industry(2L, "B", 10);
        when(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT_ORDER, "asc")).thenReturn(List.of(a, b));
        when(industryRepository.save(org.mockito.ArgumentMatchers.any(Industry.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        Industry moved = industryAppService.moveIndustry(1L, "UP");

        assertEquals(1L, moved.getId());
        assertEquals(0, moved.getSortOrder());
    }

    @Test
    @DisplayName("查询时会自动把十位步长归一为连续值")
    void listShouldNormalizeSortOrder() {
        Industry a = industry(1L, "A", 0);
        Industry b = industry(2L, "B", 10);
        Industry c = industry(3L, "C", 20);
        when(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT_ORDER, "asc"))
            .thenReturn(List.of(a, b, c))
            .thenReturn(List.of(a, b, c));
        when(industryRepository.save(org.mockito.ArgumentMatchers.any(Industry.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        List<Industry> result = industryAppService.listIndustries(null, IndustryRepository.SORT_BY_SORT_ORDER, "asc");

        assertEquals(3, result.size());
        assertEquals(0, result.get(0).getSortOrder());
        assertEquals(1, result.get(1).getSortOrder());
        assertEquals(2, result.get(2).getSortOrder());
        verify(industryRepository, times(3)).save(org.mockito.ArgumentMatchers.any(Industry.class));
    }

    private Industry industry(Long id, String name, Integer sortOrder) {
        Industry industry = new Industry();
        industry.setId(id);
        industry.setName(name);
        industry.setEnabled(1);
        industry.setSortOrder(sortOrder);
        return industry;
    }
}
