package com.graphhire.skill.domain.repository;

import com.graphhire.skill.domain.model.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository {
    Category save(Category category);
    Optional<Category> findById(Long id);
    List<Category> findAll();
    void delete(Long id);
}
