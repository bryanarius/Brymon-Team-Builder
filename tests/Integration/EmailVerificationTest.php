<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\User;
use PHPUnit\Framework\TestCase;

final class EmailVerificationTest extends TestCase
{
    private PDO $db;

    private int $userId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->userId = $this->createUser(
            'test-verify-user',
            'verify-user@example.com'
        );
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testGenerateEmailVerificationTokenSetsHashAndExpiry(): void
    {
        $userModel = new User();

        $token = $userModel->generateEmailVerificationToken($this->userId);

        $this->assertIsString($token);
        $this->assertSame(64, strlen($token));

        $tokenHash = hash('sha256', $token);
        $found = $userModel->findByEmailVerificationTokenHash($tokenHash);

        $this->assertNotFalse($found);
        $this->assertSame($this->userId, (int) $found['id']);
        $this->assertNull($found['email_verified_at']);
        $this->assertNotNull($found['email_verification_expires_at']);
    }

    public function testMarkEmailVerifiedClearsTokenAndSetsTimestamp(): void
    {
        $userModel = new User();

        $token = $userModel->generateEmailVerificationToken($this->userId);
        $tokenHash = hash('sha256', $token);

        $this->assertTrue($userModel->markEmailVerified($this->userId));

        $found = $userModel->findByEmailVerificationTokenHash($tokenHash);
        $this->assertFalse($found);

        $statement = $this->db->prepare(
            'SELECT email_verified_at FROM users WHERE id = :id'
        );
        $statement->execute(['id' => $this->userId]);
        $emailVerifiedAt = $statement->fetchColumn();

        $this->assertNotFalse($emailVerifiedAt);
        $this->assertNotNull($emailVerifiedAt);
    }

    public function testExpiredVerificationTokenIsDetectedAsExpired(): void
    {
        $userModel = new User();

        $token = $userModel->generateEmailVerificationToken($this->userId);
        $tokenHash = hash('sha256', $token);

        $this->db->prepare(
            "UPDATE users
             SET email_verification_expires_at = NOW() - INTERVAL '1 hour'
             WHERE id = :id"
        )->execute(['id' => $this->userId]);

        $found = $userModel->findByEmailVerificationTokenHash($tokenHash);

        $this->assertNotFalse($found);

        $isExpired = strtotime((string) $found['email_verification_expires_at']) < time();

        $this->assertTrue($isExpired);
    }

    public function testInvalidVerificationTokenHashReturnsFalse(): void
    {
        $userModel = new User();

        $found = $userModel->findByEmailVerificationTokenHash(
            hash('sha256', 'not-a-real-token')
        );

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
