package com.ptit.bigdata.coreservice.core.auth.repository;

import com.ptit.bigdata.coreservice.core.auth.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
    List<Token> findByUserId(Long userId);

    Optional<Token> findByToken(String token);

    @Modifying
    @Transactional
    @Query("UPDATE Token t SET t.revoked = true, t.expired = true "
            + "WHERE t.userId = :userId AND (t.revoked = false OR t.expired = false)")
    int revokeActiveTokensByUserId(@Param("userId") Long userId);
}
