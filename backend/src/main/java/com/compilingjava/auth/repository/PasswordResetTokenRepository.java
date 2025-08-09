package com.compilingjava.auth.repository;

import com.compilingjava.auth.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.compilingjava.user.model.User;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

        @Query("""
                        select t from PasswordResetToken t
                        where t.token = :token
                          and t.used = false
                          and t.expiresAt > :now
                        """)
        Optional<PasswordResetToken> findActiveByToken(@Param("token") UUID token, @Param("now") Instant now);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("""
                        update PasswordResetToken t
                           set t.used = true, t.usedAt = :now
                         where t.token = :token and t.used = false
                        """)
        int markUsed(@Param("token") UUID token, @Param("now") Instant now);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("""
                        update PasswordResetToken t
                           set t.used = true, t.usedAt = :now
                         where t.user = :user and t.used = false
                        """)
        int revokeAllForUser(@Param("user") User user, @Param("now") Instant now);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("delete from PasswordResetToken t where t.expiresAt < :now or t.used = true")
        int cleanup(@Param("now") Instant now);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("""
                           update PasswordResetToken t
                              set t.expiresAt = :now
                            where t.user.id = :userId
                              and t.usedAt is null
                              and t.expiresAt > :now
                        """)
        int markAllUnusedTokensExpiredForUser(@Param("userId") Long userId, @Param("now") Instant now);

}
