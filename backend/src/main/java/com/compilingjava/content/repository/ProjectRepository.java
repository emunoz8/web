package com.compilingjava.content.repository;

import com.compilingjava.content.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<Project> findByTitleContainingIgnoreCase(String q, Pageable pageable);
}
