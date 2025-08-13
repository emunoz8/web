package com.compilingjava.content.service;

import com.compilingjava.content.model.BlogPost;
import com.compilingjava.content.model.ContentType;
import com.compilingjava.content.repository.BlogPostRepository;
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
class BlogPostServiceTests {

    @Mock
    BlogPostRepository blogPostRepository;
    @Mock
    ContentService contentService;

    @InjectMocks
    BlogPostService service;

    @Test
    void list_delegates_to_repository() {
        Pageable pageable = PageRequest.of(0, 2, Sort.by("createdAt").descending());
        List<BlogPost> content = List.of(new BlogPost(), new BlogPost());
        Page<BlogPost> page = new PageImpl<>(content, pageable, 4);

        when(blogPostRepository.findAll(pageable)).thenReturn(page);

        Page<BlogPost> out = service.list(pageable);

        assertThat(out.getContent()).hasSize(2);
        assertThat(out.getTotalElements()).isEqualTo(4);
        verify(blogPostRepository).findAll(pageable);
        verifyNoInteractions(contentService);
    }

    @Test
    void getBySlugOrThrow_returns_entity_when_found() {
        BlogPost b = new BlogPost();
        b.setSlug("hello-world");
        when(blogPostRepository.findBySlug("hello-world")).thenReturn(Optional.of(b));

        BlogPost result = service.getBySlugOrThrow("hello-world");

        assertThat(result).isSameAs(b);
        verify(blogPostRepository).findBySlug("hello-world");
    }

    @Test
    void getBySlugOrThrow_throws_when_missing() {
        when(blogPostRepository.findBySlug("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getBySlugOrThrow("missing"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Blog post not found");

        verify(blogPostRepository).findBySlug("missing");
    }

    @Test
    void create_generates_unique_slug_sets_fields_and_saves() {
        when(contentService.ensureUniqueSlug("My Title")).thenReturn("my-title");

        ArgumentCaptor<BlogPost> captor = ArgumentCaptor.forClass(BlogPost.class);
        when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(inv -> inv.getArgument(0));

        BlogPost created = service.create("My Title", "Body **md**");

        verify(contentService).ensureUniqueSlug("My Title");
        verify(blogPostRepository).save(captor.capture());

        BlogPost saved = captor.getValue();
        assertThat(saved.getType()).isEqualTo(ContentType.BLOG);
        assertThat(saved.getTitle()).isEqualTo("My Title");
        assertThat(saved.getSlug()).isEqualTo("my-title");
        assertThat(saved.getBodyMd()).isEqualTo("Body **md**");

        // method returns whatever repo saved
        assertThat(created).isSameAs(saved);
    }

    @Test
    void update_with_new_title_updates_title_and_slug_and_saves() {
        BlogPost existing = new BlogPost();
        existing.setId(123L);
        existing.setTitle("Old");
        existing.setSlug("old");
        existing.setBodyMd("old-body");

        when(blogPostRepository.findById(123L)).thenReturn(Optional.of(existing));
        when(contentService.ensureUniqueSlug("New Title")).thenReturn("new-title");
        when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(inv -> inv.getArgument(0));

        BlogPost updated = service.update(123L, "New Title", "new-body");

        assertThat(updated.getTitle()).isEqualTo("New Title");
        assertThat(updated.getSlug()).isEqualTo("new-title");
        assertThat(updated.getBodyMd()).isEqualTo("new-body");

        verify(contentService).ensureUniqueSlug("New Title");
        verify(blogPostRepository).save(existing);
    }

    @Test
    void update_without_title_only_updates_body_and_keeps_slug() {
        BlogPost existing = new BlogPost();
        existing.setId(9L);
        existing.setTitle("Keep");
        existing.setSlug("keep-slug");
        existing.setBodyMd("old");

        when(blogPostRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(blogPostRepository.save(any(BlogPost.class))).thenAnswer(inv -> inv.getArgument(0));

        BlogPost updated = service.update(9L, "   ", "new-body"); // blank title

        assertThat(updated.getTitle()).isEqualTo("Keep");
        assertThat(updated.getSlug()).isEqualTo("keep-slug");
        assertThat(updated.getBodyMd()).isEqualTo("new-body");

        verify(blogPostRepository).save(existing);
        verify(contentService, never()).ensureUniqueSlug(anyString());
    }

    @Test
    void update_throws_when_missing() {
        when(blogPostRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(404L, "X", "Y"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Blog post not found");

        verify(blogPostRepository).findById(404L);
        verifyNoInteractions(contentService);
    }

    @Test
    void deleteIfExists_calls_repository_deleteById() {
        service.deleteIfExists(42L);
        verify(blogPostRepository).deleteById(42L);
        verifyNoInteractions(contentService);
    }
}
