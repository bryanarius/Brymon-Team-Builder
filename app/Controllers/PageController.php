<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;

final class PageController extends Controller
{
    public function home(): void
    {
        $this->view('home/index', [
            'pageTitle' => 'Brymon Team Builder',
        ]);
    }

    public function about(): void
    {
        $this->view('about/index', [
            'pageTitle' => 'About Brymon',
        ]);
    }
}