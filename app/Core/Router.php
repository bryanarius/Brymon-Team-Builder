<?php

declare(strict_types=1);

namespace App\Core;

final class Router
{
    /**
     * @var array<string, array<string, callable|array>>
     */
    private array $routes = [];

    public function get(string $path, callable|array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    private function addRoute(
        string $method,
        string $path,
        callable|array $handler
    ): void {
        $normalizedPath = $this->normalizePath($path);

        $this->routes[$method][$normalizedPath] = $handler;
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH);

        if (!is_string($path)) {
            $this->renderNotFound();
            return;
        }

        $basePath = dirname($_SERVER['SCRIPT_NAME'] ?? '');

        if ($basePath !== '/' && $basePath !== '.') {
            $path = preg_replace(
                '#^' . preg_quote($basePath, '#') . '#',
                '',
                $path
            ) ?? $path;
        }

        $path = $this->normalizePath($path);
        $handler = $this->routes[$method][$path] ?? null;

        if ($handler === null) {
            $this->renderNotFound();
            return;
        }

        if (is_array($handler)) {
            [$controllerClass, $action] = $handler;

            $controller = new $controllerClass();
            $controller->$action();

            return;
        }

        $handler();
    }

    private function normalizePath(string $path): string
    {
        $path = '/' . trim($path, '/');

        return $path === '//' ? '/' : $path;
    }

    private function renderNotFound(): void
    {
        http_response_code(404);

        echo '<h1>404</h1>';
        echo '<p>Page not found.</p>';
    }
}