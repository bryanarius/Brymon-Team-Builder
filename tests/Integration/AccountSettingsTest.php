<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\User;
use PHPUnit\Framework\TestCase;

final class AccountSettingsTest extends TestCase
{
    private PDO $db;

    private int $userId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->userId = $this->createUser(
            'test-account-user',
            'account-user@example.com'
        );
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testUpdateUsernamePersistsNewValue(): void
    {
        $userModel = new User();

        $this->assertTrue(
            $userModel->updateUsername($this->userId, 'updated-username')
        );

        $user = $userModel->findById($this->userId);

        $this->assertSame('updated-username', $user['username']);
    }

    public function testUpdatePasswordPersistsNewHash(): void
    {
        $userModel = new User();

        $newHash = password_hash('new-password', PASSWORD_DEFAULT);

        $this->assertTrue(
            $userModel->updatePassword($this->userId, $newHash)
        );

        $user = $userModel->findById($this->userId);

        $this->assertSame($newHash, $user['password_hash']);
        $this->assertTrue(
            password_verify('new-password', $user['password_hash'])
        );
        $this->assertFalse(
            password_verify('test-password', $user['password_hash'])
        );
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

    private function cleanDatabase(): void
    {
        $this->db->exec(
            'TRUNCATE TABLE users RESTART IDENTITY CASCADE'
        );
    }
}
