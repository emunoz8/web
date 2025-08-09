// src/main/java/com/compilingjava/comment/dto/CommentCreateRequest.java
package com.compilingjava.comment.dto;

import lombok.Data;

@Data
public class CommentCreateRequest {
    private Long contentId; // required
    private String body; // required
    private Long parentId; // optional (for replies)
}
