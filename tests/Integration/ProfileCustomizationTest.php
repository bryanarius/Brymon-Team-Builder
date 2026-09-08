<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\Team;
use App\Models\User;
use PHPUnit\Framework\TestCase;

final class ProfileCustomizationTest extends TestCase
{
    private PDO $db;

    private int $userId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->userId = $this->createUser(
            'profile-user',
            'profile-user@example.com'
        );
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testUpdateProfilePersistsAllFields(): void
    {
        $userModel = new User();

        $this->assertTrue(
            $userModel->updateProfile(
                $this->userId,
                'Ash K.',
                'Gotta test them all.',
                25
            )
        );

        $user = $userModel->findById($this->userId);

        $this->assertSame('Ash K.', $user['display_name']);
        $this->assertSame('Gotta test them all.', $user['bio']);
        $this->assertSame(25, (int) $user['avatar_pokemon_id']);
    }

    public function testUpdateProfileClearsFieldsWhenNull(): void
    {
        $userModel = new User();

        $userModel->updateProfile($this->userId, 'Ash K.', 'A bio.', 25);
        $this->assertTrue(
            $userModel->updateProfile($this->userId, null, null, null)
        );

        $user = $userModel->findById($this->userId);

        $this->assertNull($user['display_name']);
        $this->assertNull($user['bio']);
        $this->assertNull($user['avatar_pokemon_id']);
    }

    public function testFindByUsernameReturnsProfileFields(): void
    {
        (new User())->updateProfile(
            $this->userId,
            'Ash K.',
            'A bio.',
            25
        );

        $user = (new User())->findByUsername('profile-user');

        $this->assertSame('Ash K.', $user['display_name']);
        $this->assertSame('A bio.', $user['bio']);
        $this->assertSame(25, (int) $user['avatar_pokemon_id']);
    }

    public function testFindByUsernameIsCaseInsensitive(): void
    {
        $user = (new User())->findByUsername('PROFILE-USER');

        $this->assertNotFalse($user);
        $this->assertSame($this->userId, (int) $user['id']);
    }

    public function testUsernameUniquenessIsCaseInsensitive(): void
    {
        $this->expectException(PDOException::class);

        $statement = $this->db->prepare(
            'INSERT INTO users (username, email, password_hash)
             VALUES (:username, :email, :password_hash)'
        );

        $statement->execute([
            'username' => 'Profile-User',
            'email' => 'clash@example.com',
            'password_hash' => password_hash('test-password', PASSWORD_DEFAULT),
        ]);
    }

    public function testPopularFeedIncludesOwnerProfileFields(): void
    {
        (new User())->updateProfile($this->userId, 'Ash K.', null, 25);

        $this->createTeam($this->userId, 'Public Team', true);

        $teams = (new Team())->findPopularPublic(10);

        $this->assertCount(1, $teams);
        $this->assertSame('profile-user', $teams[0]['username']);
        $this->assertSame('Ash K.', $teams[0]['display_name']);
        $this->assertSame(25, (int) $teams[0]['avatar_pokemon_id']);
    }

    private function createUser(string $username, string $email): int
    {
        $statement = $this->db->prepare(
            'INSERT INTO users (username, email, password_hash)
             VALUES (:username, :email, :password_hash)
             RETURNING id'
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
            'INSERT INTO teams (user_id, name, notes, is_public)
             VALUES (:user_id, :name, NULL, :is_public)
             RETURNING id'
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
