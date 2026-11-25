<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\RecentSearch;
use PHPUnit\Framework\TestCase;

final class RecentSearchTest extends TestCase
{
    private PDO $db;

    private RecentSearch $recent;

    private int $searcherId;
    private int $otherSearcherId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->recent = new RecentSearch();
        $this->searcherId = $this->createUser('searcher');
        $this->otherSearcherId = $this->createUser('other-searcher');
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testNewestSearchesComeFirst(): void
    {
        $cynthiaId = $this->createUser('cynthia');
        $leonId = $this->createUser('leon');

        $this->recent->record($this->searcherId, $cynthiaId);
        $this->recent->record($this->searcherId, $leonId);

        $this->assertSame(['leon', 'cynthia'], $this->usernames($this->searcherId));
    }

    public function testSearchingAgainMovesATrainerBackToTheTop(): void
    {
        $cynthiaId = $this->createUser('cynthia');
        $leonId = $this->createUser('leon');

        $this->recent->record($this->searcherId, $cynthiaId);
        $this->recent->record($this->searcherId, $leonId);
        $this->recent->record($this->searcherId, $cynthiaId);

        // Moved, not listed twice.
        $this->assertSame(['cynthia', 'leon'], $this->usernames($this->searcherId));
    }

    public function testYourOwnProfileIsNeverRecorded(): void
    {
        $this->recent->record($this->searcherId, $this->searcherId);

        $this->assertSame([], $this->usernames($this->searcherId));
    }

    public function testOnlyTheNewestAreKept(): void
    {
        $ids = [];

        for ($i = 1; $i <= RecentSearch::MAX_KEPT + 2; $i++) {
            $ids[] = $this->createUser("trainer_{$i}");
            $this->recent->record($this->searcherId, end($ids));
        }

        $usernames = $this->usernames($this->searcherId, 100);

        $this->assertCount(RecentSearch::MAX_KEPT, $usernames);
        $this->assertSame('trainer_' . (RecentSearch::MAX_KEPT + 2), $usernames[0]);
        $this->assertNotContains('trainer_1', $usernames);
        $this->assertNotContains('trainer_2', $usernames);

        // The old rows are gone from the table, not just hidden.
        $this->assertSame(RecentSearch::MAX_KEPT, $this->rowCount());
    }

    public function testEachTrainerOnlySeesTheirOwnSearches(): void
    {
        $cynthiaId = $this->createUser('cynthia');
        $leonId = $this->createUser('leon');

        $this->recent->record($this->searcherId, $cynthiaId);
        $this->recent->record($this->otherSearcherId, $leonId);

        $this->assertSame(['cynthia'], $this->usernames($this->searcherId));
        $this->assertSame(['leon'], $this->usernames($this->otherSearcherId));
    }

    public function testRemoveTakesOutOneTrainerFromYourListOnly(): void
    {
        $cynthiaId = $this->createUser('cynthia');
        $leonId = $this->createUser('leon');

        $this->recent->record($this->searcherId, $cynthiaId);
        $this->recent->record($this->searcherId, $leonId);
        $this->recent->record($this->otherSearcherId, $cynthiaId);

        $this->recent->remove($this->searcherId, $cynthiaId);

        $this->assertSame(['leon'], $this->usernames($this->searcherId));
        $this->assertSame(['cynthia'], $this->usernames($this->otherSearcherId));
    }

    public function testClearEmptiesYourListOnly(): void
    {
        $cynthiaId = $this->createUser('cynthia');

        $this->recent->record($this->searcherId, $cynthiaId);
        $this->recent->record($this->otherSearcherId, $cynthiaId);

        $this->recent->clear($this->searcherId);

        $this->assertSame([], $this->usernames($this->searcherId));
        $this->assertSame(['cynthia'], $this->usernames($this->otherSearcherId));
    }

    public function testDeletedTrainersDisappearFromRecentSearches(): void
    {
        $cynthiaId = $this->createUser('cynthia');

        $this->recent->record($this->searcherId, $cynthiaId);

        $this->db
            ->prepare('DELETE FROM users WHERE id = :id')
            ->execute(['id' => $cynthiaId]);

        $this->assertSame([], $this->usernames($this->searcherId));
    }

    public function testRowsIncludeProfileFieldsButNoPrivateOnes(): void
    {
        $dawnId = $this->createUser('dawn');

        $this->db
            ->prepare(
                'UPDATE users
                 SET display_name = :display_name, avatar_pokemon_id = 393
                 WHERE id = :id'
            )
            ->execute(['display_name' => 'Dawn', 'id' => $dawnId]);

        $this->recent->record($this->searcherId, $dawnId);

        $trainer = $this->recent->findForUser($this->searcherId, 10)[0];

        $this->assertSame($dawnId, $trainer['id']);
        $this->assertSame('Dawn', $trainer['display_name']);
        $this->assertSame(393, $trainer['avatar_pokemon_id']);
        $this->assertArrayNotHasKey('email', $trainer);
    }

    /**
     * @return list<string>
     */
    private function usernames(int $userId, int $limit = 10): array
    {
        return array_column($this->recent->findForUser($userId, $limit), 'username');
    }

    private function rowCount(): int
    {
        return (int) $this->db
            ->query('SELECT COUNT(*) FROM recent_searches')
            ->fetchColumn();
    }

    private function createUser(string $username): int
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
            'email' => $username . '@example.com',
            'password_hash' => password_hash('test-password', PASSWORD_DEFAULT),
        ]);

        return (int) $statement->fetchColumn();
    }

    private function cleanDatabase(): void
    {
        $this->db->exec(
            'TRUNCATE TABLE
                recent_searches,
                follows,
                team_likes,
                team_pokemon,
                teams,
                users
             RESTART IDENTITY CASCADE'
        );
    }
}
