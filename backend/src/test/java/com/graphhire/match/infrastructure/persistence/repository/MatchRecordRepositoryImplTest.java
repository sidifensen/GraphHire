package com.graphhire.match.infrastructure.persistence.repository;

import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.match.infrastructure.persistence.mapper.MatchRecordMapper;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchRecordRepositoryImplTest {

    @Mock
    private MatchRecordMapper matchRecordMapper;

    @InjectMocks
    private MatchRecordRepositoryImpl repository;

    private MatchRecordPO samplePO;

    @BeforeEach
    void setUp() {
        samplePO = new MatchRecordPO();
        samplePO.setId(1L);
        samplePO.setResumeId(10L);
        samplePO.setJobId(20L);
        samplePO.setOverallScore(new BigDecimal("86.80"));
        samplePO.setSkillScore(new BigDecimal("92.00"));
        samplePO.setRequirementScore(new BigDecimal("79.00"));
    }

    @Test
    @DisplayName("findById should map compact score fields")
    void findById_ShouldMapCompactScores() {
        when(matchRecordMapper.selectById(1L)).thenReturn(samplePO);

        Optional<MatchRecord> result = repository.findById(1L);

        assertTrue(result.isPresent());
        assertEquals(92.0, result.get().getScore().getSkillScore());
        assertEquals(79.0, result.get().getScore().getRequirementScore());
    }

    @Test
    @DisplayName("save insert should write overall+skill+requirement")
    void saveInsert_ShouldWriteCompactScores() {
        MatchRecord record = MatchRecord.create(10L, 20L, MatchScore.of(90.0, 80.0));
        record.setMatchDirection(1);

        repository.save(record);

        verify(matchRecordMapper).upsertScores(
            eq(10L),
            eq(20L),
            eq(1),
            any(BigDecimal.class),
            eq(BigDecimal.valueOf(90.0)),
            eq(BigDecimal.valueOf(80.0))
        );
    }

    @Test
    @DisplayName("save update should write overall+skill+requirement")
    void saveUpdate_ShouldWriteCompactScores() {
        MatchRecord record = MatchRecord.create(10L, 20L, MatchScore.of(88.0, 75.0));
        record.setId(1L);
        record.setMatchDirection(1);

        repository.save(record);

        ArgumentCaptor<BigDecimal> overall = ArgumentCaptor.forClass(BigDecimal.class);
        verify(matchRecordMapper).updateScores(
            eq(1L),
            eq(1),
            overall.capture(),
            eq(BigDecimal.valueOf(88.0)),
            eq(BigDecimal.valueOf(75.0))
        );
        assertEquals(82.8, overall.getValue().doubleValue(), 0.001);
    }
}
