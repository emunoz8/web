// src/main/java/com/compilingjava/comment/service/CommentService.java
package com.compilingjava.comment.service;

import com.compilingjava.comment.dto.CommentTreeDto;
import com.compilingjava.comment.model.Comment;
import com.compilingjava.comment.repository.CommentRepository;
import com.compilingjava.content.model.Content;
import com.compilingjava.content.repository.ContentRepository;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;

    @Transactional
    public Comment addComment(Long userId, Long contentId, String body, Long parentId) {
        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException("Comment body cannot be empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("Content not found: " + contentId));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setContent(content);
        comment.setBody(body);

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found: " + parentId));
            // safety: parent must belong to the same content
            if (!parent.getContent().getId().equals(contentId)) {
                throw new IllegalArgumentException("Parent comment belongs to different content");
            }
            comment.setParent(parent);
        }

        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long requesterUserId, Long commentId) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));

        if (!c.getUser().getId().equals(requesterUserId)) {
            // allow admins
            User requester = userRepository.findById(requesterUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Requester not found: " + requesterUserId));

            boolean isAdmin = requester.getRole() == User.Role.ADMIN;
            if (!isAdmin) {
                throw new SecurityException("Not allowed to delete this comment");
            }
        }

        commentRepository.delete(c);
    }

    @Transactional
    public Comment getById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + id));
    }

    @Transactional
    public List<Comment> listByContent(Long contentId) {
        // throws if content doesn’t exist (nice early fail)
        contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("Content not found: " + contentId));
        return commentRepository.findByContentRef_IdOrderByCreatedAtAsc(contentId);
    }

    @Transactional
    public List<CommentTreeDto> listTreeByContent(Long contentId) {
        // ensure content exists
        contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("Content not found: " + contentId));

        // flat list ordered by createdAt (parent tends to come before replies)
        List<Comment> flat = commentRepository.findByContentRef_IdOrderByCreatedAtAsc(contentId);

        Map<Long, CommentTreeDto> byId = new LinkedHashMap<>(flat.size());
        List<CommentTreeDto> roots = new ArrayList<>();

        for (Comment c : flat) {
            CommentTreeDto node = toDto(c);

            // if a placeholder existed (because a child referenced this before), merge children into the real node
            CommentTreeDto prev = byId.put(c.getId(), node);
            if (prev != null && prev.getChildren() != null && !prev.getChildren().isEmpty()) {
                node.getChildren().addAll(prev.getChildren());
            }

            if (c.getParent() == null) {
                roots.add(node);
            } else {
                Long pid = c.getParent().getId();
                // link to parent, creating a lightweight placeholder if parent not seen yet
                CommentTreeDto parent = byId.computeIfAbsent(pid,
                        k -> CommentTreeDto.builder().id(k).children(new ArrayList<>()).build());
                parent.getChildren().add(node);
            }
        }
        return roots;
    }

    private CommentTreeDto toDto(Comment c) {
        return CommentTreeDto.builder()
                .id(c.getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .userId(c.getUser().getId())
                .username(c.getUser().getUsername())
                .body(c.getBody())
                .createdAt(c.getCreatedAt())
                .children(new ArrayList<>())
                .build();
    }

}
