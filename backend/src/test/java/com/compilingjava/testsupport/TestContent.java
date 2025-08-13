package com.compilingjava.testsupport;

import java.time.Instant;

import com.compilingjava.content.model.Content;

/**
 * Test-only concrete Content so we don't mock final JPA methods.
 * No JPA annotations; we never persist this in unit tests.
 */
public class TestContent extends Content {
    public TestContent(Long id) {
        setId(id); // Lombok setter from Content
        // Optional defaults if you ever need them:
        // setTitle("t");
        // setSlug("s");
        // setCreatedAt(Instant.now());
    }

    // Optional convenience ctor if you want to set more fields in tests
    public TestContent(Long id, Instant createdAt) {
        setId(id);
        setCreatedAt(createdAt);
    }
}
