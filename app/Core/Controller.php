<?php

declare(strict_types=1);

namespace App\Core;

abstract class Controller
{
    /**
     * @param array<string, mixed> $data
     */
    protected function view(string $view, array $data = []): void
    {
        $viewPath = dirname(__DIR__) . '/Views/' . $view . '.php';

        if (!file_exists($viewPath)) {
            throw new \RuntimeException(
                sprintf('View "%s" could not be found.', $view)
            );
        }

        extract($data, EXTR_SKIP);

        require $viewPath;
    }
}