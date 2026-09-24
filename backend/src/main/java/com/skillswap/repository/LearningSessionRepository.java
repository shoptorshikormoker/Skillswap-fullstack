package com.skillswap.repository;

import com.skillswap.entity.LearningSession;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearningSessionRepository extends JpaRepository<LearningSession, Long> {
    boolean existsByExchangeRequestId(Long exchangeRequestId);

    @Query("""
            select session from LearningSession session
            join fetch session.exchangeRequest exchange
            join fetch exchange.sender
            join fetch exchange.receiver
            join fetch exchange.offeredSkill
            join fetch exchange.wantedSkill
            where exchange.sender.id = :userId or exchange.receiver.id = :userId
            order by session.scheduledAt desc
            """)
    List<LearningSession> findAllForParticipant(@Param("userId") Long userId);
}
