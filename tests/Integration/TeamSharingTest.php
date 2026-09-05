<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\Team;
use PHPUnit\Framework\TestCase;

final class TeamSharingTest extends TestCase
{
    private PDO $db;

    private int $ownerId;
    private int $otherUserId;
    private int $teamId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->ownerId = $this->createUser(
            'sharing-owner',
            'sharing-owner@example.com'
        );

        $this->otherUserId = $this->createUser(
            'sharing-other',
            'sharing-other@example.com'
        );

        $this->teamId = $this->createTeam(
            $this->ownerId,
            'Owner Team'
        );
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testTeamIsPrivateByDefault(): void
    {
        $teamModel = new Team();

        $team = $teamModel->findByIdAndUserId(
            $this->teamId,
            $this->ownerId
        );

        $this->assertFalse((bool) $team['is_public']);

        $this->assertNull($teamModel->findPublicById($this->teamId));
    }

    public function testOwnerCanMakeTeamPublic(): void
    {
        $teamModel = new Team();

        $updated = $teamModel->setVisibility(
            $this->teamId,
            $this->ownerId,
            true
        );

        $this->assertTrue($updated);

        $public = $teamModel->findPublicById($this->teamId);

        $this->assertNotNull($public);

        $this->assertSame(
            $this->teamId,
            (int) $public['id']
        );

        $this->assertTrue((bool) $public['is_public']);
    }

    public function testDifferentUserCannotChangeVisibility(): void
    {
        $teamModel = new Team();

        $updated = $teamModel->setVisibility(
            $this->teamId,
            $this->otherUserId,
            true
        );

        $this->assertFalse($updated);

        $this->assertNull($teamModel->findPublicById($this->teamId));
    }

    public function testMakingTeamPrivateRevokesPublicAccess(): void
    {
        $teamModel = new Team();

        $teamModel->setVisibility($this->teamId, $this->ownerId, true);

        $this->assertNotNull($teamModel->findPublicById($this->teamId));

        $reverted = $teamModel->setVisibility(
            $this->teamId,
            $this->ownerId,
            false
        );

        $this->assertTrue($reverted);

        $this->assertNull($teamModel->findPublicById($this->teamId));
    }

    public function testPublicTeamExposesOwnerUsername(): void
    {
        $teamModel = new Team();

        $teamModel->setVisibility($this->teamId, $this->ownerId, true);

        $public = $teamModel->findPublicById($this->teamId);

        $this->assertSame('sharing-owner', $public['username']);
    }

    public function testFindPublicByIdReturnsNullForUnknownTeam(): void
    {
        $teamModel = new Team();

        $this->assertNull($teamModel->findPublicById(999999));
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
