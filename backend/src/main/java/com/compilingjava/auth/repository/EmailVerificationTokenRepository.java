package com.compilingjava.auth.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.compilingjava.auth.model.EmailVerificationToken;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByJti(UUID jti);

    // Fetch only if it's still usable (avoids extra checks in service)
    @Query("""
            select t from EmailVerificationToken t
            where t.jti = :jti and t.used = false and t.expiresAt > :now
            """)
    Optional<EmailVerificationToken> findValidByJti(@Param("jti") UUID jti, @Param("now") Instant now);

    // Atomically mark as used (prevents replay if two clicks happen quickly)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("""
            update EmailVerificationToken t
               set t.used = true, t.usedAt = :now
             where t.jti = :jti and t.used = false
            """)
    int markUsed(@Param("jti") UUID jti, @Param("now") Instant now);

    // Optional: revoke all outstanding tokens for an email (e.g., when resending)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("""
            update EmailVerificationToken t
               set t.used = true, t.usedAt = :now
             where t.email = :email and t.used = false
            """)
    int revokeAllForEmail(@Param("email") String email, @Param("now") Instant now);

    // Periodic cleanup
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("delete from EmailVerificationToken t where t.expiresAt < :now or t.used = true")
    int cleanup(@Param("now") Instant now);
}
