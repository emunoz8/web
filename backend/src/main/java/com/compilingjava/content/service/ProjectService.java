package com.compilingjava.content.service;

import com.compilingjava.content.model.ContentType;
import com.compilingjava.content.model.Project;
import com.compilingjava.content.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ContentService contentService;

    public Page<Project> list(Pageable pageable) {
        return projectRepository.findAll(pageable);
    }

    public Project getBySlugOrThrow(String slug) {
        return projectRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + slug));
    }

    @Transactional
    public Project create(String title, String description) {
        String slug = contentService.ensureUniqueSlug(title);

        Project p = new Project();
        p.setType(ContentType.PROJECT);
        p.setTitle(title);
        p.setSlug(slug);
        p.setDescription(description);

        return projectRepository.save(p);
    }

    @Transactional
    public Project update(Long id, String title, String description) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: id=" + id));

        if (title != null && !title.isBlank()) {
            // if title changes, regenerate slug if needed
            String nextSlug = contentService.ensureUniqueSlug(title);
            p.setTitle(title);
            p.setSlug(nextSlug);
        }
        if (description != null) {
            p.setDescription(description);
        }
        return projectRepository.save(p);
    }

    @Transactional
    public void deleteIfExists(Long id) {
        projectRepository.deleteById(id);
    }
}
