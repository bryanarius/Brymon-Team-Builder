<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;

final class AuthController extends Controller
{
    public function showregister(): void
    {
        $this->view('auth/register', [
            'pageTitle' => 'Register',
        ]);
    }

    public function register(): void 
    {
        //
    }
}