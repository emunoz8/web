// src/main/java/com/compilingjava/comment/repository/CommentRepository.java
package com.compilingjava.comment.repository;

import com.compilingjava.comment.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByContentRef_IdOrderByCreatedAtAsc(Long contentId);
}
