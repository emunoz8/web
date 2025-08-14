package com.compilingjava.auth.repository;

import com.compilingjava.auth.model.EmailVerificationToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

  /** Look up by JTI (no validity checks). */
  Optional<EmailVerificationToken> findByJti(UUID jti);

  /** Lock a row if you need to run critical section logic. */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select t from EmailVerificationToken t where t.jti = :jti")
  Optional<EmailVerificationToken> findByJtiForUpdate(@Param("jti") UUID jti);

  /** Active = not used and not expired at the given time. */
  @Query("""
      select t from EmailVerificationToken t
       where t.jti = :jti
         and t.used = false
         and t.expiresAt > :now
      """)
  Optional<EmailVerificationToken> findActiveByJti(@Param("jti") UUID jti, @Param("now") Instant now);

  /** Single-use consumption; idempotent (updates only if currently unused). */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      update EmailVerificationToken t
         set t.used = true, t.usedAt = :now
       where t.jti = :jti
         and t.used = false
      """)
  int consumeByJti(@Param("jti") UUID jti, @Param("now") Instant now);

  /** Revoke any outstanding tokens for an email (e.g., before re-sending). */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      update EmailVerificationToken t
         set t.used = true, t.usedAt = :now
       where t.email = :email
         and t.used = false
      """)
  int revokeAllForEmail(@Param("email") String email, @Param("now") Instant now);

  /**
   * Cleanup: remove expired tokens or those used long ago.
   * Use a cutoff so you retain a short audit tail (e.g., 7 days).
   */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      delete from EmailVerificationToken t
       where t.expiresAt < :cutoff
          or (t.used = true and t.usedAt < :cutoff)
      """)
  int cleanup(@Param("cutoff") Instant cutoff);
}
