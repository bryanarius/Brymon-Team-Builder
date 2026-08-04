<?php

declare(strict_types=1);

namespace App\Core;

final class Router
{
    /**
     * @var array<string, array<int, array{
     *     path: string,
     *     handler: callable|array
     * }>>
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
        $this->routes[$method][] = [
            'path' => $this->normalizePath($path),
            'handler' => $handler,
        ];
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

        $matchedRoute = $this->matchRoute($method, $path);

        if ($matchedRoute === null) {
            $this->renderNotFound();
            return;
        }

        $handler = $matchedRoute['handler'];
        $parameters = $matchedRoute['parameters'];

        if (is_array($handler)) {
            [$controllerClass, $action] = $handler;

            $controller = new $controllerClass();

            $controller->$action(...array_values($parameters));

            return;
        }

        $handler(...array_values($parameters));
    }

    /**
     * @return array{
     *     handler: callable|array,
     *     parameters: array<string, string>
     * }|null
     */
    private function matchRoute(
        string $method,
        string $requestPath
    ): ?array {
        $routes = $this->routes[$method] ?? [];

        foreach ($routes as $route) {
            $parameterNames = [];

            $pattern = preg_replace_callback(
                '/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/',
                static function (array $matches) use (&$parameterNames): string {
                    $parameterNames[] = $matches[1];

                    return '([^/]+)';
                },
                $route['path']
            );

            if (!is_string($pattern)) {
                continue;
            }

            $pattern = '#^' . $pattern . '$#';

            if (!preg_match($pattern, $requestPath, $matches)) {
                continue;
            }

            array_shift($matches);

            $parameters = [];

            foreach ($parameterNames as $index => $name) {
                $parameters[$name] = urldecode(
                    $matches[$index] ?? ''
                );
            }

            return [
                'handler' => $route['handler'],
                'parameters' => $parameters,
            ];
        }

        return null;
    }

    private function normalizePath(string $path): string
    {
        $path = '/' . trim($path, '/');

        return $path === '//' ? '/' : $path;
    }

    private function renderNotFound(): void
    {
        http_response_code(404);

        $viewPath = dirname(__DIR__) . '/Views/errors/404.php';

        if (!file_exists($viewPath)) {
            echo '<h1>404</h1>';
            echo '<p>Page not found.</p>';
            return;
        }

        require $viewPath;
    }
}