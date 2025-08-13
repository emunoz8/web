package com.compilingjava.comment.web;

import com.compilingjava.comment.dto.CommentCreateRequest;
import com.compilingjava.comment.dto.CommentTreeDto;
import com.compilingjava.comment.model.Comment;
import com.compilingjava.comment.service.CommentService;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import static org.springframework.http.HttpStatus.NO_CONTENT;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentControllerUnitTests {

    @Mock
    CommentService commentService;
    @Mock
    UserRepository userRepository;

    @InjectMocks
    CommentController controller;

    @BeforeEach
    void setUpSecurity() {
        var auth = new UsernamePasswordAuthenticationToken(
                "alice", "pw", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    private static User user(long id, String username) {
        User u = new User();
        // set id reflectively if field has no public setter
        try {
            Field f = User.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(u, id);
        } catch (Exception ignored) {
        }
        u.setUsername(username);
        return u;
    }

    @Test
    void listByContent_delegates_to_service() {
        Comment c1 = new Comment();
        c1.setBody("first");
        c1.setCreatedAt(Instant.now());
        Comment c2 = new Comment();
        c2.setBody("second");
        c2.setCreatedAt(Instant.now());
        when(commentService.listByContent(42L)).thenReturn(List.of(c1, c2));

        ResponseEntity<List<Comment>> out = controller.listByContent(42L);
        List<Comment> body = assertBody(out);
        assertThat(body).hasSize(2);
        assertThat(body.get(0).getBody()).isEqualTo("first");

    }

    @Test
    void listTreeByContent_returns_tree() {
        var child = CommentTreeDto.builder()
                .id(11L).parentId(10L).userId(7L).username("alice")
                .body("child").createdAt(Instant.now()).build();
        var root = CommentTreeDto.builder()
                .id(10L).userId(8L).username("bob")
                .body("root").createdAt(Instant.now())
                .children(List.of(child)).build();

        when(commentService.listTreeByContent(42L)).thenReturn(List.of(root));

        ResponseEntity<List<CommentTreeDto>> out = controller.tree(42L);
        List<CommentTreeDto> body = assertBody(out);
        assertThat(body).hasSize(1);
        assertThat(body.get(0).getChildren()).extracting("id").containsExactly(11L);

    }

    @Test
    void add_uses_current_user_from_security_context() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user(7L, "alice")));

        var req = new CommentCreateRequest();
        req.setContentId(42L);
        req.setBody("Nice post!");
        req.setParentId(null);

        Comment saved = new Comment();
        saved.setBody("Nice post!");
        saved.setCreatedAt(Instant.now());
        when(commentService.addComment(7L, 42L, "Nice post!", null)).thenReturn(saved);
        ResponseEntity<Comment> out = controller.add(req);
        Comment created = assertBody(out);
        assertThat(created.getBody()).isEqualTo("Nice post!");

    }

    @Test
    void delete_passes_current_user_id_and_returns_noContent() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user(7L, "alice")));

        ResponseEntity<Void> resp = controller.delete(100L);

        assertThat(resp.getStatusCode()).isEqualTo(NO_CONTENT);
        verify(commentService).deleteComment(7L, 100L);
    }

    @Test
    void add_throws_when_current_user_missing() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.empty());

        var req = new CommentCreateRequest();
        req.setContentId(42L);
        req.setBody("Hello");

        assertThatThrownBy(() -> controller.add(req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Authenticated user not found");

        verifyNoInteractions(commentService);
    }

    private static <T> T assertBody(ResponseEntity<T> resp) {
        T b = resp.getBody();
        assertThat(b).as("response body").isNotNull();
        return b;
    }

}
