package com.compilingjava.like.model;

import com.compilingjava.content.model.Content;
import com.compilingjava.user.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "content", "user" })
@Entity
@Table(name = "likes", uniqueConstraints = @UniqueConstraint(name = "uk_like_user_content", columnNames = { "user_id",
                "content_id" }), indexes = {
                                @Index(name = "idx_likes_content", columnList = "content_id"),
                                @Index(name = "idx_likes_user", columnList = "user_id")
                })
public class Like {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // The liked thing (project or blog), via base Content
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "content_id", nullable = false)
        @JsonIgnore
        private Content content;

        // The user who liked
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "user_id", nullable = false)
        @JsonIgnore
        private User user;

        @Column(name = "created_at", nullable = false, updatable = false)
        private Instant createdAt;

        @PrePersist
        public void prePersist() {
                if (createdAt == null)
                        createdAt = Instant.now();
        }
}
