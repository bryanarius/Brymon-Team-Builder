BEGIN;

ALTER TABLE teams
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_teams_is_public
ON teams (is_public)
WHERE is_public = TRUE;

INSERT INTO migrations (filename, applied_at)
VALUES ('004_add_team_visibility.sql', NOW());

COMMIT;
