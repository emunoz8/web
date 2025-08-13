package com.compilingjava;

import com.compilingjava.content.service.ContentService;
import com.compilingjava.content.service.ProjectService;
import com.compilingjava.content.model.ContentType;
import com.compilingjava.content.model.Project;
import com.compilingjava.content.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTests {

    @Mock
    ProjectRepository projectRepository;
    @Mock
    ContentService contentService;

    @InjectMocks
    ProjectService service;

    @Test
    void list_delegates_to_repository() {
        Pageable pageable = PageRequest.of(0, 2);
        List<Project> content = List.of(new Project(), new Project());
        Page<Project> page = new PageImpl<>(content, pageable, 5);

        when(projectRepository.findAll(pageable)).thenReturn(page);

        Page<Project> out = service.list(pageable);

        assertThat(out.getContent()).hasSize(2);
        assertThat(out.getTotalElements()).isEqualTo(5);
        verify(projectRepository).findAll(pageable);
        verifyNoInteractions(contentService);
    }

    @Test
    void getBySlugOrThrow_returns_when_found() {
        Project p = new Project();
        p.setSlug("cool-project");
        when(projectRepository.findBySlug("cool-project")).thenReturn(Optional.of(p));

        Project out = service.getBySlugOrThrow("cool-project");

        assertThat(out).isSameAs(p);
        verify(projectRepository).findBySlug("cool-project");
    }

    @Test
    void getBySlugOrThrow_throws_when_missing() {
        when(projectRepository.findBySlug("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getBySlugOrThrow("missing"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Project not found");

        verify(projectRepository).findBySlug("missing");
    }

    @Test
    void create_generates_unique_slug_sets_fields_and_saves() {
        when(contentService.ensureUniqueSlug("My Project")).thenReturn("my-project");
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Project created = service.create("My Project", "desc");

        assertThat(created.getType()).isEqualTo(ContentType.PROJECT);
        assertThat(created.getTitle()).isEqualTo("My Project");
        assertThat(created.getSlug()).isEqualTo("my-project");
        assertThat(created.getDescription()).isEqualTo("desc");

        verify(contentService).ensureUniqueSlug("My Project");
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void update_with_new_title_regenerates_slug_and_updates_description() {
        Project existing = new Project();
        existing.setId(11L);
        existing.setTitle("Old");
        existing.setSlug("old");
        existing.setDescription("old desc");

        when(projectRepository.findById(11L)).thenReturn(Optional.of(existing));
        when(contentService.ensureUniqueSlug("New Title")).thenReturn("new-title");
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Project out = service.update(11L, "New Title", "new desc");

        assertThat(out.getTitle()).isEqualTo("New Title");
        assertThat(out.getSlug()).isEqualTo("new-title");
        assertThat(out.getDescription()).isEqualTo("new desc");

        verify(contentService).ensureUniqueSlug("New Title");
        verify(projectRepository).save(existing);
    }

    @Test
    void update_without_title_only_updates_description() {
        Project existing = new Project();
        existing.setId(7L);
        existing.setTitle("Keep");
        existing.setSlug("keep");
        existing.setDescription("old");

        when(projectRepository.findById(7L)).thenReturn(Optional.of(existing));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        Project out = service.update(7L, "  ", "new");

        assertThat(out.getTitle()).isEqualTo("Keep");
        assertThat(out.getSlug()).isEqualTo("keep");
        assertThat(out.getDescription()).isEqualTo("new");

        verify(projectRepository).save(existing);
        verify(contentService, never()).ensureUniqueSlug(anyString());
    }

    @Test
    void update_throws_when_missing() {
        when(projectRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(404L, "x", "y"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Project not found");

        verify(projectRepository).findById(404L);
    }

    @Test
    void deleteIfExists_delegates_to_repo() {
        service.deleteIfExists(99L);
        verify(projectRepository).deleteById(99L);
        verifyNoInteractions(contentService);
    }
}
