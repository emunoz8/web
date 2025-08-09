// src/main/java/com/compilingjava/content/service/ContentService.java
package com.compilingjava.content.service;

import com.compilingjava.content.model.Content;
import com.compilingjava.content.model.ContentType;
import com.compilingjava.content.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;

    // ---------- Read APIs used by your ContentController ----------
    public List<Content> listAll() {
        return contentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<Content> listByType(ContentType type) {
        return contentRepository.findByTypeOrderByCreatedAtDesc(type);
    }

    public Content getBySlug(String slug) {
        return contentRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Content not found for slug: " + slug));
    }

    public Content getById(Long id) {
        return contentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Content not found for id: " + id));
    }

    // ---------- Slug helpers (single source of truth) ----------
    /** Create a unique slug from the given input, appending -1, -2, ... if necessary. */
    public String ensureUniqueSlug(String input) {
        String base = slugify(input);
        String slug = base;
        int i = 0;
        while (contentRepository.existsBySlug(slug)) {
            i++;
            slug = base + "-" + i;
        }
        return slug;
    }

    /** Same as above but ignores the current record (for updates). */
    public String ensureUniqueSlugForUpdate(String desired, Long currentId) {
        String base = slugify(desired);
        String slug = base;
        int i = 0;
        while (true) {
            Optional<Content> existing = contentRepository.findBySlug(slug);
            if (existing.isEmpty() || existing.get().getId().equals(currentId)) {
                return slug;
            }
            i++;
            slug = base + "-" + i;
        }
    }

    // Optional: call this if you want to handle rare race conditions where two
    // requests pick the same slug at the same time and the DB unique constraint fires.
    public String retryOnSlugCollision(String desired, Runnable saveAttempt) {
        String slug = ensureUniqueSlug(desired);
        try {
            saveAttempt.run();
            return slug;
        } catch (DataIntegrityViolationException e) {
            // one quick retry with a new suffix
            String retry = ensureUniqueSlug(desired);
            saveAttempt.run();
            return retry;
        }
    }

    public Page<Content> search(ContentType type, String q, Pageable pageable) {
        boolean hasQ = q != null && !q.isBlank();
        if (type == null && !hasQ) {
            return contentRepository.findAll(pageable);
        } else if (type != null && !hasQ) {
            return contentRepository.findByType(type, pageable);
        } else if (type == null) { // hasQ
            return contentRepository.findByTitleContainingIgnoreCase(q, pageable);
        } else {
            return contentRepository.findByTypeAndTitleContainingIgnoreCase(type, q, pageable);
        }
    }

    // ---------- internal ----------
    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]+");

    private static String slugify(String s) {
        if (s == null || s.isBlank())
            return "item";
        String ascii = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        String slug = NON_ALNUM.matcher(ascii.toLowerCase(Locale.ROOT)).replaceAll("-");
        slug = slug.replaceAll("^-+|-+$", "");
        return slug.isEmpty() ? "item" : slug;
    }

}
