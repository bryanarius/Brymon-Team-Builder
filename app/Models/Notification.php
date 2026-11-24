<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

/**
 * A trainer's notifications: new followers, and likes on their teams.
 *
 * There's no notifications table. Each notification is a row that already
 * exists in follows or team_likes, so the list can't fall out of sync with
 * them: an unfollow or unlike simply removes it. The only stored state is
 * users.notifications_seen_at, for the unread badge.
 */
final class Notification
{
    /*
     * Both kinds of notification in one shape, so they can be sorted and
     * paged together. :user_id is the trainer receiving them.
     */
    private const NOTIFICATIONS_SQL = "
        SELECT
            'follow' AS type,
            follows.id AS source_id,
            follows.created_at,
            follows.follower_id AS actor_id,
            NULL::INTEGER AS team_id,
            NULL::VARCHAR AS team_name
        FROM follows
        WHERE follows.followed_id = :user_id

        UNION ALL

        SELECT
            'like' AS type,
            team_likes.id AS source_id,
            team_likes.created_at,
            team_likes.user_id AS actor_id,
            teams.id AS team_id,
            teams.name AS team_name
        FROM team_likes
        JOIN teams ON teams.id = team_likes.team_id
        WHERE teams.user_id = :user_id
        -- Liking your own team isn't news.
        AND team_likes.user_id <> :user_id
    ";

    private PDO $database;

    public function __construct()
    {
        $this->database = Database::connection();
    }

    /**
     * Newest first.
     *
     * @return list<array{
     *     type: 'follow'|'like',
     *     created_at: string,
     *     age_seconds: int,
     *     is_unread: bool,
     *     actor_id: int,
     *     actor_username: string,
     *     actor_display_name: ?string,
     *     actor_avatar_pokemon_id: ?int,
     *     team_id: ?int,
     *     team_name: ?string
     * }>
     */
    public function findForUser(int $userId, int $limit, int $offset = 0): array
    {
        $statement = $this->database->prepare(
            '
            SELECT
                notifications.type,
                notifications.created_at,
                notifications.team_id,
                notifications.team_name,
                -- Worked out here, so PHP and PostgreSQL time zones never disagree.
                FLOOR(EXTRACT(EPOCH FROM NOW() - notifications.created_at))::INTEGER
                    AS age_seconds,
                notifications.created_at > viewer.notifications_seen_at AS is_unread,
                actors.id AS actor_id,
                actors.username AS actor_username,
                actors.display_name AS actor_display_name,
                actors.avatar_pokemon_id AS actor_avatar_pokemon_id
            FROM (' . self::NOTIFICATIONS_SQL . ') AS notifications
            JOIN users AS actors ON actors.id = notifications.actor_id
            JOIN users AS viewer ON viewer.id = :user_id
            -- type and source_id break ties, so pages never repeat or skip.
            ORDER BY
                notifications.created_at DESC,
                notifications.type,
                notifications.source_id DESC
            LIMIT :limit OFFSET :offset
            '
        );

        $statement->bindValue('user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue('limit', max(0, $limit), PDO::PARAM_INT);
        $statement->bindValue('offset', max(0, $offset), PDO::PARAM_INT);
        $statement->execute();

        return array_map(
            static fn (array $row): array => [
                'type' => $row['type'],
                'created_at' => (string) $row['created_at'],
                'age_seconds' => max(0, (int) $row['age_seconds']),
                'is_unread' => (bool) $row['is_unread'],
                'actor_id' => (int) $row['actor_id'],
                'actor_username' => (string) $row['actor_username'],
                'actor_display_name' => $row['actor_display_name'],
                'actor_avatar_pokemon_id' => $row['actor_avatar_pokemon_id'] !== null
                    ? (int) $row['actor_avatar_pokemon_id']
                    : null,
                'team_id' => $row['team_id'] !== null ? (int) $row['team_id'] : null,
                'team_name' => $row['team_name'],
            ],
            $statement->fetchAll(PDO::FETCH_ASSOC)
        );
    }

    /**
     * For the badge in the navigation. Stops counting at $max, since the
     * badge shows "9+" past that anyway.
     */
    public function countUnread(int $userId, int $max = 10): int
    {
        $statement = $this->database->prepare(
            '
            SELECT COUNT(*)
            FROM (
                SELECT 1
                FROM (' . self::NOTIFICATIONS_SQL . ') AS notifications
                WHERE notifications.created_at > (
                    SELECT notifications_seen_at FROM users WHERE id = :user_id
                )
                LIMIT :max
            ) AS unread
            '
        );

        $statement->bindValue('user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue('max', max(0, $max), PDO::PARAM_INT);
        $statement->execute();

        return (int) $statement->fetchColumn();
    }

    public function lastSeenAt(int $userId): ?string
    {
        $statement = $this->database->prepare(
            'SELECT notifications_seen_at FROM users WHERE id = :user_id'
        );

        $statement->execute(['user_id' => $userId]);

        $seenAt = $statement->fetchColumn();

        return $seenAt === false ? null : (string) $seenAt;
    }

    /**
     * Marks everything up to $createdAt as seen: the newest notification
     * the trainer was shown, not "now", so one that arrives while the page
     * loads still counts as unread. Never moves backwards.
     */
    public function markSeenUpTo(int $userId, string $createdAt): void
    {
        $statement = $this->database->prepare(
            '
            UPDATE users
            SET notifications_seen_at = GREATEST(
                notifications_seen_at,
                CAST(:created_at AS TIMESTAMP)
            )
            WHERE id = :user_id
            '
        );

        $statement->execute([
            'user_id' => $userId,
            'created_at' => $createdAt,
        ]);
    }
}
