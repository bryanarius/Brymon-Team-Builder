<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

final class Follow
{
    private PDO $database;

    public function __construct()
    {
        $this->database = Database::connection();
    }

    public function follow(int $followerId, int $followedId): void
    {
        if ($followerId === $followedId) {
            return;
        }

        $statement = $this->database->prepare(
            '
            INSERT INTO follows (follower_id, followed_id)
            VALUES (:follower_id, :followed_id)
            ON CONFLICT (follower_id, followed_id) DO NOTHING
            '
        );

        $statement->execute([
            'follower_id' => $followerId,
            'followed_id' => $followedId,
        ]);
    }

    public function unfollow(int $followerId, int $followedId): void
    {
        $statement = $this->database->prepare(
            '
            DELETE FROM follows
            WHERE follower_id = :follower_id
            AND followed_id = :followed_id
            '
        );

        $statement->execute([
            'follower_id' => $followerId,
            'followed_id' => $followedId,
        ]);
    }

    public function isFollowing(int $followerId, int $followedId): bool
    {
        $statement = $this->database->prepare(
            '
            SELECT 1
            FROM follows
            WHERE follower_id = :follower_id
            AND followed_id = :followed_id
            LIMIT 1
            '
        );

        $statement->execute([
            'follower_id' => $followerId,
            'followed_id' => $followedId,
        ]);

        return $statement->fetchColumn() !== false;
    }

    public function countFollowers(int $userId): int
    {
        $statement = $this->database->prepare(
            'SELECT COUNT(*) FROM follows WHERE followed_id = :user_id'
        );

        $statement->execute([
            'user_id' => $userId,
        ]);

        return (int) $statement->fetchColumn();
    }

    public function countFollowing(int $userId): int
    {
        $statement = $this->database->prepare(
            'SELECT COUNT(*) FROM follows WHERE follower_id = :user_id'
        );

        $statement->execute([
            'user_id' => $userId,
        ]);

        return (int) $statement->fetchColumn();
    }

    /**
     * Trainers who follow $userId, most recent first.
     *
     * @return list<array{
     *     id: int,
     *     username: string,
     *     display_name: ?string,
     *     avatar_pokemon_id: ?int,
     *     followed_at: string
     * }>
     */
    public function findFollowers(int $userId, int $limit, int $offset = 0): array
    {
        return $this->findTrainers('followed_id', 'follower_id', $userId, $limit, $offset);
    }

    /**
     * Trainers $userId follows, most recent first.
     *
     * @return list<array{
     *     id: int,
     *     username: string,
     *     display_name: ?string,
     *     avatar_pokemon_id: ?int,
     *     followed_at: string
     * }>
     */
    public function findFollowing(int $userId, int $limit, int $offset = 0): array
    {
        return $this->findTrainers('follower_id', 'followed_id', $userId, $limit, $offset);
    }

    /**
     * Of $userIds, which $viewerId follows and which follow $viewerId, for
     * the Follow / Following / Follow back buttons on one page of a list.
     * One query, however many rows the page has.
     *
     * @param list<int> $userIds
     *
     * @return array{following: list<int>, followers: list<int>}
     */
    public function findRelationshipsWith(int $viewerId, array $userIds): array
    {
        $relationships = ['following' => [], 'followers' => []];

        if ($userIds === []) {
            return $relationships;
        }

        $statement = $this->database->prepare(
            "
            SELECT
                CASE
                    WHEN follower_id = :viewer_id THEN followed_id
                    ELSE follower_id
                END AS user_id,
                follower_id = :viewer_id AS viewer_follows
            FROM follows
            WHERE (follower_id = :viewer_id AND followed_id = ANY(:user_ids::int[]))
               OR (followed_id = :viewer_id AND follower_id = ANY(:user_ids::int[]))
            "
        );

        $statement->execute([
            'viewer_id' => $viewerId,
            // A PostgreSQL array literal of whole numbers, e.g. {3,8,21}.
            'user_ids' => '{' . implode(',', array_map('intval', $userIds)) . '}',
        ]);

        foreach ($statement->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $key = $row['viewer_follows'] ? 'following' : 'followers';
            $relationships[$key][] = (int) $row['user_id'];
        }

        return $relationships;
    }

    /**
     * One query for both lists: match $userId in one column, list the
     * trainers in the other. The column names come only from the two
     * methods above, never from a request.
     *
     * The (follower_id, followed_id) unique index serves the following
     * list, and idx_follows_followed_id the followers list.
     */
    private function findTrainers(
        string $matchColumn,
        string $trainerColumn,
        int $userId,
        int $limit,
        int $offset,
    ): array {
        $statement = $this->database->prepare(
            "
            SELECT
                users.id,
                users.username,
                users.display_name,
                users.avatar_pokemon_id,
                follows.created_at AS followed_at
            FROM follows
            JOIN users ON users.id = follows.{$trainerColumn}
            WHERE follows.{$matchColumn} = :user_id
            -- id breaks ties, so pages never repeat or skip a trainer.
            ORDER BY follows.created_at DESC, follows.id DESC
            LIMIT :limit OFFSET :offset
            "
        );

        $statement->bindValue('user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue('limit', max(0, $limit), PDO::PARAM_INT);
        $statement->bindValue('offset', max(0, $offset), PDO::PARAM_INT);
        $statement->execute();

        return array_map(
            static fn (array $row): array => [
                'id' => (int) $row['id'],
                'username' => (string) $row['username'],
                'display_name' => $row['display_name'],
                'avatar_pokemon_id' => $row['avatar_pokemon_id'] !== null
                    ? (int) $row['avatar_pokemon_id']
                    : null,
                'followed_at' => (string) $row['followed_at'],
            ],
            $statement->fetchAll(PDO::FETCH_ASSOC)
        );
    }
}
