package com.skillswap.repository;

import com.skillswap.entity.Message;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByExchangeRequestIdOrderBySentAtAsc(Long exchangeRequestId);
}
