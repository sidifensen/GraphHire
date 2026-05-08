package com.graphhire.resume.infrastructure.persistence.repository;

import com.graphhire.resume.domain.model.UploadTask;
import com.graphhire.resume.domain.repository.UploadTaskRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.UploadTaskMapper;
import com.graphhire.resume.infrastructure.persistence.po.UploadTaskPO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;

@SpringBootTest
class UploadTaskRepositoryImplTest {

    @MockBean
    private UploadTaskMapper uploadTaskMapper;

    @MockBean
    private JavaMailSender javaMailSender;

    @Autowired
    private UploadTaskRepository uploadTaskRepository;

    @Test
    @DisplayName("save 新增时应回填主键并可查询")
    void saveAndFindById_shouldWork() {
        doAnswer(invocation -> {
            UploadTaskPO po = invocation.getArgument(0);
            po.setId(777L);
            return 1;
        }).when(uploadTaskMapper).insert(any(UploadTaskPO.class));
        when(uploadTaskMapper.selectById(777L)).thenAnswer(invocation -> {
            UploadTaskPO po = new UploadTaskPO();
            po.setId(777L);
            po.setUserId(100L);
            po.setFileName("resume.pdf");
            po.setFileType("application/pdf");
            po.setFileSize(1024L);
            po.setStatus(UploadTask.TaskStatus.PENDING.ordinal());
            po.setRefreshAllMatches(1);
            return po;
        });

        UploadTask task = new UploadTask();
        task.setUserId(100L);
        task.setFileName("resume.pdf");
        task.setFileType("application/pdf");
        task.setFileSize(1024L);
        task.setStatus(UploadTask.TaskStatus.PENDING);
        task.setRefreshAllMatches(true);

        UploadTask saved = uploadTaskRepository.save(task);
        assertEquals(777L, saved.getId());

        Optional<UploadTask> found = uploadTaskRepository.findById(777L);
        assertTrue(found.isPresent());
        assertEquals(UploadTask.TaskStatus.PENDING, found.get().getStatus());
        assertEquals("resume.pdf", found.get().getFileName());
    }
}
