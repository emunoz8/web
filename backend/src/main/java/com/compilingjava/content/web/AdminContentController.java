// com.compilingjava.content.web.AdminContentController.java
package com.compilingjava.content.web;

import com.compilingjava.content.model.Content;
import com.compilingjava.content.service.BlogPostService;
import com.compilingjava.content.service.ProjectService;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentController {

    private final ProjectService projectService;
    private final BlogPostService blogPostService;

    @PostMapping("/projects")
    public ResponseEntity<Content> createProject(@RequestBody ProjectCreateReq req) {
        return ResponseEntity.ok(projectService.create(req.getTitle(), req.getDescription()));
    }

    @PostMapping("/blogs")
    public ResponseEntity<Content> createBlog(@RequestBody BlogCreateReq req) {
        return ResponseEntity.ok(blogPostService.create(req.getTitle(), req.getBodyMd()));
    }

    @DeleteMapping("/contents/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        // either projectService/blogPostService delete by id; both cascade from Content
        projectService.deleteIfExists(id);
        blogPostService.deleteIfExists(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class ProjectCreateReq {
        @NotBlank
        private String title;
        @NotBlank
        private String slug;
        @NotBlank
        private String description;
    }

    @Data
    public static class BlogCreateReq {
        @NotBlank
        private String title;
        @NotBlank
        private String slug;
        @NotBlank
        private String bodyMd;
    }
}
