<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\Follow;
use App\Models\Team;
use App\Models\TeamLike;
use PHPUnit\Framework\TestCase;

final class DashboardFeedTest extends TestCase
{
    private PDO $db;

    private int $userAId;
    private int $userBId;
    private int $userCId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->userAId = $this->createUser('feed-a', 'feed-a@example.com');
        $this->userBId = $this->createUser('feed-b', 'feed-b@example.com');
        $this->userCId = $this->createUser('feed-c', 'feed-c@example.com');
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testPopularOrdersByLikeCount(): void
    {
        $noLikes = $this->createTeam($this->userAId, 'No Likes', true);
        $oneLike = $this->createTeam($this->userAId, 'One Like', true);
        $twoLikes = $this->createTeam($this->userAId, 'Two Likes', true);

        $likes = new TeamLike();
        $likes->like($this->userBId, $oneLike);
        $likes->like($this->userBId, $twoLikes);
        $likes->like($this->userCId, $twoLikes);

        $ids = array_map(
            static fn (array $team): int => (int) $team['id'],
            (new Team())->findPopularPublic(10)
        );

        $this->assertSame([$twoLikes, $oneLike, $noLikes], $ids);
    }

    public function testRecentOrdersByNewestFirst(): void
    {
        $older = $this->createTeam($this->userAId, 'Older', true);
        $newer = $this->createTeam($this->userAId, 'Newer', true);

        $ids = array_map(
            static fn (array $team): int => (int) $team['id'],
            (new Team())->findRecentPublic(10)
        );

        $this->assertSame([$newer, $older], $ids);
    }

    public function testFeedsOnlyIncludePublicTeams(): void
    {
        $public = $this->createTeam($this->userAId, 'Public', true);
        $this->createTeam($this->userAId, 'Private', false);

        $teamModel = new Team();

        $popularIds = array_column($teamModel->findPopularPublic(10), 'id');
        $recentIds = array_column($teamModel->findRecentPublic(10), 'id');

        $this->assertSame([$public], array_map('intval', $popularIds));
        $this->assertSame([$public], array_map('intval', $recentIds));
    }

    public function testFollowingFeedIsScopedToFollowedUsers(): void
    {
        $followedTeam = $this->createTeam($this->userBId, 'B Public', true);
        $this->createTeam($this->userCId, 'C Public', true);

        (new Follow())->follow($this->userAId, $this->userBId);

        $ids = array_map(
            static fn (array $team): int => (int) $team['id'],
            (new Team())->findPublicFromFollowedBy($this->userAId, 10)
        );

        $this->assertSame([$followedTeam], $ids);
    }

    public function testFollowingFeedExcludesPrivateTeamsOfFollowedUsers(): void
    {
        $this->createTeam($this->userBId, 'B Private', false);

        (new Follow())->follow($this->userAId, $this->userBId);

        $this->assertSame(
            [],
            (new Team())->findPublicFromFollowedBy($this->userAId, 10)
        );
    }

    public function testFeedLimitIsRespected(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->createTeam($this->userAId, "Team {$i}", true);
        }

        $this->assertCount(
            2,
            (new Team())->findRecentPublic(2)
        );
    }

    private function createUser(string $username, string $email): int
    {
        $statement = $this->db->prepare(
            '
            INSERT INTO users (username, email, password_hash)
            VALUES (:username, :email, :password_hash)
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

    private function createTeam(
        int $userId,
        string $name,
        bool $isPublic
    ): int {
        $statement = $this->db->prepare(
            '
            INSERT INTO teams (user_id, name, notes, is_public)
            VALUES (:user_id, :name, NULL, :is_public)
            RETURNING id
            '
        );

        $statement->execute([
            'user_id' => $userId,
            'name' => $name,
            'is_public' => (int) $isPublic,
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
