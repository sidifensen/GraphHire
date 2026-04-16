package com.graphhire.match.infrastructure.persistence.repository;

import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.match.infrastructure.persistence.mapper.MatchRecordMapper;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchRecordRepositoryImplTest {

    @Mock
    private MatchRecordMapper matchRecordMapper;

    @InjectMocks
    private MatchRecordRepositoryImpl repository;

    private MatchRecordPO samplePO;
    private MatchRecord sampleRecord;

    @BeforeEach
    void setUp() {
        samplePO = new MatchRecordPO();
        samplePO.setId(1L);
        samplePO.setResumeId(10L);
        samplePO.setJobId(20L);
        samplePO.setOverallScore(new BigDecimal("85.50"));
        samplePO.setSkillScore(new BigDecimal("90.00"));
        samplePO.setExperienceScore(new BigDecimal("85.00"));
        samplePO.setCityScore(new BigDecimal("80.00"));
        samplePO.setEducationScore(new BigDecimal("75.00"));
        samplePO.setSalaryScore(new BigDecimal("95.00"));
        samplePO.setMatchReport("{\"skills\": [\"Java\", \"Python\"]}");
        samplePO.setStatus(0);
        samplePO.setCreateTime(LocalDateTime.of(2026, 4, 15, 10, 30, 0));

        sampleRecord = new MatchRecord();
        sampleRecord.setId(1L);
        sampleRecord.setResumeId(10L);
        sampleRecord.setJobId(20L);
        sampleRecord.setScore(MatchScore.of(90.0, 85.0, 80.0, 75.0, 95.0));
        sampleRecord.setMatchReason("{\"skills\": [\"Java\", \"Python\"]}");
        sampleRecord.setIsRead(false);
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("should return domain object when PO exists")
        void findById_Exists() {
            when(matchRecordMapper.selectById(1L)).thenReturn(samplePO);

            Optional<MatchRecord> result = repository.findById(1L);

            assertTrue(result.isPresent());
            MatchRecord record = result.get();
            assertEquals(1L, record.getId());
            assertEquals(10L, record.getResumeId());
            assertEquals(20L, record.getJobId());
            assertNotNull(record.getScore());
            assertEquals(90.0, record.getScore().getSkillScore());
            assertEquals(85.0, record.getScore().getExpScore());
            assertEquals(80.0, record.getScore().getCityScore());
            assertEquals(75.0, record.getScore().getEduScore());
            assertEquals(95.0, record.getScore().getSalScore());
            assertEquals("{\"skills\": [\"Java\", \"Python\"]}", record.getMatchReason());
            assertFalse(record.getIsRead());
        }

        @Test
        @DisplayName("should return empty when PO does not exist")
        void findById_NotExists() {
            when(matchRecordMapper.selectById(999L)).thenReturn(null);

            Optional<MatchRecord> result = repository.findById(999L);

            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("findByResumeId")
    class FindByResumeIdTests {

        @Test
        @DisplayName("should return domain objects for resume")
        void findByResumeId_Success() {
            when(matchRecordMapper.selectList(any())).thenReturn(Arrays.asList(samplePO));

            List<MatchRecord> results = repository.findByResumeId(10L);

            assertEquals(1, results.size());
            assertEquals(10L, results.get(0).getResumeId());
            verify(matchRecordMapper).selectList(any());
        }

        @Test
        @DisplayName("should return empty list when no records")
        void findByResumeId_Empty() {
            when(matchRecordMapper.selectList(any())).thenReturn(Arrays.asList());

            List<MatchRecord> results = repository.findByResumeId(999L);

            assertTrue(results.isEmpty());
        }
    }

    @Nested
    @DisplayName("findByJobId")
    class FindByJobIdTests {

        @Test
        @DisplayName("should return domain objects for job")
        void findByJobId_Success() {
            when(matchRecordMapper.selectList(any())).thenReturn(Arrays.asList(samplePO));

            List<MatchRecord> results = repository.findByJobId(20L);

            assertEquals(1, results.size());
            assertEquals(20L, results.get(0).getJobId());
        }
    }

    @Nested
    @DisplayName("save")
    class SaveTests {

        @Test
        @DisplayName("should insert when id is null")
        void save_Insert() {
            sampleRecord.setId(null);
            when(matchRecordMapper.insert(any(MatchRecordPO.class))).thenReturn(1);

            MatchRecord result = repository.save(sampleRecord);

            assertNotNull(result);
            verify(matchRecordMapper).insert(any(MatchRecordPO.class));
            verify(matchRecordMapper, never()).updateById(any(MatchRecordPO.class));
        }

        @Test
        @DisplayName("should update when id is not null")
        void save_Update() {
            when(matchRecordMapper.updateById(any(MatchRecordPO.class))).thenReturn(1);

            MatchRecord result = repository.save(sampleRecord);

            assertNotNull(result);
            verify(matchRecordMapper).updateById(any(MatchRecordPO.class));
            verify(matchRecordMapper, never()).insert(any(MatchRecordPO.class));
        }

        @Test
        @DisplayName("should correctly map all fields to PO on save")
        void save_MapsAllFieldsCorrectly() {
            ArgumentCaptor<MatchRecordPO> poCaptor = ArgumentCaptor.forClass(MatchRecordPO.class);
            when(matchRecordMapper.updateById(any(MatchRecordPO.class))).thenReturn(1);

            repository.save(sampleRecord);

            verify(matchRecordMapper).updateById(poCaptor.capture());
            MatchRecordPO captured = poCaptor.getValue();
            assertEquals(1L, captured.getId());
            assertEquals(10L, captured.getResumeId());
            assertEquals(20L, captured.getJobId());
            assertEquals("{\"skills\": [\"Java\", \"Python\"]}", captured.getMatchReport());
            assertEquals(0, captured.getStatus());
            assertNotNull(captured.getOverallScore());
            assertEquals(90.0, captured.getSkillScore().doubleValue());
            assertEquals(85.0, captured.getExperienceScore().doubleValue());
            assertEquals(80.0, captured.getCityScore().doubleValue());
            assertEquals(75.0, captured.getEducationScore().doubleValue());
            assertEquals(95.0, captured.getSalaryScore().doubleValue());
        }
    }

    @Nested
    @DisplayName("delete")
    class DeleteTests {

        @Test
        @DisplayName("should delete by id")
        void delete_Success() {
            when(matchRecordMapper.deleteById(1L)).thenReturn(1);

            repository.delete(sampleRecord);

            verify(matchRecordMapper).deleteById(1L);
        }
    }

    @Nested
    @DisplayName("toDomain mapping")
    class ToDomainMappingTests {

        @Test
        @DisplayName("should map status 1 to isRead true")
        void toDomain_Status1_IsReadTrue() {
            samplePO.setStatus(1);
            when(matchRecordMapper.selectById(1L)).thenReturn(samplePO);

            Optional<MatchRecord> result = repository.findById(1L);

            assertTrue(result.get().getIsRead());
        }

        @Test
        @DisplayName("should map status 0 to isRead false")
        void toDomain_Status0_IsReadFalse() {
            samplePO.setStatus(0);
            when(matchRecordMapper.selectById(1L)).thenReturn(samplePO);

            Optional<MatchRecord> result = repository.findById(1L);

            assertFalse(result.get().getIsRead());
        }

        @Test
        @DisplayName("should handle null scores gracefully")
        void toDomain_NullScores() {
            samplePO.setSkillScore(null);
            samplePO.setExperienceScore(null);
            samplePO.setCityScore(null);
            samplePO.setEducationScore(null);
            samplePO.setSalaryScore(null);
            when(matchRecordMapper.selectById(1L)).thenReturn(samplePO);

            Optional<MatchRecord> result = repository.findById(1L);

            assertNotNull(result.get().getScore());
        }
    }

    @Nested
    @DisplayName("toPO mapping")
    class ToPOMappingTests {

        @Test
        @DisplayName("should map isRead true to status 1")
        void toPO_IsReadTrue_Status1() {
            sampleRecord.setIsRead(true);

            repository.save(sampleRecord);

            ArgumentCaptor<MatchRecordPO> poCaptor = ArgumentCaptor.forClass(MatchRecordPO.class);
            verify(matchRecordMapper).updateById(poCaptor.capture());
            assertEquals(1, poCaptor.getValue().getStatus());
        }

        @Test
        @DisplayName("should map isRead false to status 0")
        void toPO_IsReadFalse_Status0() {
            sampleRecord.setIsRead(false);

            repository.save(sampleRecord);

            ArgumentCaptor<MatchRecordPO> poCaptor = ArgumentCaptor.forClass(MatchRecordPO.class);
            verify(matchRecordMapper).updateById(poCaptor.capture());
            assertEquals(0, poCaptor.getValue().getStatus());
        }
    }
}
