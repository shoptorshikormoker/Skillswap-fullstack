ALTER TABLE learning_sessions
    ADD COLUMN video_room_name VARCHAR(80) NULL AFTER scheduled_at;

UPDATE learning_sessions
SET video_room_name = CONCAT(
    'skillswap-',
    REPLACE(UUID(), '-', ''),
    '-',
    UUID()
)
WHERE video_room_name IS NULL OR video_room_name = '';

ALTER TABLE learning_sessions
    MODIFY video_room_name VARCHAR(80) NOT NULL,
    ADD CONSTRAINT uk_learning_sessions_video_room UNIQUE (video_room_name);
