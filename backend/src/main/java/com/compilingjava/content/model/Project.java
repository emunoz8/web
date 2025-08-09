package com.compilingjava.content.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
@Entity
@Table(name = "projects")
@DiscriminatorValue("PROJECT")
@PrimaryKeyJoinColumn(name = "id")
public class Project extends Content {

    @Column(columnDefinition = "text", nullable = false)
    private String description;
}
