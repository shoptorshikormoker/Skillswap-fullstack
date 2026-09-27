CREATE TABLE IF NOT EXISTS messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    exchange_request_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    sent_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_messages_exchange_sent (exchange_request_id, sent_at),
    CONSTRAINT fk_messages_exchange FOREIGN KEY (exchange_request_id) REFERENCES exchange_requests (id),
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id)
);
