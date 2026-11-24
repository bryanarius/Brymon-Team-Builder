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

    public function testFollowersListsWhoFollowsAUserNewestFirst(): void
    {
        $follow = new Follow();
        $userCId = $this->createUser('follow-c', 'follow-c@example.com');

        $follow->follow($this->userAId, $userCId);
        $follow->follow($this->userBId, $userCId);

        $followers = $follow->findFollowers($userCId, 10);

        $this->assertSame(
            ['follow-b', 'follow-a'],
            array_column($followers, 'username')
        );
    }

    public function testFollowingListsWhoAUserFollows(): void
    {
        $follow = new Follow();
        $userCId = $this->createUser('follow-c', 'follow-c@example.com');

        $follow->follow($this->userAId, $this->userBId);
        $follow->follow($this->userAId, $userCId);
        // Someone else's follow isn't in A's list.
        $follow->follow($this->userBId, $userCId);

        $this->assertSame(
            ['follow-c', 'follow-b'],
            array_column($follow->findFollowing($this->userAId, 10), 'username')
        );
        $this->assertSame([], $follow->findFollowing($userCId, 10));
    }

    public function testListsIncludeProfileFieldsForTheRows(): void
    {
        $follow = new Follow();

        $this->db
            ->prepare(
                'UPDATE users
                 SET display_name = :display_name, avatar_pokemon_id = 25
                 WHERE id = :id'
            )
            ->execute(['display_name' => 'Ash', 'id' => $this->userAId]);

        $follow->follow($this->userAId, $this->userBId);

        $follower = $follow->findFollowers($this->userBId, 10)[0];

        $this->assertSame($this->userAId, $follower['id']);
        $this->assertSame('Ash', $follower['display_name']);
        $this->assertSame(25, $follower['avatar_pokemon_id']);
        $this->assertArrayNotHasKey('email', $follower);
    }

    public function testListsArePagedWithoutRepeatsOrGaps(): void
    {
        $follow = new Follow();
        $userIds = [];

        for ($i = 1; $i <= 5; $i++) {
            $userIds[] = $this->createUser("fan-{$i}", "fan-{$i}@example.com");
        }

        foreach ($userIds as $userId) {
            $follow->follow($userId, $this->userAId);
        }

        // Same created_at for all: only the id tiebreaker orders them.
        $this->db->exec("UPDATE follows SET created_at = '2026-01-01 00:00:00'");

        $pages = [
            $follow->findFollowers($this->userAId, 2, 0),
            $follow->findFollowers($this->userAId, 2, 2),
            $follow->findFollowers($this->userAId, 2, 4),
        ];

        $this->assertSame(
            ['fan-5', 'fan-4', 'fan-3', 'fan-2', 'fan-1'],
            array_column(array_merge(...$pages), 'username')
        );
        $this->assertSame([], $follow->findFollowers($this->userAId, 2, 6));
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
