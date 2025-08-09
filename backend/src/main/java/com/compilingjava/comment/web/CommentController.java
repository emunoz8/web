package com.compilingjava.comment.web;

import com.compilingjava.comment.dto.CommentCreateRequest;
import com.compilingjava.comment.dto.CommentTreeDto;
import com.compilingjava.comment.model.Comment;
import com.compilingjava.comment.service.CommentService;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Comment>> listByContent(@RequestParam Long contentId) {
        return ResponseEntity.ok(commentService.listByContent(contentId));
    }

    @GetMapping("/tree")
    public ResponseEntity<List<CommentTreeDto>> tree(@RequestParam Long contentId) {
        return ResponseEntity.ok(commentService.listTreeByContent(contentId));
    }

    @PostMapping
    public ResponseEntity<Comment> add(@RequestBody CommentCreateRequest req) {
        Long userId = currentUserId();
        return ResponseEntity.ok(
                commentService.addComment(userId, req.getContentId(), req.getBody(), req.getParentId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = currentUserId();
        commentService.deleteComment(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + username));
        return u.getId();
    }
}
