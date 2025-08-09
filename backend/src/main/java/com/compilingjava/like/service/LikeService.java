package com.compilingjava.like.service;

import com.compilingjava.content.repository.ContentRepository;
import com.compilingjava.like.model.Like;
import com.compilingjava.like.repository.LikeRepository;
import com.compilingjava.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;

    @Transactional
    public boolean like(Long userId, Long contentId) {
        // validate content exists
        contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("Content not found: id=" + contentId));

        if (likeRepository.existsByUserIdAndContentId(userId, contentId)) {
            return false; // already liked
        }
        Like like = new Like();
        like.setUser(userRepository.getReferenceById(userId));
        like.setContent(contentRepository.getReferenceById(contentId));
        likeRepository.save(like);
        return true;
    }

    @Transactional
    public boolean unlike(Long userId, Long contentId) {
        if (!likeRepository.existsByUserIdAndContentId(userId, contentId)) {
            return false;
        }
        likeRepository.deleteByUserIdAndContentId(userId, contentId);
        return true;
    }

    public long countForContent(Long contentId) {
        return likeRepository.countByContentId(contentId);
    }

    public boolean userHasLiked(Long userId, Long contentId) {
        return likeRepository.existsByUserIdAndContentId(userId, contentId);
    }

    public boolean isLikedBy(Long userId, Long contentId) {
        return likeRepository.existsByUser_IdAndContent_Id(userId, contentId);
    }

}
