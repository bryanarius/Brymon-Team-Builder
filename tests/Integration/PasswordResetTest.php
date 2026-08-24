<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\User;
use PHPUnit\Framework\TestCase;

final class PasswordResetTest extends TestCase
{
    private PDO $db;

    private int $userId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->userId = $this->createUser(
            'test-reset-user',
            'reset-user@example.com'
        );
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testGeneratePasswordResetTokenSetsHashAndExpiry(): void
    {
        $userModel = new User();

        $token = $userModel->generatePasswordResetToken($this->userId);

        $this->assertIsString($token);
        $this->assertSame(64, strlen($token));

        $tokenHash = hash('sha256', $token);
        $found = $userModel->findByPasswordResetTokenHash($tokenHash);

        $this->assertNotFalse($found);
        $this->assertSame($this->userId, (int) $found['id']);
        $this->assertNotNull($found['password_reset_expires_at']);
    }

    public function testResetPasswordUpdatesHashClearsTokenAndImplicitlyVerifiesEmail(): void
    {
        $userModel = new User();

        $token = $userModel->generatePasswordResetToken($this->userId);
        $tokenHash = hash('sha256', $token);

        $newHash = password_hash('new-password', PASSWORD_DEFAULT);

        $this->assertTrue(
            $userModel->resetPassword($this->userId, $newHash)
        );

        $found = $userModel->findByPasswordResetTokenHash($tokenHash);
        $this->assertFalse($found);

        $statement = $this->db->prepare(
            'SELECT password_hash, password_reset_token_hash,
                    password_reset_expires_at, email_verified_at
             FROM users
             WHERE id = :id'
        );
        $statement->execute(['id' => $this->userId]);
        $row = $statement->fetch();

        $this->assertSame($newHash, $row['password_hash']);
        $this->assertNull($row['password_reset_token_hash']);
        $this->assertNull($row['password_reset_expires_at']);
        $this->assertNotNull($row['email_verified_at']);
    }

    public function testExpiredPasswordResetTokenIsDetectedAsExpired(): void
    {
        $userModel = new User();

        $token = $userModel->generatePasswordResetToken($this->userId);
        $tokenHash = hash('sha256', $token);

        $this->db->prepare(
            "UPDATE users
             SET password_reset_expires_at = NOW() - INTERVAL '1 hour'
             WHERE id = :id"
        )->execute(['id' => $this->userId]);

        $found = $userModel->findByPasswordResetTokenHash($tokenHash);

        $this->assertNotFalse($found);

        $isExpired = strtotime((string) $found['password_reset_expires_at']) < time();

        $this->assertTrue($isExpired);
    }

    public function testForgotPasswordForNonexistentEmailFindsNoUser(): void
    {
        $userModel = new User();

        $found = $userModel->findByEmail('nobody@example.com');

        $this->assertFalse($found);
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
