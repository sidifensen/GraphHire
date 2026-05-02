package com.graphhire.positiontype.application.service;

import com.graphhire.positiontype.domain.model.PositionType;
import com.graphhire.positiontype.domain.repository.PositionTypeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PositionTypeAppServiceTest {

    @Mock
    private PositionTypeRepository positionTypeRepository;

    @InjectMocks
    private PositionTypeAppService positionTypeAppService;

    @Test
    @DisplayName("三级节点下新增子节点应失败")
    void createShouldFailWhenParentIsLevelThree() {
        PositionType parent = node(3L, "Java", 2L, 3, 1, 0);
        when(positionTypeRepository.findById(3L)).thenReturn(Optional.of(parent));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> positionTypeAppService.createPositionType("Java高级", 3L, 1));

        assertEquals("仅支持三级分类", ex.getMessage());
    }

    @Test
    @DisplayName("同级重名新增应失败")
    void createShouldFailWhenSiblingNameDuplicated() {
        PositionType parent = node(10L, "后端开发", 1L, 2, 1, 0);
        PositionType sibling = node(11L, "Java", 10L, 3, 1, 0);
        when(positionTypeRepository.findById(10L)).thenReturn(Optional.of(parent));
        when(positionTypeRepository.findAllNotDeletedOrdered()).thenReturn(List.of(parent, sibling));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> positionTypeAppService.createPositionType("Java", 10L, 1));

        assertEquals("同级职位类型名称已存在", ex.getMessage());
    }

    @Test
    @DisplayName("同级上移应交换排序并连续化")
    void moveShouldSwapSiblingSortOrder() {
        PositionType a = node(100L, "A", 1L, 2, 1, 0);
        PositionType b = node(101L, "B", 1L, 2, 1, 1);
        PositionType c = node(102L, "C", 1L, 2, 1, 2);
        when(positionTypeRepository.findAllNotDeletedOrdered()).thenReturn(List.of(a, b, c));
        when(positionTypeRepository.findById(101L)).thenReturn(Optional.of(b));
        when(positionTypeRepository.save(any(PositionType.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PositionType moved = positionTypeAppService.movePositionType(101L, "UP");

        assertEquals(101L, moved.getId());
        ArgumentCaptor<PositionType> captor = ArgumentCaptor.forClass(PositionType.class);
        verify(positionTypeRepository, atLeast(3)).save(captor.capture());
        List<PositionType> saved = captor.getAllValues();
        PositionType savedA = saved.stream().filter(item -> item.getId().equals(100L)).reduce((first, second) -> second).orElseThrow();
        PositionType savedB = saved.stream().filter(item -> item.getId().equals(101L)).reduce((first, second) -> second).orElseThrow();
        assertEquals(1, savedA.getSortNo());
        assertEquals(0, savedB.getSortNo());
    }

    @Test
    @DisplayName("停用父节点应级联停用后代")
    void disableShouldCascadeToChildren() {
        PositionType root = node(1L, "技术", null, 1, 1, 0);
        PositionType child = node(2L, "后端", 1L, 2, 1, 0);
        PositionType leaf = node(3L, "Java", 2L, 3, 1, 0);
        when(positionTypeRepository.findById(1L)).thenReturn(Optional.of(root));
        when(positionTypeRepository.findAllNotDeletedOrdered()).thenReturn(List.of(root, child, leaf));
        when(positionTypeRepository.save(any(PositionType.class))).thenAnswer(invocation -> invocation.getArgument(0));

        positionTypeAppService.updatePositionTypeStatus(1L, 0);

        ArgumentCaptor<PositionType> captor = ArgumentCaptor.forClass(PositionType.class);
        verify(positionTypeRepository, atLeast(3)).save(captor.capture());
        List<PositionType> saved = captor.getAllValues();
        PositionType savedRoot = saved.stream().filter(item -> item.getId().equals(1L)).reduce((first, second) -> second).orElseThrow();
        PositionType savedChild = saved.stream().filter(item -> item.getId().equals(2L)).reduce((first, second) -> second).orElseThrow();
        PositionType savedLeaf = saved.stream().filter(item -> item.getId().equals(3L)).reduce((first, second) -> second).orElseThrow();
        assertEquals(0, savedRoot.getStatus());
        assertEquals(0, savedChild.getStatus());
        assertEquals(0, savedLeaf.getStatus());
    }

    @Test
    @DisplayName("启用子节点应自动启用祖先")
    void enableShouldAlsoEnableAncestors() {
        PositionType root = node(1L, "技术", null, 1, 0, 0);
        PositionType child = node(2L, "后端", 1L, 2, 0, 0);
        PositionType leaf = node(3L, "Java", 2L, 3, 0, 0);
        when(positionTypeRepository.findById(3L)).thenReturn(Optional.of(leaf));
        when(positionTypeRepository.findAllNotDeletedOrdered()).thenReturn(List.of(root, child, leaf));
        when(positionTypeRepository.save(any(PositionType.class))).thenAnswer(invocation -> invocation.getArgument(0));

        positionTypeAppService.updatePositionTypeStatus(3L, 1);

        ArgumentCaptor<PositionType> captor = ArgumentCaptor.forClass(PositionType.class);
        verify(positionTypeRepository, atLeast(3)).save(captor.capture());
        List<PositionType> saved = captor.getAllValues();
        PositionType savedRoot = saved.stream().filter(item -> item.getId().equals(1L)).reduce((first, second) -> second).orElseThrow();
        PositionType savedChild = saved.stream().filter(item -> item.getId().equals(2L)).reduce((first, second) -> second).orElseThrow();
        PositionType savedLeaf = saved.stream().filter(item -> item.getId().equals(3L)).reduce((first, second) -> second).orElseThrow();
        assertEquals(1, savedRoot.getStatus());
        assertEquals(1, savedChild.getStatus());
        assertEquals(1, savedLeaf.getStatus());
    }

    private PositionType node(Long id, String name, Long parentId, int level, int status, int sortNo) {
        PositionType item = new PositionType();
        item.setId(id);
        item.setCode(id);
        item.setName(name);
        item.setParentId(parentId);
        item.setLevel(level);
        item.setStatus(status);
        item.setSortNo(sortNo);
        return item;
    }
}

