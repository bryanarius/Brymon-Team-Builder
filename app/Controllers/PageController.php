<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\UsageStats;

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

    public function pokedex(): void
    {
        $this->view('pokedex/index', [
            'pageTitle' => 'Pokédex',
        ]);
    }

    public function meta(): void
    {
        $this->view('meta/index', [
            'pageTitle' => 'Meta',
            'formats' => UsageStats::FORMATS,
        ]);
    }

    public function calc(): void
    {
        $this->view('calc/index', [
            'pageTitle' => 'Damage Calculator',
            // The calculator library is ~500 KB, so only this page loads it.
            'pageScripts' => [
                '/vendor/smogon-calc/data.min.js',
                '/vendor/smogon-calc/calc.min.js',
                '/js/damage-calc.js',
                '/js/damage-calc-page.js',
            ],
        ]);
    }
}