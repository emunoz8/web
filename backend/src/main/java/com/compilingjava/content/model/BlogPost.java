package com.compilingjava.content.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
@Entity
@Table(name = "blog_posts")
@DiscriminatorValue("BLOG")
@PrimaryKeyJoinColumn(name = "id")
public class BlogPost extends Content {

    @Column(name = "body_md", columnDefinition = "text", nullable = false)
    private String bodyMd;
}
