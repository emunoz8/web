package com.compilingjava.auth.repository;

import com.compilingjava.auth.model.PasswordResetToken;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
  Optional<PasswordResetToken> findByToken(String token);

  Optional<PasswordResetToken> findByTokenHash(String tokenHash);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select t from PasswordResetToken t where t.token = :token")
  Optional<PasswordResetToken> findByTokenForUpdate(@Param("token") String token);

  @Query("""
          select t from PasswordResetToken t
          where t.token = :token
            and t.usedAt is null
            and t.expiresAt > :now
      """)
  Optional<PasswordResetToken> findActiveByToken(@Param("token") UUID token,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
          update PasswordResetToken t
             set t.usedAt = :now
           where t.token = :token
             and t.usedAt is null
      """)
  int markUsed(@Param("token") UUID token, @Param("now") Instant now);

  // Your “expire old unused tokens” method (by userId)
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
          update PasswordResetToken t
             set t.expiresAt = :now
           where t.user.id = :userId
             and t.usedAt is null
             and t.expiresAt > :now
      """)
  int markAllUnusedTokensExpiredForUser(@Param("userId") Long userId, @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
          delete from PasswordResetToken t
           where t.usedAt is not null
              or t.expiresAt < :now
      """)
  int cleanup(@Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
        delete from PasswordResetToken t
        where t.expiresAt < : now
      """)
  int deleteAllExpired(@Param("now") Instant now);

}
