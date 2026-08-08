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