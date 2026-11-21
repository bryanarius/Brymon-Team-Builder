<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\Feedback;
use PHPUnit\Framework\TestCase;

final class FeedbackTest extends TestCase
{
    private PDO $db;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    /**
     * @param array<string, mixed> $overrides
     * @return array<string, mixed>
     */
    private function report(array $overrides = []): array
    {
        return [
            'kind' => 'bug',
            'user_id' => null,
            'contact_email' => null,
            'summary' => 'Showdown import fails for Ogerpon',
            'details' => 'Pasting my team shows "Import failed".',
            'expected' => 'The team imports.',
            'attachment' => "Bluebell (Ogerpon-Wellspring) @ Wellspring Mask\n- Ivy Cudgel",
            'page_url' => '/teambuilder',
            'user_agent' => 'PHPUnit',
            ...$overrides,
        ];
    }

    public function testAGuestReportIsSavedAsNew(): void
    {
        $feedback = new Feedback();

        $id = $feedback->create($this->report([
            'contact_email' => 'guest@example.com',
        ]));

        $saved = $feedback->findById($id);

        $this->assertSame('bug', $saved['kind']);
        $this->assertSame('new', $saved['status']);
        $this->assertNull($saved['user_id']);
        $this->assertSame('guest@example.com', $saved['contact_email']);
        $this->assertSame('/teambuilder', $saved['page_url']);
        $this->assertStringContainsString("\n- Ivy Cudgel", $saved['attachment']);
    }

    public function testASuggestionCanLeaveBugFieldsEmpty(): void
    {
        $feedback = new Feedback();

        $id = $feedback->create($this->report([
            'kind' => 'suggestion',
            'expected' => null,
            'attachment' => null,
            'page_url' => null,
        ]));

        $saved = $feedback->findById($id);

        $this->assertSame('suggestion', $saved['kind']);
        $this->assertNull($saved['expected']);
        $this->assertNull($saved['attachment']);
    }

    public function testDeletingAnAccountKeepsItsReportsUnlinked(): void
    {
        $userId = $this->createUser('feedback-user', 'feedback@example.com');

        $feedback = new Feedback();
        $id = $feedback->create($this->report(['user_id' => $userId]));

        $this->db->prepare('DELETE FROM users WHERE id = :id')
            ->execute(['id' => $userId]);

        $saved = $feedback->findById($id);

        $this->assertNotFalse($saved);
        $this->assertNull($saved['user_id']);
    }

    public function testTheDatabaseRejectsAnUnknownKind(): void
    {
        $this->expectException(PDOException::class);

        (new Feedback())->create($this->report(['kind' => 'complaint']));
    }

    public function testRecentReportsAreCountedForTheEmailFloodLimit(): void
    {
        $feedback = new Feedback();

        $feedback->create($this->report());
        $feedback->create($this->report());

        // One report from yesterday, outside the hour.
        $oldId = $feedback->create($this->report());
        $this->db->prepare(
            "UPDATE feedback SET created_at = NOW() - INTERVAL '1 day' WHERE id = :id"
        )->execute(['id' => $oldId]);

        $this->assertSame(2, $feedback->countCreatedInLast(3600));
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
            'password_hash' => password_hash('password', PASSWORD_DEFAULT),
        ]);

        return (int) $statement->fetchColumn();
    }

    private function cleanDatabase(): void
    {
        $this->db->exec('TRUNCATE TABLE feedback, users RESTART IDENTITY CASCADE');
    }
}
