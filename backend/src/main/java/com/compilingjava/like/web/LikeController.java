package com.compilingjava.like.web;

import com.compilingjava.like.service.LikeService;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/contents/{contentId}/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;
    private final UserRepository userRepository;

    private Long currentUserId(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping
    public ResponseEntity<Void> like(@PathVariable Long contentId, Authentication auth) {
        boolean created = likeService.like(currentUserId(auth), contentId);
        return created ? ResponseEntity.status(HttpStatus.CREATED).build()
                : ResponseEntity.noContent().build(); // already liked
    }

    @DeleteMapping
    public ResponseEntity<Void> unlike(@PathVariable Long contentId, Authentication auth) {
        boolean removed = likeService.unlike(currentUserId(auth), contentId);
        return removed ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/me")
    public Map<String, Boolean> me(@PathVariable Long contentId, Authentication auth) {
        boolean liked = likeService.isLikedBy(currentUserId(auth), contentId);
        return Map.of("liked", liked);
    }

    @GetMapping("/count")
    public Map<String, Long> count(@PathVariable Long contentId) {
        return Map.of("count", likeService.countForContent(contentId));
    }
}
