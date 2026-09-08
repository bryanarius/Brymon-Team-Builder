BEGIN;

ALTER TABLE users
ADD COLUMN display_name VARCHAR(50) NULL,
ADD COLUMN bio VARCHAR(300) NULL,
ADD COLUMN avatar_pokemon_id INTEGER NULL;

-- Usernames are already unique (users_username_key) and registration
-- checks case-insensitively; this makes the database enforce that too,
-- so "Bryan" and "bryan" can never coexist as separate accounts.
CREATE UNIQUE INDEX users_username_lower_key ON users (LOWER(username));

INSERT INTO migrations (filename, applied_at)
VALUES ('007_add_profile_fields.sql', NOW());

COMMIT;
