<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\Team;
use PHPUnit\Framework\TestCase;

final class TeamOwnershipTest extends TestCase
{
    private PDO $db;

    private int $userAId;
    private int $userBId;
    private int $teamId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->userAId = $this->createUser(
            'test-user-a',
            'user-a@example.com'
        );

        $this->userBId = $this->createUser(
            'test-user-b',
            'user-b@example.com'
        );

        $this->teamId = $this->createTeam(
            $this->userAId,
            'User A Team'
        );
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testOwnerCanAccessTeam(): void
    {
        $teamModel = new Team();

        $team = $teamModel->findByIdAndUserId(
            $this->teamId,
            $this->userAId
        );

        $this->assertNotNull($team);

        $this->assertSame(
            $this->teamId,
            (int) $team['id']
        );

        $this->assertSame(
            $this->userAId,
            (int) $team['user_id']
        );
    }

    public function testDifferentUserCannotAccessTeam(): void
    {
        $teamModel = new Team();

        $team = $teamModel->findByIdAndUserId(
            $this->teamId,
            $this->userBId
        );

        $this->assertNull($team);
    }

    public function testDifferentUserCannotDeleteTeam(): void
    {
        $teamModel = new Team();

        $deleted = $teamModel->deleteByIdAndUserId(
            $this->teamId,
            $this->userBId
        );

        $this->assertFalse($deleted);

        $team = $teamModel->findByIdAndUserId(
            $this->teamId,
            $this->userAId
        );

        $this->assertNotNull($team);
    }

    public function testTeamsWithSetsOnlyIncludeTheUsersOwnTeams(): void
    {
        $teamModel = new Team();

        $setsTeamId = $teamModel->createWithPokemon(
            $this->userAId,
            'User A Sets',
            null,
            [
                [
                    'pokemon_api_id' => 984,
                    'pokemon_name' => 'great-tusk',
                    'slot_number' => 1,
                    'nickname' => 'Tusky',
                    'ability' => 'protosynthesis',
                    'item' => 'booster-energy',
                    'nature' => 'jolly',
                    'move_1' => 'headlong-rush',
                    'attack_ev' => 252,
                    'speed_ev' => 252,
                ],
            ]
        );

        $teamModel->createWithPokemon(
            $this->userBId,
            'User B Sets',
            null,
            [
                [
                    'pokemon_api_id' => 983,
                    'pokemon_name' => 'kingambit',
                    'slot_number' => 1,
                ],
            ]
        );

        $teams = $teamModel->findAllWithSetsByUserId($this->userAId);

        // User A's empty team from setUp() is left out, and User B's is
        // never included.
        $this->assertCount(1, $teams);
        $this->assertSame($setsTeamId, $teams[0]['id']);
        $this->assertSame('User A Sets', $teams[0]['name']);

        $pokemon = $teams[0]['pokemon'][0];

        $this->assertSame('great-tusk', $pokemon['pokemon_name']);
        $this->assertSame('Tusky', $pokemon['nickname']);
        $this->assertSame('booster-energy', $pokemon['item']);
        $this->assertSame('headlong-rush', $pokemon['move_1']);
        $this->assertSame(252, (int) $pokemon['attack_ev']);
    }

    private function createUser(
        string $username,
        string $email
    ): int {
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
            'password_hash' => password_hash(
                'test-password',
                PASSWORD_DEFAULT
            ),
        ]);

        return (int) $statement->fetchColumn();
    }

    private function createTeam(
        int $userId,
        string $name
    ): int {
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
                team_pokemon,
                teams,
                users
             RESTART IDENTITY CASCADE'
        );
    }
}