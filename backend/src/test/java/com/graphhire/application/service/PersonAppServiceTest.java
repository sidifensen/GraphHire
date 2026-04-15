package com.graphhire.application.service;

import com.graphhire.application.command.UpdateProfileCmd;
import com.graphhire.application.dto.PageResult;
import com.graphhire.application.dto.PersonProfileResponse;
import com.graphhire.application.dto.ResumeDetailResponse;
import com.graphhire.domain.model.Person;
import com.graphhire.domain.model.Resume;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.PersonRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.repository.UserRepository;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PersonAppServiceTest {

    @Mock
    private PersonRepository personRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @InjectMocks
    private PersonAppService personAppService;

    @Nested
    @DisplayName("获取个人信息测试")
    class GetProfileTests {

        @Test
        @DisplayName("成功获取个人信息")
        void getProfile_Success() {
            // Given
            Long userId = 1L;
            User user = User.builder()
                    .id(userId)
                    .username("testuser")
                    .email("test@example.com")
                    .build();
            Person person = Person.builder()
                    .id(1L)
                    .userId(userId)
                    .realName("张三")
                    .gender(1)
                    .age(28)
                    .phone("13800138000")
                    .education("本科")
                    .city("北京")
                    .targetCity("北京")
                    .expectedSalary(25000)
                    .build();

            when(personRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(person));
            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.of(user));

            // When
            PersonProfileResponse response = personAppService.getProfile(userId);

            // Then
            assertNotNull(response);
            assertEquals(1L, response.getId());
            assertEquals("testuser", response.getUsername());
            assertEquals("张三", response.getRealName());
            assertEquals(1, response.getGender());
            assertEquals(28, response.getAge());
        }

        @Test
        @DisplayName("个人信息不存在时抛出异常")
        void getProfile_NotFound_ThrowsException() {
            // Given
            Long userId = 999L;
            when(personRepository.findByUserIdOptional(userId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> personAppService.getProfile(userId));
            assertEquals("个人信息不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("更新个人信息测试")
    class UpdateProfileTests {

        @Test
        @DisplayName("成功更新个人信息")
        void updateProfile_Success() {
            // Given
            Long userId = 1L;
            UpdateProfileCmd cmd = new UpdateProfileCmd();
            cmd.setRealName("李四");
            cmd.setGender(2);
            cmd.setAge(30);
            cmd.setPhone("13900139000");
            cmd.setEducation("硕士");
            cmd.setCity("上海");
            cmd.setTargetCity("深圳");
            cmd.setExpectedSalary(30000);

            Person person = Person.builder()
                    .id(1L)
                    .userId(userId)
                    .realName("张三")
                    .gender(1)
                    .age(28)
                    .build();

            when(personRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(person));
            when(personRepository.save(any(Person.class))).thenReturn(person);

            // When
            personAppService.updateProfile(userId, cmd);

            // Then
            ArgumentCaptor<Person> personCaptor = ArgumentCaptor.forClass(Person.class);
            verify(personRepository).save(personCaptor.capture());
            Person savedPerson = personCaptor.getValue();
            assertEquals("李四", savedPerson.getRealName());
            assertEquals(2, savedPerson.getGender());
            assertEquals(30, savedPerson.getAge());
            assertEquals("13900139000", savedPerson.getPhone());
        }

        @Test
        @DisplayName("部分字段更新成功")
        void updateProfile_PartialUpdate_Success() {
            // Given
            Long userId = 1L;
            UpdateProfileCmd cmd = new UpdateProfileCmd();
            cmd.setRealName("王五");
            // Only update realName, other fields are null

            Person person = Person.builder()
                    .id(1L)
                    .userId(userId)
                    .realName("张三")
                    .gender(1)
                    .age(28)
                    .build();

            when(personRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(person));
            when(personRepository.save(any(Person.class))).thenReturn(person);

            // When
            personAppService.updateProfile(userId, cmd);

            // Then
            ArgumentCaptor<Person> personCaptor = ArgumentCaptor.forClass(Person.class);
            verify(personRepository).save(personCaptor.capture());
            Person savedPerson = personCaptor.getValue();
            assertEquals("王五", savedPerson.getRealName());
            assertEquals(1, savedPerson.getGender()); // Unchanged
            assertEquals(28, savedPerson.getAge()); // Unchanged
        }
    }

    @Nested
    @DisplayName("简历列表测试")
    class ListResumesTests {

        @Test
        @DisplayName("分页查询简历列表成功")
        void listResumes_Success() {
            // Given
            Long userId = 1L;
            Integer page = 1;
            Integer pageSize = 10;
            List<Resume> resumes = Arrays.asList(
                    Resume.builder().id(1L).fileName("resume1.pdf").build(),
                    Resume.builder().id(2L).fileName("resume2.pdf").build()
            );

            when(resumeRepository.findByUserId(userId, page, pageSize)).thenReturn(resumes);
            when(resumeRepository.countByUserId(userId)).thenReturn(2);

            // When
            PageResult<Resume> result = personAppService.listResumes(userId, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(2, result.getRecords().size());
            assertEquals(2L, result.getTotal());
        }
    }

    @Nested
    @DisplayName("简历详情测试")
    class GetResumeDetailTests {

        @Test
        @DisplayName("成功获取简历详情")
        void getResumeDetail_Success() {
            // Given
            Long resumeId = 1L;
            Resume resume = Resume.builder()
                    .id(resumeId)
                    .fileName("resume.pdf")
                    .fileType("pdf")
                    .parseStatus(com.graphhire.domain.vo.ParseStatus.SUCCESS)
                    .parseResult("{\"name\": \"张三\"}")
                    .confidence(BigDecimal.valueOf(0.95))
                    .isDefault(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            when(resumeRepository.findByIdOptional(resumeId)).thenReturn(Optional.of(resume));

            // When
            ResumeDetailResponse response = personAppService.getResumeDetail(resumeId);

            // Then
            assertNotNull(response);
            assertEquals(resumeId, response.getId());
            assertEquals("resume.pdf", response.getFileName());
            assertEquals(com.graphhire.domain.vo.ParseStatus.SUCCESS, response.getParseStatus());
            assertTrue(response.getIsDefault());
        }

        @Test
        @DisplayName("简历不存在时抛出异常")
        void getResumeDetail_NotFound_ThrowsException() {
            // Given
            Long resumeId = 999L;
            when(resumeRepository.findByIdOptional(resumeId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> personAppService.getResumeDetail(resumeId));
            assertEquals("简历不存在", exception.getMessage());
        }
    }
}
