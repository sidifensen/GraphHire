package com.graphhire.application.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.application.domain.model.Favorite;
import com.graphhire.application.domain.repository.FavoriteRepository;
import com.graphhire.application.infrastructure.persistence.mapper.FavoriteMapper;
import com.graphhire.application.infrastructure.persistence.po.FavoritePO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class FavoriteRepositoryImpl implements FavoriteRepository {

    @Autowired
    private FavoriteMapper favoriteMapper;

    @Override
    public Favorite save(Favorite favorite) {
        FavoritePO po = toPO(favorite);
        if (favorite.getId() == null) {
            favoriteMapper.insert(po);
            favorite.setId(po.getId());
        } else {
            favoriteMapper.updateById(po);
        }
        return favorite;
    }

    @Override
    public Optional<Favorite> findById(Long id) {
        FavoritePO po = favoriteMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<Favorite> findByUserId(Long userId) {
        LambdaQueryWrapper<FavoritePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FavoritePO::getUserId, userId)
                .orderByDesc(FavoritePO::getCreatedAt);
        return favoriteMapper.selectList(wrapper).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public Optional<Favorite> findByUserIdAndJobId(Long userId, Long jobId) {
        LambdaQueryWrapper<FavoritePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FavoritePO::getUserId, userId)
                .eq(FavoritePO::getJobId, jobId);
        FavoritePO po = favoriteMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public boolean existsByUserIdAndJobId(Long userId, Long jobId) {
        LambdaQueryWrapper<FavoritePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FavoritePO::getUserId, userId)
                .eq(FavoritePO::getJobId, jobId);
        return favoriteMapper.selectCount(wrapper) > 0;
    }

    @Override
    public void delete(Long id) {
        favoriteMapper.deleteById(id);
    }

    @Override
    public void deleteByUserIdAndJobId(Long userId, Long jobId) {
        LambdaQueryWrapper<FavoritePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FavoritePO::getUserId, userId)
                .eq(FavoritePO::getJobId, jobId);
        favoriteMapper.delete(wrapper);
    }

    private Favorite toDomain(FavoritePO po) {
        if (po == null) return null;
        Favorite fav = new Favorite();
        BeanUtil.copyProperties(po, fav);
        return fav;
    }

    private FavoritePO toPO(Favorite favorite) {
        if (favorite == null) return null;
        FavoritePO po = new FavoritePO();
        BeanUtil.copyProperties(favorite, po);
        return po;
    }
}
