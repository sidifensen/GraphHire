package com.graphhire.resume.infrastructure.mq;

import com.graphhire.resume.application.service.GraphBuildService;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResumeDefaultChangedMQConsumerTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private GraphBuildService graphBuildService;

    private ResumeDefaultChangedMQConsumer consumer;

    @BeforeEach
    void setUp() throws Exception {
        consumer = new ResumeDefaultChangedMQConsumer();
        setField(consumer, "resumeRepository", resumeRepository);
        setField(consumer, "graphBuildService", graphBuildService);
    }

    @Test
    void onMessage_shouldBuildGraphWhenResumeExists() {
        Resume resume = new Resume();
        resume.setId(88L);
        resume.setUserId(5L);
        when(resumeRepository.findById(88L)).thenReturn(Optional.of(resume));

        consumer.onMessage("88");

        verify(graphBuildService).buildGraphForResume(resume);
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(target, value);
    }
}
