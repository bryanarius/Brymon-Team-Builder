<?php

declare(strict_types=1);

use App\Core\Auth;
use PHPUnit\Framework\TestCase;

final class AuthActiveIdTest extends TestCase
{
    protected function setUp(): void
    {
        $_SESSION = [];
    }

    protected function tearDown(): void
    {
        $_SESSION = [];
    }

    public function testGuestHasNoActiveId(): void
    {
        $this->assertNull(Auth::activeId());
    }

    public function testActiveSessionReturnsTheUserIdAndRefreshesActivity(): void
    {
        $_SESSION = [
            'user_id' => 7,
            'login_time' => time() - 60,
            'last_activity' => time() - 60,
        ];

        $this->assertSame(7, Auth::activeId());
        $this->assertGreaterThanOrEqual(time() - 1, $_SESSION['last_activity']);
    }

    public function testIdleSessionCountsAsGuest(): void
    {
        $_SESSION = [
            'user_id' => 7,
            'login_time' => time() - 2 * 60 * 60,
            'last_activity' => time() - 2 * 60 * 60,
        ];

        $this->assertNull(Auth::activeId());
    }

    public function testSessionPastTheAbsoluteLimitCountsAsGuest(): void
    {
        $_SESSION = [
            'user_id' => 7,
            'login_time' => time() - 9 * 60 * 60,
            'last_activity' => time(),
        ];

        $this->assertNull(Auth::activeId());
    }
}
