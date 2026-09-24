package com.skillswap.repository;

import com.skillswap.entity.ExchangeRequest;
import com.skillswap.enums.ExchangeRequestStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExchangeRequestRepository extends JpaRepository<ExchangeRequest, Long> {
    List<ExchangeRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    List<ExchangeRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    boolean existsBySenderIdAndReceiverIdAndOfferedSkillIdAndWantedSkillIdAndStatus(
            Long senderId, Long receiverId, Long offeredSkillId, Long wantedSkillId, ExchangeRequestStatus status);
}
