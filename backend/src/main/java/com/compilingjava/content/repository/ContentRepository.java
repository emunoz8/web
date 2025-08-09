// src/main/java/com/compilingjava/content/repository/ContentRepository.java
package com.compilingjava.content.repository;

import com.compilingjava.content.model.Content;
import com.compilingjava.content.model.ContentType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Long> {
    Optional<Content> findBySlug(String slug);

    boolean existsBySlug(String slug);

    // used by listByType()
    List<Content> findByTypeOrderByCreatedAtDesc(ContentType type);

    // (optional) if you ever need sorted lists generally:
    default List<Content> findAllNewestFirst() {
        return findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    Page<Content> findByTitleContainingIgnoreCase(String q, Pageable pageable);

    Page<Content> findByTypeAndTitleContainingIgnoreCase(ContentType type, String q, Pageable pageable);

    Page<Content> findByType(ContentType type, Pageable pageable);
}
