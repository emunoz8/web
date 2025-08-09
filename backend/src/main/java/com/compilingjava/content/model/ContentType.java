// src/main/java/com/compilingjava/content/model/ContentType.java
package com.compilingjava.content.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ContentType {
    PROJECT, BLOG;

    // Nice-to-have: makes JSON & query params case-insensitive if you ever bind it directly
    @JsonCreator
    public static ContentType from(String value) {
        return value == null ? null : ContentType.valueOf(value.trim().toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}
