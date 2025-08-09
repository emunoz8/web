package com.compilingjava.auth.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;
import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true)
    private UUID jti;
    @Column(nullable = false)
    private String email;
    @Column(nullable = false)
    private Instant issuedAt = Instant.now();
    @Column(nullable = false)
    private Instant expiresAt;
    @Column(nullable = false)
    private boolean used = false;
    private Instant usedAt;

}