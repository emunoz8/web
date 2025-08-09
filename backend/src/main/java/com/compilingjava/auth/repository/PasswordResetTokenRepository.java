package com.compilingjava.auth.repository;

import com.compilingjava.auth.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    @Query("""
            select p from PasswordResetToken p
            where p.token = :token
              and p.usedAt is null
              and p.expiresAt > :now
            """)
    Optional<PasswordResetToken> findActiveByToken(@Param("token") UUID token, @Param("now") Instant now);

    @Modifying
    @Query("""
            update PasswordResetToken p
               set p.expiresAt = :now
             where p.user.id = :userId
               and p.usedAt is null
               and p.expiresAt > :now
            """)
    int markAllUnusedTokensExpiredForUser(@Param("userId") Long userId, @Param("now") Instant now);

    @Modifying
    @Query("""
            delete from PasswordResetToken p
             where p.user.id = :userId
               and (p.usedAt is not null or p.expiresAt <= :now)
            """)
    int deleteAllExpiredForUser(@Param("userId") Long userId, @Param("now") Instant now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    int deleteAllExpired(@Param("now") Instant now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PasswordResetToken t WHERE t.user.id = :userId AND t.expiresAt < :now")
    int deleteExpiredByUserId(@Param("userId") Long userId, @Param("now") Instant now);

}
