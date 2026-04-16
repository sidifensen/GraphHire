package com.graphhire.admin.interfaces.controller;

import com.graphhire.common.vo.Result;
import com.graphhire.skill.domain.model.Category;
import com.graphhire.skill.domain.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/skill")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/categories")
    public Result<List<Category>> getAllCategories() {
        return Result.success(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    public Result<Long> createCategory(@RequestBody Category request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setCreatedAt(LocalDateTime.now());
        Category saved = categoryRepository.save(category);
        return Result.success(saved.getId());
    }

    @PutMapping("/categories/{id}")
    public Result<Void> updateCategory(@PathVariable Long id, @RequestBody Category request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("分类不存在"));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        categoryRepository.save(category);
        return Result.success();
    }

    @DeleteMapping("/categories/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryRepository.delete(id);
        return Result.success();
    }
}
