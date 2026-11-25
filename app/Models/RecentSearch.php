<?php

declare(strict_types=1);

namespace App\Models;

use PDO;
use Throwable;

/**
 * Trainers you opened from search, newest first, for the "Recent" list on
 * an empty trainer search. Every query is scoped to the searcher's user_id,
 * so nobody can see or change anyone else's list.
 */
final class RecentSearch extends Model
{
    /** How many each trainer keeps; older ones are deleted. */
    public const MAX_KEPT = 20;

    /**
     * Put $searchedUserId at the top of $userId's recent searches.
     * Opening your own profile is ignored.
     */
    public function record(int $userId, int $searchedUserId): void
    {
        if ($userId === $searchedUserId) {
            return;
        }

        $this->db->beginTransaction();

        try {
            // Already there: just move it back to the top.
            $this->db
                ->prepare(
                    'INSERT INTO recent_searches (user_id, searched_user_id)
                     VALUES (:user_id, :searched_user_id)
                     ON CONFLICT (user_id, searched_user_id)
                     DO UPDATE SET searched_at = NOW()'
                )
                ->execute([
                    'user_id' => $userId,
                    'searched_user_id' => $searchedUserId,
                ]);

            // Keep the newest MAX_KEPT, so the table can't grow forever.
            $prune = $this->db->prepare(
                'DELETE FROM recent_searches
                 WHERE user_id = :user_id
                   AND id NOT IN (
                       SELECT id
                       FROM recent_searches
                       WHERE user_id = :user_id
                       ORDER BY searched_at DESC, id DESC
                       LIMIT :keep
                   )'
            );

            $prune->bindValue('user_id', $userId, PDO::PARAM_INT);
            $prune->bindValue('keep', self::MAX_KEPT, PDO::PARAM_INT);
            $prune->execute();

            $this->db->commit();
        } catch (Throwable $exception) {
            $this->db->rollBack();

            throw $exception;
        }
    }

    /**
     * @return list<array{
     *     id: int,
     *     username: string,
     *     display_name: ?string,
     *     avatar_pokemon_id: ?int
     * }>
     */
    public function findForUser(int $userId, int $limit): array
    {
        $statement = $this->db->prepare(
            'SELECT
                users.id,
                users.username,
                users.display_name,
                users.avatar_pokemon_id
             FROM recent_searches
             JOIN users ON users.id = recent_searches.searched_user_id
             WHERE recent_searches.user_id = :user_id
             ORDER BY recent_searches.searched_at DESC, recent_searches.id DESC
             LIMIT :limit'
        );

        $statement->bindValue('user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue('limit', max(0, $limit), PDO::PARAM_INT);
        $statement->execute();

        return array_map(
            static fn (array $row): array => [
                'id' => (int) $row['id'],
                'username' => (string) $row['username'],
                'display_name' => $row['display_name'],
                'avatar_pokemon_id' => $row['avatar_pokemon_id'] !== null
                    ? (int) $row['avatar_pokemon_id']
                    : null,
            ],
            $statement->fetchAll(PDO::FETCH_ASSOC)
        );
    }

    public function remove(int $userId, int $searchedUserId): void
    {
        $this->db
            ->prepare(
                'DELETE FROM recent_searches
                 WHERE user_id = :user_id AND searched_user_id = :searched_user_id'
            )
            ->execute([
                'user_id' => $userId,
                'searched_user_id' => $searchedUserId,
            ]);
    }

    public function clear(int $userId): void
    {
        $this->db
            ->prepare('DELETE FROM recent_searches WHERE user_id = :user_id')
            ->execute(['user_id' => $userId]);
    }
}
