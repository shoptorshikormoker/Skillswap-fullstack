ALTER TABLE profiles
    ADD COLUMN gender VARCHAR(24) NULL AFTER photo_url;

ALTER TABLE profiles
    ADD CONSTRAINT chk_profiles_gender
    CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'));

-- Optional sample-user values. Remove this block if these accounts do not exist.
UPDATE profiles AS p
JOIN users AS u ON u.id = p.user_id
SET p.gender = CASE u.email
    WHEN 'ayesha.rahman@example.com' THEN 'FEMALE'
    WHEN 'tanvir.hasan@example.com' THEN 'MALE'
    WHEN 'nusrat.jahan@example.com' THEN 'FEMALE'
    WHEN 'sakib.ahmed@example.com' THEN 'MALE'
    WHEN 'farhana.islam@example.com' THEN 'FEMALE'
    WHEN 'mehedi.hasan@example.com' THEN 'MALE'
    ELSE p.gender
END
WHERE u.email IN (
    'ayesha.rahman@example.com',
    'tanvir.hasan@example.com',
    'nusrat.jahan@example.com',
    'sakib.ahmed@example.com',
    'farhana.islam@example.com',
    'mehedi.hasan@example.com'
);
