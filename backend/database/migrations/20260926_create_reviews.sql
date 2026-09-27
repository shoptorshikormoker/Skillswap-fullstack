CREATE TABLE reviews (
    id BIGINT NOT NULL AUTO_INCREMENT,
    learning_session_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewed_user_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(1000) NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_reviews_session_reviewer UNIQUE (learning_session_id, reviewer_id),
    CONSTRAINT fk_reviews_session FOREIGN KEY (learning_session_id) REFERENCES learning_sessions (id),
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id),
    CONSTRAINT fk_reviews_reviewed_user FOREIGN KEY (reviewed_user_id) REFERENCES users (id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_reviewed_user_created
    ON reviews (reviewed_user_id, created_at);
