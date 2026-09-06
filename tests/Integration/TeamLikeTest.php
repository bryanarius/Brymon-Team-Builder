<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\TeamLike;
use PHPUnit\Framework\TestCase;

final class TeamLikeTest extends TestCase
{
    private PDO $db;

    private int $userAId;
    private int $userBId;
    private int $teamId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->userAId = $this->createUser('like-user-a', 'like-a@example.com');
        $this->userBId = $this->createUser('like-user-b', 'like-b@example.com');
        $this->teamId = $this->createTeam($this->userAId, 'Likeable Team');
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testLikeAddsARow(): void
    {
        $likes = new TeamLike();

        $likes->like($this->userBId, $this->teamId);

        $this->assertSame(1, $likes->countForTeam($this->teamId));
        $this->assertTrue($likes->isLikedBy($this->userBId, $this->teamId));
    }

    public function testLikeIsIdempotent(): void
    {
        $likes = new TeamLike();

        $likes->like($this->userBId, $this->teamId);
        $likes->like($this->userBId, $this->teamId);

        $this->assertSame(1, $likes->countForTeam($this->teamId));
    }

    public function testUnlikeRemovesTheLike(): void
    {
        $likes = new TeamLike();

        $likes->like($this->userBId, $this->teamId);
        $likes->unlike($this->userBId, $this->teamId);

        $this->assertSame(0, $likes->countForTeam($this->teamId));
        $this->assertFalse($likes->isLikedBy($this->userBId, $this->teamId));
    }

    public function testUnlikeIsNoOpWhenNotLiked(): void
    {
        $likes = new TeamLike();

        $likes->unlike($this->userBId, $this->teamId);

        $this->assertSame(0, $likes->countForTeam($this->teamId));
    }

    public function testCountReflectsMultipleUsers(): void
    {
        $likes = new TeamLike();

        $likes->like($this->userAId, $this->teamId);
        $likes->like($this->userBId, $this->teamId);

        $this->assertSame(2, $likes->countForTeam($this->teamId));
    }

    public function testDeletingTeamCascadesLikes(): void
    {
        $likes = new TeamLike();

        $likes->like($this->userBId, $this->teamId);

        $this->db
            ->prepare('DELETE FROM teams WHERE id = :id')
            ->execute(['id' => $this->teamId]);

        $remaining = (int) $this->db->query(
            'SELECT COUNT(*) FROM team_likes'
        )->fetchColumn();

        $this->assertSame(0, $remaining);
    }

    public function testDeletingUserCascadesLikes(): void
    {
        $likes = new TeamLike();

        $likes->like($this->userBId, $this->teamId);

        $this->db
            ->prepare('DELETE FROM users WHERE id = :id')
            ->execute(['id' => $this->userBId]);

        $this->assertSame(0, $likes->countForTeam($this->teamId));
    }

    private function createUser(string $username, string $email): int
    {
        $statement = $this->db->prepare(
            '
            INSERT INTO users (
                username,
                email,
                password_hash
            )
            VALUES (
                :username,
                :email,
                :password_hash
            )
            RETURNING id
            '
        );

        $statement->execute([
            'username' => $username,
            'email' => $email,
            'password_hash' => password_hash('test-password', PASSWORD_DEFAULT),
        ]);

        return (int) $statement->fetchColumn();
    }

    private function createTeam(int $userId, string $name): int
    {
        $statement = $this->db->prepare(
            '
            INSERT INTO teams (
                user_id,
                name,
                notes
            )
            VALUES (
                :user_id,
                :name,
                :notes
            )
            RETURNING id
            '
        );

        $statement->execute([
            'user_id' => $userId,
            'name' => $name,
            'notes' => null,
        ]);

        return (int) $statement->fetchColumn();
    }

    private function cleanDatabase(): void
    {
        $this->db->exec(
            'TRUNCATE TABLE
                team_likes,
                team_pokemon,
                teams,
                users
             RESTART IDENTITY CASCADE'
        );
    }
}
