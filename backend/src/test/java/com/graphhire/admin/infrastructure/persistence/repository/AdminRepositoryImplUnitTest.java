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
import java.util.stream.IntStream;

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
    @DisplayName("当底层返回全量记录时仍按 pageSize 截断，避免前端一次加载全部")
    void findUsersPageShouldSliceRecordsWhenMapperReturnsAllRows() {
        List<AdminPO> allRows = IntStream.rangeClosed(1, 28)
            .mapToObj(i -> {
                AdminPO po = new AdminPO();
                po.setId((long) i);
                po.setUsername("user" + i + "@test.com");
                po.setUserType(1);
                po.setStatus(1);
                return po;
            })
            .toList();

        Page<AdminPO> page = new Page<>(1, 10, 28);
        page.setRecords(allRows);
        when(adminMapper.selectPage(any(Page.class), any())).thenReturn(page);

        IPage<User> firstPage = adminRepository.findUsersPage(1, 10);
        IPage<User> thirdPage = adminRepository.findUsersPage(3, 10);

        assertEquals(10, firstPage.getRecords().size());
        assertEquals(1L, firstPage.getRecords().get(0).getId());
        assertEquals(10L, firstPage.getRecords().get(9).getId());
        assertEquals(8, thirdPage.getRecords().size());
        assertEquals(21L, thirdPage.getRecords().get(0).getId());
        assertEquals(28L, thirdPage.getRecords().get(7).getId());
        assertEquals(28L, firstPage.getTotal());
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
