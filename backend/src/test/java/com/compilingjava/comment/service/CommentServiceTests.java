package com.compilingjava;

import com.compilingjava.comment.service.CommentService;
import com.compilingjava.comment.dto.CommentTreeDto;
import com.compilingjava.comment.model.Comment;
import com.compilingjava.comment.repository.CommentRepository;
import com.compilingjava.content.model.Content;
import com.compilingjava.content.repository.ContentRepository;
import com.compilingjava.user.model.User;
import com.compilingjava.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito + real entities (no mocking of JPA/domain classes).
 * We only mock repositories; entities are constructed normally and
 * ids/roles are set with reflection helpers where setters aren't available.
 */
@ExtendWith(MockitoExtension.class)
class CommentServiceTests {

    @Mock
    CommentRepository commentRepository;
    @Mock
    ContentRepository contentRepository;
    @Mock
    UserRepository userRepository;

    @InjectMocks
    CommentService service;

    final Long USER_ID = 7L;
    final Long ADMIN_ID = 99L;
    final Long CONTENT_ID = 42L;
    final Long COMMENT_ID = 100L;
    final Long PARENT_ID = 200L;

    // ------------ helpers to set private fields on entities ------------
    private static void set(Object target, String fieldName, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(fieldName);
            f.setAccessible(true);
            f.set(target, value);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    private static User user(long id, String username, User.Role role) {
        User u = new User();
        set(u, "id", id);
        u.setUsername(username);
        set(u, "role", role);
        return u;
    }

    private static Comment comment(Long id, User author, Content content, Comment parent, String body,
            Instant createdAt) {
        Comment c = new Comment();
        if (id != null)
            set(c, "id", id);
        c.setUser(author);
        c.setContent(content);
        c.setParent(parent);
        c.setBody(body);
        if (createdAt != null)
            set(c, "createdAt", createdAt);
        return c;
    }

    @BeforeEach
    void stubs() {
        lenient().when(userRepository.findById(USER_ID))
                .thenReturn(Optional.of(user(USER_ID, "alice", User.Role.USER)));
        lenient().when(userRepository.findById(ADMIN_ID))
                .thenReturn(Optional.of(user(ADMIN_ID, "admin", User.Role.ADMIN)));
        lenient().when(contentRepository.findById(CONTENT_ID))
                .thenReturn(Optional.of(content(CONTENT_ID))); // uses TestContent
        lenient().when(commentRepository.save(any(Comment.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    // --------------------- addComment ---------------------

    @Test
    void addComment_root_succeeds_and_sets_fields() {
        Comment saved = service.addComment(USER_ID, CONTENT_ID, "Nice post!", null);

        assertThat(saved.getBody()).isEqualTo("Nice post!");
        assertThat(saved.getUser().getId()).isEqualTo(USER_ID);
        assertThat(saved.getContent().getId()).isEqualTo(CONTENT_ID);
        assertThat(saved.getParent()).isNull();

        verify(commentRepository).save(argThat(c -> "Nice post!".equals(c.getBody())
                && c.getUser() != null
                && c.getContent() != null
                && c.getParent() == null));
    }

    @Test
    void addComment_with_parent_links_to_parent() {
        Comment parent = comment(PARENT_ID, user(8L, "bob", User.Role.USER), content(CONTENT_ID), null, "parent",
                Instant.now());
        when(commentRepository.findById(PARENT_ID)).thenReturn(Optional.of(parent));

        Comment saved = service.addComment(USER_ID, CONTENT_ID, "reply", PARENT_ID);

        assertThat(saved.getParent()).isNotNull();
        assertThat(saved.getParent().getId()).isEqualTo(PARENT_ID);
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    void addComment_rejects_blank_body() {
        assertThatThrownBy(() -> service.addComment(USER_ID, CONTENT_ID, "  ", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("body");
        verifyNoInteractions(commentRepository);
    }

    @Test
    void addComment_throws_if_user_missing() {
        when(userRepository.findById(123L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.addComment(123L, CONTENT_ID, "text", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
        verify(commentRepository, never()).save(any());
    }

    @Test
    void addComment_throws_if_content_missing() {
        when(contentRepository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.addComment(USER_ID, 999L, "text", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Content not found");
        verify(commentRepository, never()).save(any());
    }

    @Test
    void addComment_throws_if_parent_missing() {
        when(commentRepository.findById(PARENT_ID)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.addComment(USER_ID, CONTENT_ID, "text", PARENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Parent comment not found");
        verify(commentRepository, never()).save(any());
    }

    @Test
    void addComment_throws_if_parent_belongs_to_other_content() {
        Comment wrongParent = comment(PARENT_ID, user(8L, "bob", User.Role.USER), content(777L), null, "parent",
                Instant.now());
        when(commentRepository.findById(PARENT_ID)).thenReturn(Optional.of(wrongParent));

        assertThatThrownBy(() -> service.addComment(USER_ID, CONTENT_ID, "text", PARENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("different content");
        verify(commentRepository, never()).save(any());
    }

    // --------------------- deleteComment ---------------------

    @Test
    void deleteComment_allows_author() {
        User author = user(USER_ID, "alice", User.Role.USER);
        Comment c = comment(COMMENT_ID, author, content(CONTENT_ID), null, "x", Instant.now());
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(c));

        service.deleteComment(USER_ID, COMMENT_ID);

        verify(commentRepository).delete(c);
        // Should not need requester lookup when author matches
        verify(userRepository, never()).findById(USER_ID);
    }

    @Test
    void deleteComment_allows_admin_if_not_author() {
        User author = user(8L, "bob", User.Role.USER);
        Comment c = comment(COMMENT_ID, author, content(CONTENT_ID), null, "x", Instant.now());
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(c));

        service.deleteComment(ADMIN_ID, COMMENT_ID);

        verify(commentRepository).delete(c);
    }

    @Test
    void deleteComment_forbidden_for_non_author_non_admin() {
        User author = user(8L, "bob", User.Role.USER);
        Comment c = comment(COMMENT_ID, author, content(CONTENT_ID), null, "x", Instant.now());
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(c));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user(USER_ID, "alice", User.Role.USER)));

        assertThatThrownBy(() -> service.deleteComment(USER_ID, COMMENT_ID))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Not allowed");
        verify(commentRepository, never()).delete(any());
    }

    @Test
    void deleteComment_throws_if_requester_missing() {
        User author = user(8L, "bob", User.Role.USER);
        Comment c = comment(COMMENT_ID, author, content(CONTENT_ID), null, "x", Instant.now());
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(c));
        when(userRepository.findById(555L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteComment(555L, COMMENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Requester not found");
        verify(commentRepository, never()).delete(any());
    }

    @Test
    void deleteComment_throws_if_comment_missing() {
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.deleteComment(USER_ID, COMMENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Comment not found");
    }

    // --------------------- getById / listByContent ---------------------

    @Test
    void getById_returns_comment() {
        Comment c = comment(COMMENT_ID, user(USER_ID, "alice", User.Role.USER), content(CONTENT_ID), null, "body",
                Instant.now());
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.of(c));

        Comment got = service.getById(COMMENT_ID);
        assertThat(got).isSameAs(c);
    }

    @Test
    void getById_throws_if_missing() {
        when(commentRepository.findById(COMMENT_ID)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getById(COMMENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Comment not found");
    }

    @Test
    void listByContent_checks_content_exists_then_queries_repo() {
        List<Comment> rows = List.of(
                comment(1L, user(1L, "u1", User.Role.USER), content(CONTENT_ID), null, "a", Instant.now()),
                comment(2L, user(2L, "u2", User.Role.USER), content(CONTENT_ID), null, "b", Instant.now()));
        when(commentRepository.findByContentRef_IdOrderByCreatedAtAsc(CONTENT_ID)).thenReturn(rows);

        List<Comment> list = service.listByContent(CONTENT_ID);

        assertThat(list).hasSize(2);
        verify(contentRepository).findById(CONTENT_ID);
        verify(commentRepository).findByContentRef_IdOrderByCreatedAtAsc(CONTENT_ID);
    }

    @Test
    void listByContent_throws_if_content_missing() {
        when(contentRepository.findById(123L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.listByContent(123L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Content not found");
        verify(commentRepository, never()).findByContentRef_IdOrderByCreatedAtAsc(any());
    }

    // --------------------- listTreeByContent ---------------------

    @Test
    void listTreeByContent_builds_tree_even_if_child_precedes_parent() {
        // ensure content exists
        when(contentRepository.findById(CONTENT_ID)).thenReturn(Optional.of(content(CONTENT_ID)));

        // Child appears before parent
        Comment parent = comment(10L, user(10L, "pa", User.Role.USER), content(CONTENT_ID), null, "parent",
                Instant.now());
        Comment child = comment(11L, user(11L, "ca", User.Role.USER), content(CONTENT_ID), parent, "child",
                Instant.now());

        when(commentRepository.findByContentRef_IdOrderByCreatedAtAsc(CONTENT_ID))
                .thenReturn(List.of(child, parent));

        List<CommentTreeDto> roots = service.listTreeByContent(CONTENT_ID);

        assertThat(roots).hasSize(1);
        CommentTreeDto root = roots.get(0);
        assertThat(root.getId()).isEqualTo(10L);
        assertThat(root.getChildren()).hasSize(1);
        assertThat(root.getChildren().get(0).getId()).isEqualTo(11L);
        assertThat(root.getChildren().get(0).getUserId()).isEqualTo(11L);
        assertThat(root.getChildren().get(0).getUsername()).isEqualTo("ca");
    }

    private static Content content(long id) {
        return new TestContent(id);
    }

}
