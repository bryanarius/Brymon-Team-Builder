BEGIN;

ALTER TABLE users
ADD COLUMN email_verified_at TIMESTAMP NULL,
ADD COLUMN email_verification_token_hash VARCHAR(64) NULL,
ADD COLUMN email_verification_expires_at TIMESTAMP NULL,
ADD COLUMN password_reset_token_hash VARCHAR(64) NULL,
ADD COLUMN password_reset_expires_at TIMESTAMP NULL;

CREATE INDEX idx_users_email_verification_token_hash
ON users (email_verification_token_hash)
WHERE email_verification_token_hash IS NOT NULL;

CREATE INDEX idx_users_password_reset_token_hash
ON users (password_reset_token_hash)
WHERE password_reset_token_hash IS NOT NULL;

UPDATE users
SET email_verified_at = created_at
WHERE email_verified_at IS NULL;

INSERT INTO migrations (filename, applied_at)
VALUES ('003_add_email_verification_and_password_reset.sql', NOW());

COMMIT;