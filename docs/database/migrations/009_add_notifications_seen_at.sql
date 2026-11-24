BEGIN;

-- Notifications are read straight from follows and team_likes, so the only
-- new state is when the trainer last opened /notifications: anything newer
-- is unread.
--
-- Existing accounts start at the time this migration runs, so nobody gets a
-- badge for every follow and like they've ever had. New accounts start at
-- sign-up.
ALTER TABLE users
ADD COLUMN notifications_seen_at TIMESTAMP NOT NULL DEFAULT NOW();

INSERT INTO migrations (filename, applied_at)
VALUES ('009_add_notifications_seen_at.sql', NOW());

COMMIT;
