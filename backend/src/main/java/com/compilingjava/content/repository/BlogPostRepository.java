package com.compilingjava.content.repository;

import com.compilingjava.content.model.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    Optional<BlogPost> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<BlogPost> findByTitleContainingIgnoreCase(String q, Pageable pageable);
}
