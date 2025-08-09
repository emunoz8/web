package com.compilingjava.content.service;

import com.compilingjava.content.model.ContentType;
import com.compilingjava.content.model.BlogPost;
import com.compilingjava.content.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final ContentService contentService;

    public Page<BlogPost> list(Pageable pageable) {
        return blogPostRepository.findAll(pageable);
    }

    public BlogPost getBySlugOrThrow(String slug) {
        return blogPostRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Blog post not found: " + slug));
    }

    @Transactional
    public BlogPost create(String title, String bodyMd) {
        String slug = contentService.ensureUniqueSlug(title);

        BlogPost b = new BlogPost();
        b.setType(ContentType.BLOG);
        b.setTitle(title);
        b.setSlug(slug);
        b.setBodyMd(bodyMd);

        return blogPostRepository.save(b);
    }

    @Transactional
    public BlogPost update(Long id, String title, String bodyMd) {
        BlogPost b = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog post not found: id=" + id));

        if (title != null && !title.isBlank()) {
            String nextSlug = contentService.ensureUniqueSlug(title);
            b.setTitle(title);
            b.setSlug(nextSlug);
        }
        if (bodyMd != null) {
            b.setBodyMd(bodyMd);
        }
        return blogPostRepository.save(b);
    }

    @Transactional
    public void deleteIfExists(Long id) {
        blogPostRepository.deleteById(id);
    }
}
