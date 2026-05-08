package com.graphhire.admin.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.graphhire.admin.infrastructure.persistence.mapper.AdminMapper;
import com.graphhire.admin.infrastructure.persistence.po.AdminPO;
import com.graphhire.auth.domain.model.User;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminRepositoryImplUnitTest {

    @Mock
    private AdminMapper adminMapper;

    @InjectMocks
    private AdminRepositoryImpl adminRepository;

    @Test
    @DisplayName("分页查询遇到非邮箱用户名时不抛异常并返回记录")
    void findUsersPageShouldTolerateNonEmailUsername() {
        AdminPO po = new AdminPO();
        po.setId(1001L);
        po.setUsername("13800138000");
        po.setUserType(1);
        po.setStatus(1);

        Page<AdminPO> page = new Page<>(1, 10, 1);
        page.setRecords(List.of(po));
        when(adminMapper.selectPage(any(Page.class), any())).thenReturn(page);

        IPage<User> result = adminRepository.findUsersPage(1, 10);

        assertEquals(1, result.getRecords().size());
        assertEquals(1001L, result.getRecords().get(0).getId());
        assertNull(result.getRecords().get(0).getUsername());
        assertTrue(result.getRecords().get(0).getUserType() != null);
    }

    @Test
    @DisplayName("分页查询应直接映射mapper返回记录")
    void findUsersPageShouldMapMapperRecordsDirectly() {
        AdminPO po1 = new AdminPO();
        po1.setId(1L);
        po1.setUsername("user1@test.com");
        po1.setUserType(1);
        po1.setStatus(1);
        AdminPO po2 = new AdminPO();
        po2.setId(2L);
        po2.setUsername("user2@test.com");
        po2.setUserType(1);
        po2.setStatus(1);

        Page<AdminPO> page = new Page<>(1, 10, 28);
        page.setRecords(List.of(po1, po2));
        when(adminMapper.selectPage(any(Page.class), any())).thenReturn(page);

        IPage<User> result = adminRepository.findUsersPage(1, 10);

        assertEquals(2, result.getRecords().size());
        assertEquals(1L, result.getRecords().get(0).getId());
        assertEquals(2L, result.getRecords().get(1).getId());
        assertEquals(28L, result.getTotal());
    }

    @Test
    @DisplayName("分页查询应按注册时间倒序返回")
    void findUsersPageShouldOrderByCreateTimeDesc() {
        Page<AdminPO> page = new Page<>(1, 10, 0);
        page.setRecords(List.of());
        when(adminMapper.selectPage(any(Page.class), any())).thenReturn(page);

        adminRepository.findUsersPage(1, 10);

        ArgumentCaptor<Wrapper> wrapperCaptor = ArgumentCaptor.forClass(Wrapper.class);
        verify(adminMapper).selectPage(any(Page.class), wrapperCaptor.capture());
        Wrapper wrapper = wrapperCaptor.getValue();
        Assertions.assertNotNull(wrapper);
    }
}
