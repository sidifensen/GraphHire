package com.graphhire.skill.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.skill.domain.model.Category;
import com.graphhire.skill.domain.repository.CategoryRepository;
import com.graphhire.skill.infrastructure.persistence.mapper.CategoryMapper;
import com.graphhire.skill.infrastructure.persistence.po.CategoryPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CategoryRepositoryImpl implements CategoryRepository {

    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public Category save(Category category) {
        CategoryPO po = toPO(category);
        if (category.getId() == null) {
            categoryMapper.insert(po);
            category.setId(po.getId());
        } else {
            categoryMapper.updateById(po);
        }
        return category;
    }

    @Override
    public Optional<Category> findById(Long id) {
        CategoryPO po = categoryMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<Category> findAll() {
        return categoryMapper.selectList(null).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public void delete(Long id) {
        categoryMapper.deleteById(id);
    }

    private Category toDomain(CategoryPO po) {
        if (po == null) return null;
        Category category = new Category();
        BeanUtil.copyProperties(po, category);
        return category;
    }

    private CategoryPO toPO(Category category) {
        if (category == null) return null;
        CategoryPO po = new CategoryPO();
        BeanUtil.copyProperties(category, po);
        return po;
    }
}
