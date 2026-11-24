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

    /**
     * ?page=N for paged lists. Anything that isn't a whole number from 1 up
     * is page 1, so a bad link shows the first page instead of an error.
     */
    protected static function pageFromQuery(): int
    {
        $value = $_GET['page'] ?? null;
        $page = is_string($value) ? filter_var($value, FILTER_VALIDATE_INT) : false;

        return is_int($page) && $page >= 1 && $page <= 10000 ? $page : 1;
    }

    /**
     * @param array<string, mixed> $data
     */
    protected function sendJson(array $data, int $statusCode): void
    {
        http_response_code($statusCode);

        echo json_encode(
            $data,
            JSON_UNESCAPED_SLASHES
            | JSON_UNESCAPED_UNICODE
        );
    }
}