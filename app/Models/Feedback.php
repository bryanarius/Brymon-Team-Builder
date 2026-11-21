<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

final class Feedback
{
    private PDO $database;

    public function __construct()
    {
        $this->database = Database::connection();
    }

    /**
     * @param array{
     *     kind: string,
     *     user_id: ?int,
     *     contact_email: ?string,
     *     summary: string,
     *     details: string,
     *     expected: ?string,
     *     attachment: ?string,
     *     page_url: ?string,
     *     user_agent: ?string
     * } $feedback
     *
     * @return int The new report's id.
     */
    public function create(array $feedback): int
    {
        $statement = $this->database->prepare(
            'INSERT INTO feedback (
                kind,
                user_id,
                contact_email,
                summary,
                details,
                expected,
                attachment,
                page_url,
                user_agent
            ) VALUES (
                :kind,
                :user_id,
                :contact_email,
                :summary,
                :details,
                :expected,
                :attachment,
                :page_url,
                :user_agent
            )
            RETURNING id'
        );

        $statement->execute([
            'kind' => $feedback['kind'],
            'user_id' => $feedback['user_id'],
            'contact_email' => $feedback['contact_email'],
            'summary' => $feedback['summary'],
            'details' => $feedback['details'],
            'expected' => $feedback['expected'],
            'attachment' => $feedback['attachment'],
            'page_url' => $feedback['page_url'],
            'user_agent' => $feedback['user_agent'],
        ]);

        return (int) $statement->fetchColumn();
    }

    public function findById(int $id): array|false
    {
        $statement = $this->database->prepare(
            'SELECT
                id,
                kind,
                status,
                user_id,
                contact_email,
                summary,
                details,
                expected,
                attachment,
                page_url,
                user_agent,
                created_at
             FROM feedback
             WHERE id = :id'
        );

        $statement->execute(['id' => $id]);

        return $statement->fetch();
    }

    /**
     * Reports from everyone in the last $seconds, to pause notification
     * emails during a flood. The database does the date maths, so PHP's
     * and PostgreSQL's time zones can't disagree.
     */
    public function countCreatedInLast(int $seconds): int
    {
        $statement = $this->database->prepare(
            'SELECT COUNT(*)
             FROM feedback
             WHERE created_at >= NOW() - make_interval(secs => :seconds)'
        );

        $statement->execute(['seconds' => $seconds]);

        return (int) $statement->fetchColumn();
    }
}
