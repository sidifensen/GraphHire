package com.graphhire.admin.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.graphhire.admin.infrastructure.persistence.mapper.AdminMapper;
import com.graphhire.admin.infrastructure.persistence.po.AdminPO;
import com.graphhire.auth.domain.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
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
        when(adminMapper.selectPage(any(Page.class), isNull())).thenReturn(page);

        IPage<User> result = adminRepository.findUsersPage(1, 10);

        assertEquals(1, result.getRecords().size());
        assertEquals(1001L, result.getRecords().get(0).getId());
        assertNull(result.getRecords().get(0).getUsername());
        assertTrue(result.getRecords().get(0).getUserType() != null);
    }
}
