package com.graphhire.application.domain.repository;

import com.graphhire.application.domain.model.Favorite;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository {
    Favorite save(Favorite favorite);
    Optional<Favorite> findById(Long id);
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserIdAndJobId(Long userId, Long jobId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    void delete(Long id);
    void deleteByUserIdAndJobId(Long userId, Long jobId);
}
