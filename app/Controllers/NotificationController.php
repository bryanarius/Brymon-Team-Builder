<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Models\Notification;

/**
 * New followers and likes on your teams, newest first.
 */
final class NotificationController extends Controller
{
    private const PAGE_SIZE = 20;

    public function index(): void
    {
        Auth::requireLogin();

        $userId = (int) Auth::activeId();
        $page = self::pageFromQuery();
        $notificationModel = new Notification();

        // One extra row says whether there's a next page, without a COUNT.
        $notifications = $notificationModel->findForUser(
            $userId,
            self::PAGE_SIZE + 1,
            ($page - 1) * self::PAGE_SIZE
        );

        $hasNextPage = count($notifications) > self::PAGE_SIZE;
        $notifications = array_slice($notifications, 0, self::PAGE_SIZE);

        /*
         * Opening the first page counts as reading everything on it. Marked
         * up to the newest row shown, not "now", so one that arrives while
         * the page loads stays unread. Rows keep their "new" highlight for
         * this visit, since is_unread was read before this update.
         */
        if ($page === 1 && $notifications !== []) {
            $notificationModel->markSeenUpTo($userId, $notifications[0]['created_at']);
        }

        $this->view('notifications/index', [
            'pageTitle' => 'Notifications',
            'notifications' => $notifications,
            'page' => $page,
            'hasNextPage' => $hasNextPage,
        ]);
    }
}
