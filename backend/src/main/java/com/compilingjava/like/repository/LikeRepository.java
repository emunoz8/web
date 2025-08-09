package com.compilingjava.like.repository;

import com.compilingjava.like.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {

    boolean existsByUserIdAndContentId(Long userId, Long contentId);

    Optional<Like> findByUserIdAndContentId(Long userId, Long contentId);

    long countByContentId(Long contentId);

    @Transactional
    void deleteByUserIdAndContentId(Long userId, Long contentId);

    boolean existsByUser_IdAndContent_Id(Long userId, Long contentId);

}
