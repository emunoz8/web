// src/main/java/com/compilingjava/comment/dto/CommentTreeDto.java
package com.compilingjava.comment.dto;

import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentTreeDto {
    private Long id;
    private Long parentId;
    private Long userId;
    private String username;
    private String body;
    private Instant createdAt;
    @Builder.Default
    private List<CommentTreeDto> children = new ArrayList<>();
}
