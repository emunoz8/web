// src/main/java/com/compilingjava/comment/model/Comment.java
package com.compilingjava.comment.model;

import com.compilingjava.content.model.Content;
import com.compilingjava.user.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "contentRef", "user", "parent", "replies" })
@Entity
@Table(name = "comments", indexes = {
        @Index(name = "idx_comments_content", columnList = "content_id"),
        @Index(name = "idx_comments_user", columnList = "user_id"),
        @Index(name = "idx_comments_parent", columnList = "parent_id")
})
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which piece of content (project/blog) this comment is on
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "content_id", nullable = false)
    @JsonIgnore
    private Content contentRef;

    // Author
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Text body; mapped to DB column "content" from V1
    @Column(name = "content", columnDefinition = "text", nullable = false)
    private String body;

    // Parent for threaded replies
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private Comment parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Comment> replies = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null)
            createdAt = Instant.now();
    }

    // Convenience setters to make service code obvious
    public void setContent(Content c) {
        this.contentRef = c;
    }

    public Content getContent() {
        return this.contentRef;
    }
}
