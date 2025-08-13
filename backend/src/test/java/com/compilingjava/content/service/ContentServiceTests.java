package com.compilingjava;

import com.compilingjava.content.service.ContentService;
import com.compilingjava.content.model.BlogPost;
import com.compilingjava.content.model.Content;
import com.compilingjava.content.model.ContentType;
import com.compilingjava.content.repository.ContentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentServiceTests {

    @Mock
    ContentRepository contentRepository;
    @InjectMocks
    ContentService service;

    @Test
    void listAll_uses_desc_createdAt_sort() {
        List<Content> items = List.of(new BlogPost(), new BlogPost());
        when(contentRepository.findAll(any(Sort.class))).thenReturn(items);

        List<Content> out = service.listAll();

        assertThat(out).hasSize(2);

        ArgumentCaptor<Sort> sortCaptor = ArgumentCaptor.forClass(Sort.class);
        verify(contentRepository).findAll(sortCaptor.capture());

        Sort sort = sortCaptor.getValue();
        boolean hasDescCreatedAt = sort.stream()
                .anyMatch(o -> "createdAt".equals(o.getProperty()) && o.getDirection() == Sort.Direction.DESC);
        assertThat(hasDescCreatedAt).isTrue();
    }

    @Test
    void listByType_calls_repo_method() {
        List<Content> items = List.of(new BlogPost());
        when(contentRepository.findByTypeOrderByCreatedAtDesc(ContentType.BLOG)).thenReturn(items);

        List<Content> out = service.listByType(ContentType.BLOG);

        assertThat(out).hasSize(1);
        verify(contentRepository).findByTypeOrderByCreatedAtDesc(ContentType.BLOG);
    }

    @Test
    void getBySlug_returns_when_found() {
        BlogPost p = new BlogPost();
        p.setSlug("hello");
        when(contentRepository.findBySlug("hello")).thenReturn(Optional.of(p));

        Content out = service.getBySlug("hello");

        assertThat(out).isSameAs(p);
        verify(contentRepository).findBySlug("hello");
    }

    @Test
    void getBySlug_throws_when_missing() {
        when(contentRepository.findBySlug("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getBySlug("missing"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Content not found");

        verify(contentRepository).findBySlug("missing");
    }

    @Test
    void getById_returns_when_found() {
        BlogPost p = new BlogPost();
        p.setId(42L);
        when(contentRepository.findById(42L)).thenReturn(Optional.of(p));

        Content out = service.getById(42L);
        assertThat(out).isSameAs(p);
        verify(contentRepository).findById(42L);
    }

    @Test
    void getById_throws_when_missing() {
        when(contentRepository.findById(404L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getById(404L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Content not found");
        verify(contentRepository).findById(404L);
    }

    @Test
    void ensureUniqueSlug_returns_base_when_no_collision() {
        when(contentRepository.existsBySlug("my-title")).thenReturn(false);

        String slug = service.ensureUniqueSlug("My Title");

        assertThat(slug).isEqualTo("my-title");
        verify(contentRepository).existsBySlug("my-title");
    }

    @Test
    void ensureUniqueSlug_appends_counter_on_collisions() {
        // base is taken, -1 is taken, -2 is free
        when(contentRepository.existsBySlug("my-title")).thenReturn(true);
        when(contentRepository.existsBySlug("my-title-1")).thenReturn(true);
        when(contentRepository.existsBySlug("my-title-2")).thenReturn(false);

        String slug = service.ensureUniqueSlug("My Title");

        assertThat(slug).isEqualTo("my-title-2");
    }

    @Test
    void ensureUniqueSlug_handles_accents_and_symbols() {
        when(contentRepository.existsBySlug("cafe-deja-vu")).thenReturn(false);

        String slug = service.ensureUniqueSlug("Café Déjà Vu!!!");

        assertThat(slug).isEqualTo("cafe-deja-vu");
    }

    @Test
    void ensureUniqueSlugForUpdate_returns_same_slug_when_existing_is_self() {
        // findBySlug("same") returns an entity with the same id -> allowed
        BlogPost existing = new BlogPost();
        existing.setId(10L);
        when(contentRepository.findBySlug("same")).thenReturn(Optional.of(existing));

        String out = service.ensureUniqueSlugForUpdate("same", 10L);

        assertThat(out).isEqualTo("same");
        verify(contentRepository).findBySlug("same");
    }

    @Test
    void ensureUniqueSlugForUpdate_increments_when_other_entity_uses_slug() {
        // "taken" belongs to id=1, "taken-1" is free
        BlogPost other = new BlogPost();
        other.setId(1L);
        when(contentRepository.findBySlug("taken")).thenReturn(Optional.of(other));
        when(contentRepository.findBySlug("taken-1")).thenReturn(Optional.empty());

        String out = service.ensureUniqueSlugForUpdate("taken", 2L);

        assertThat(out).isEqualTo("taken-1");
        verify(contentRepository).findBySlug("taken");
        verify(contentRepository).findBySlug("taken-1");
    }

    @Test
    void retryOnSlugCollision_runs_save_twice_when_constraint_violates() {
        when(contentRepository.existsBySlug("hello")).thenReturn(false); // ensureUniqueSlug("hello") -> "hello"

        AtomicInteger runs = new AtomicInteger();
        Runnable save = () -> {
            if (runs.getAndIncrement() == 0) {
                throw new DataIntegrityViolationException("unique_violation");
            }
        };

        String out = service.retryOnSlugCollision("hello", save);

        assertThat(out).isEqualTo("hello");
        assertThat(runs.get()).isEqualTo(2); // first threw, second succeeded
    }

    // ---------- search(...) paths ----------

    @Test
    void search_noType_noQuery_calls_findAll() {
        Pageable pageable = PageRequest.of(0, 5);
        when(contentRepository.findAll(pageable)).thenReturn(Page.empty(pageable));

        Page<Content> out = service.search(null, null, pageable);

        assertThat(out.getContent()).isEmpty();
        verify(contentRepository).findAll(pageable);
    }

    @Test
    void search_type_only_calls_findByType() {
        Pageable pageable = PageRequest.of(0, 5);
        when(contentRepository.findByType(ContentType.BLOG, pageable)).thenReturn(Page.empty(pageable));

        Page<Content> out = service.search(ContentType.BLOG, "   ", pageable);

        assertThat(out.getContent()).isEmpty();
        verify(contentRepository).findByType(ContentType.BLOG, pageable);
    }

    @Test
    void search_query_only_calls_findByTitleContainingIgnoreCase() {
        Pageable pageable = PageRequest.of(0, 5);
        when(contentRepository.findByTitleContainingIgnoreCase("java", pageable)).thenReturn(Page.empty(pageable));

        Page<Content> out = service.search(null, "java", pageable);

        assertThat(out.getContent()).isEmpty();
        verify(contentRepository).findByTitleContainingIgnoreCase("java", pageable);
    }

    @Test
    void search_type_and_query_calls_findByTypeAndTitleContainingIgnoreCase() {
        Pageable pageable = PageRequest.of(0, 5);
        when(contentRepository.findByTypeAndTitleContainingIgnoreCase(ContentType.PROJECT, "api", pageable))
                .thenReturn(Page.empty(pageable));

        Page<Content> out = service.search(ContentType.PROJECT, "api", pageable);

        assertThat(out.getContent()).isEmpty();
        verify(contentRepository).findByTypeAndTitleContainingIgnoreCase(ContentType.PROJECT, "api", pageable);
    }

    @Test
    void retryOnSlugCollision_retries_once_on_unique_violation() {
        Runnable save = mock(Runnable.class);
        doThrow(new DataIntegrityViolationException("dup"))
                .doNothing()
                .when(save).run();

        String slug = service.retryOnSlugCollision("My Title", save);

        assertThat(slug).startsWith("my-title");
        verify(save, times(2)).run();
    }

    @Test
    void ensureUniqueSlugForUpdate_ignores_current_id() {
        // repository returns an existing Content with the same slug but same id → should be allowed
        var existing = new Content() {
        }; // anonymous subclass is fine for tests
        existing.setId(42L);
        when(contentRepository.findBySlug("hello")).thenReturn(Optional.of(existing));

        String out = service.ensureUniqueSlugForUpdate("Hello", 42L);

        assertThat(out).isEqualTo("hello");
    }

    @Test
    void ensureUniqueSlug_handles_blanks_and_accents() {
        // no collisions
        when(contentRepository.existsBySlug(anyString())).thenReturn(false);

        assertThat(service.ensureUniqueSlug("   ")).isEqualTo("item");
        assertThat(service.ensureUniqueSlug("Café Déjà Vu!!!")).isEqualTo("cafe-deja-vu");
    }

}
