<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\Follow;
use App\Models\Notification;
use App\Models\TeamLike;
use PHPUnit\Framework\TestCase;

final class NotificationTest extends TestCase
{
    private PDO $db;

    private int $meId;
    private int $fanId;
    private int $strangerId;
    private int $myTeamId;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();

        $this->meId = $this->createUser('note-me', 'note-me@example.com');
        $this->fanId = $this->createUser('note-fan', 'note-fan@example.com');
        $this->strangerId = $this->createUser('note-stranger', 'note-stranger@example.com');
        $this->myTeamId = $this->createTeam($this->meId, 'Rain Team');

        // Everything below happens after "me" last looked.
        $this->setSeenAt($this->meId, '2026-01-01 00:00:00');
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testFollowsAndLikesAreListedNewestFirst(): void
    {
        (new Follow())->follow($this->fanId, $this->meId);
        (new TeamLike())->like($this->strangerId, $this->myTeamId);

        $this->setFollowTime($this->fanId, $this->meId, '2026-02-01 10:00:00');
        $this->setLikeTime($this->strangerId, $this->myTeamId, '2026-02-02 10:00:00');

        $notifications = (new Notification())->findForUser($this->meId, 10);

        $this->assertCount(2, $notifications);

        [$like, $follow] = $notifications;

        $this->assertSame('like', $like['type']);
        $this->assertSame('note-stranger', $like['actor_username']);
        $this->assertSame($this->myTeamId, $like['team_id']);
        $this->assertSame('Rain Team', $like['team_name']);

        $this->assertSame('follow', $follow['type']);
        $this->assertSame($this->fanId, $follow['actor_id']);
        $this->assertNull($follow['team_id']);
    }

    public function testOnlyTheTrainersOwnNotificationsAreListed(): void
    {
        $strangersTeamId = $this->createTeam($this->strangerId, 'Not Mine');

        // Liking your own team isn't a notification.
        (new TeamLike())->like($this->meId, $this->myTeamId);
        // Neither are follows and likes between other trainers.
        (new Follow())->follow($this->fanId, $this->strangerId);
        (new TeamLike())->like($this->fanId, $strangersTeamId);

        $this->assertSame([], (new Notification())->findForUser($this->meId, 10));
    }

    public function testUnfollowingRemovesTheNotification(): void
    {
        $follow = new Follow();
        $notifications = new Notification();

        $follow->follow($this->fanId, $this->meId);
        $this->assertCount(1, $notifications->findForUser($this->meId, 10));

        $follow->unfollow($this->fanId, $this->meId);
        $this->assertSame([], $notifications->findForUser($this->meId, 10));
        $this->assertSame(0, $notifications->countUnread($this->meId));
    }

    public function testOnlyNotificationsAfterTheLastVisitAreUnread(): void
    {
        $notifications = new Notification();

        (new Follow())->follow($this->fanId, $this->meId);
        (new TeamLike())->like($this->strangerId, $this->myTeamId);

        $this->setFollowTime($this->fanId, $this->meId, '2026-02-01 10:00:00');
        $this->setLikeTime($this->strangerId, $this->myTeamId, '2026-02-02 10:00:00');

        $this->assertSame(2, $notifications->countUnread($this->meId));

        // Seen up to the follow, so only the later like is unread.
        $notifications->markSeenUpTo($this->meId, '2026-02-01 10:00:00');
        $this->assertSame(1, $notifications->countUnread($this->meId));

        $notifications->markSeenUpTo($this->meId, '2026-02-02 10:00:00');
        $this->assertSame(0, $notifications->countUnread($this->meId));
    }

    public function testSeenTimeNeverMovesBackwards(): void
    {
        $notifications = new Notification();

        $notifications->markSeenUpTo($this->meId, '2026-03-01 00:00:00');
        // e.g. an older tab, showing older notifications, loads later.
        $notifications->markSeenUpTo($this->meId, '2026-02-01 00:00:00');

        $this->assertSame('2026-03-01 00:00:00', $notifications->lastSeenAt($this->meId));
    }

    public function testUnreadCountStopsAtTheMaximum(): void
    {
        for ($i = 1; $i <= 4; $i++) {
            $fanId = $this->createUser("note-fan-{$i}", "note-fan-{$i}@example.com");
            (new Follow())->follow($fanId, $this->meId);
        }

        $this->assertSame(3, (new Notification())->countUnread($this->meId, 3));
        $this->assertSame(4, (new Notification())->countUnread($this->meId));
    }

    public function testANewAccountStartsWithNothingUnread(): void
    {
        // Sign-up time is the first "seen" time.
        $newId = $this->createUser('note-new', 'note-new@example.com');

        $this->assertSame(0, (new Notification())->countUnread($newId));

        (new Follow())->follow($this->fanId, $newId);
        $this->assertSame(1, (new Notification())->countUnread($newId));
    }

    private function setSeenAt(int $userId, string $time): void
    {
        $this->db
            ->prepare('UPDATE users SET notifications_seen_at = :time WHERE id = :id')
            ->execute(['time' => $time, 'id' => $userId]);
    }

    private function setFollowTime(int $followerId, int $followedId, string $time): void
    {
        $this->db
            ->prepare(
                'UPDATE follows SET created_at = :time
                 WHERE follower_id = :follower_id AND followed_id = :followed_id'
            )
            ->execute([
                'time' => $time,
                'follower_id' => $followerId,
                'followed_id' => $followedId,
            ]);
    }

    private function setLikeTime(int $userId, int $teamId, string $time): void
    {
        $this->db
            ->prepare(
                'UPDATE team_likes SET created_at = :time
                 WHERE user_id = :user_id AND team_id = :team_id'
            )
            ->execute(['time' => $time, 'user_id' => $userId, 'team_id' => $teamId]);
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

    private function createTeam(int $userId, string $name): int
    {
        $statement = $this->db->prepare(
            'INSERT INTO teams (user_id, name, is_public)
             VALUES (:user_id, :name, TRUE)
             RETURNING id'
        );

        $statement->execute(['user_id' => $userId, 'name' => $name]);

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
