<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;

final class DashboardController extends Controller
{
    public function index(): void
    {
        if (!isset($_SESSION['user_id'])) {
            header('Location: /login');
            exit;
        }

        $this->view('dashboard/index', [
            'pageTitle' => 'Dashboard',
            'username' => $_SESSION['username'],
        ]);
    }
}