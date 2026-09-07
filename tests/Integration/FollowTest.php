<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\Follow;
use PHPUnit\Framework\TestCase;

final class FollowTest extends TestCase
{
    private PDO $db;

    private int $userAId;
    private int $userBId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->userAId = $this->createUser('follow-a', 'follow-a@example.com');
        $this->userBId = $this->createUser('follow-b', 'follow-b@example.com');
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testFollowCreatesARelationship(): void
    {
        $follow = new Follow();

        $follow->follow($this->userAId, $this->userBId);

        $this->assertTrue($follow->isFollowing($this->userAId, $this->userBId));
        $this->assertSame(1, $follow->countFollowers($this->userBId));
        $this->assertSame(1, $follow->countFollowing($this->userAId));
    }

    public function testFollowIsIdempotent(): void
    {
        $follow = new Follow();

        $follow->follow($this->userAId, $this->userBId);
        $follow->follow($this->userAId, $this->userBId);

        $this->assertSame(1, $follow->countFollowers($this->userBId));
    }

    public function testCannotFollowSelf(): void
    {
        $follow = new Follow();

        $follow->follow($this->userAId, $this->userAId);

        $this->assertFalse(
            $follow->isFollowing($this->userAId, $this->userAId)
        );
        $this->assertSame(0, $follow->countFollowers($this->userAId));
    }

    public function testUnfollowRemovesTheRelationship(): void
    {
        $follow = new Follow();

        $follow->follow($this->userAId, $this->userBId);
        $follow->unfollow($this->userAId, $this->userBId);

        $this->assertFalse($follow->isFollowing($this->userAId, $this->userBId));
        $this->assertSame(0, $follow->countFollowers($this->userBId));
    }

    public function testUnfollowIsNoOpWhenNotFollowing(): void
    {
        $follow = new Follow();

        $follow->unfollow($this->userAId, $this->userBId);

        $this->assertSame(0, $follow->countFollowers($this->userBId));
    }

    public function testCountsAreDirectional(): void
    {
        $follow = new Follow();

        $follow->follow($this->userAId, $this->userBId);

        $this->assertSame(1, $follow->countFollowers($this->userBId));
        $this->assertSame(0, $follow->countFollowers($this->userAId));
        $this->assertSame(1, $follow->countFollowing($this->userAId));
        $this->assertSame(0, $follow->countFollowing($this->userBId));
    }

    public function testDeletingUserCascadesFollows(): void
    {
        $follow = new Follow();

        $follow->follow($this->userAId, $this->userBId);

        $this->db
            ->prepare('DELETE FROM users WHERE id = :id')
            ->execute(['id' => $this->userAId]);

        $this->assertSame(0, $follow->countFollowers($this->userBId));
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

    private function cleanDatabase(): void
    {
        $this->db->exec(
            'TRUNCATE TABLE
                follows,
                team_likes,
                team_pokemon,
                teams,
                users
             RESTART IDENTITY CASCADE'
        );
    }
}
