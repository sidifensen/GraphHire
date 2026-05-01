package com.graphhire.industry.domain.repository;

import com.graphhire.industry.domain.model.Industry;

import java.util.List;
import java.util.Optional;

public interface IndustryRepository {
    Optional<Industry> findById(Long id);
    Optional<Industry> findByName(String name);
    List<Industry> findAll();
    List<Industry> findByEnabled(Integer enabled);
    Industry save(Industry industry);
}
