package com.graphhire.resume.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.annotation.TableField;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.PersonInfoMapper;
import com.graphhire.resume.infrastructure.persistence.po.PersonInfoPO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
class PersonInfoRepositoryImplTest {

    @MockBean
    private PersonInfoMapper personInfoMapper;

    @Autowired
    private PersonInfoRepository personInfoRepository;

    @Nested
    @DisplayName("findByUserId 测试")
    class FindByUserIdTests {

        @Test
        @DisplayName("根据用户ID查找返回正确的人员信息")
        void findByUserId_ReturnsCorrectPersonInfo() {
            Long userId = 123L;
            PersonInfoPO po = createPersonInfoPO(userId);
            when(personInfoMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(po);

            Optional<PersonInfo> result = personInfoRepository.findByUserId(userId);

            assertTrue(result.isPresent());
            assertEquals(userId, result.get().getUserId());
            assertEquals("张三", result.get().getRealName());
            assertEquals(1, result.get().getGender());
            assertEquals(28, result.get().getAge());
            assertEquals("13800138000", result.get().getPhone());
            assertEquals("本科", result.get().getEducation());
            assertEquals("北京", result.get().getCity());
            assertEquals("上海", result.get().getTargetCity());
            assertEquals(20000, result.get().getExpectedSalary());
        }

        @Test
        @DisplayName("根据不存在的用户ID查找返回空")
        void findByUserId_ReturnsEmpty_WhenNotFound() {
            Long userId = 999L;
            when(personInfoMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

            Optional<PersonInfo> result = personInfoRepository.findByUserId(userId);

            assertFalse(result.isPresent());
        }
    }

    @Nested
    @DisplayName("save 测试")
    class SaveTests {

        @Test
        @DisplayName("保存新的人员信息")
        void save_NewPersonInfo_InsertsSuccessfully() {
            PersonInfo personInfo = createPersonInfo(null);
            PersonInfoPO po = createPersonInfoPO(123L);
            when(personInfoMapper.insert(any(PersonInfoPO.class))).thenReturn(1);
            when(personInfoMapper.selectById(any())).thenReturn(po);

            PersonInfo result = personInfoRepository.save(personInfo);

            assertNotNull(result);
            verify(personInfoMapper, times(1)).insert(any(PersonInfoPO.class));
        }

        @Test
        @DisplayName("更新已有的人员信息")
        void save_ExistingPersonInfo_UpdatesSuccessfully() {
            PersonInfo personInfo = createPersonInfo(1L);
            PersonInfoPO po = createPersonInfoPO(123L);
            po.setId(1L);
            when(personInfoMapper.update(any(), any())).thenReturn(1);

            PersonInfo result = personInfoRepository.save(personInfo);

            assertNotNull(result);
            verify(personInfoMapper, times(1)).update(any(), any());
        }
    }

    @Test
    @DisplayName("expectedSalary 字段必须映射到 expected_salary 列")
    void expectedSalary_ShouldMapToDatabaseColumn() throws NoSuchFieldException {
        TableField tableField = PersonInfoPO.class.getDeclaredField("expectedSalary").getAnnotation(TableField.class);
        assertNotNull(tableField);
        assertEquals("expected_salary", tableField.value());
        assertTrue(tableField.exist());
    }

    private PersonInfo createPersonInfo(Long id) {
        PersonInfo personInfo = new PersonInfo();
        personInfo.setId(id);
        personInfo.setUserId(123L);
        personInfo.setRealName("张三");
        personInfo.setGender(1);
        personInfo.setAge(28);
        personInfo.setPhone("13800138000");
        personInfo.setEducation("本科");
        personInfo.setCity("北京");
        personInfo.setTargetCity("上海");
        personInfo.setExpectedSalary(20000);
        return personInfo;
    }

    private PersonInfoPO createPersonInfoPO(Long userId) {
        PersonInfoPO po = new PersonInfoPO();
        po.setId(1L);
        po.setUserId(userId);
        po.setRealName("张三");
        po.setGender(1);
        po.setAge(28);
        po.setPhone("13800138000");
        po.setEducation("本科");
        po.setCity("北京");
        po.setTargetCity("上海");
        po.setExpectedSalary(20000);
        return po;
    }
}
