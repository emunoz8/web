package com.compilingjava.content.web;

import com.compilingjava.content.model.Content;
import com.compilingjava.content.model.ContentType;
import com.compilingjava.content.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contents")
public class ContentController {

    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<Page<Content>> list(
            @RequestParam(required = false) ContentType type,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(contentService.search(type, q, pageable));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Content> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(contentService.getBySlug(slug));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Content> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getById(id));
    }
}
