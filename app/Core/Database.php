<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use RuntimeException;

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection !== null) {
            return self::$connection;
        }

        $databaseUrl = Config::get('DATABASE_URL');

        if ($databaseUrl !== null && $databaseUrl !== '') {
            [$dsn, $user, $password] = self::parseDatabaseUrl($databaseUrl);
        } else {
            $host = Config::get('DB_HOST', 'localhost');
            $port = Config::get('DB_PORT', '5432');
            $name = Config::get('DB_NAME');
            $user = Config::get('DB_USER');
            $password = Config::get('DB_PASSWORD');

            if (
                $name === null ||
                $user === null ||
                $password === null
            ) {
                throw new RuntimeException(
                    'Local database configuration is incomplete.'
                );
            }

            $dsn = sprintf(
                'pgsql:host=%s;port=%s;dbname=%s',
                $host,
                $port,
                $name
            );
        }

        try {
            self::$connection = new PDO(
                $dsn,
                $user,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $exception) {
            error_log(
                'Database connection failed: ' . $exception->getMessage()
            );

            throw new RuntimeException(
                'Database connection failed.',
                0,
                $exception
            );
        }

        return self::$connection;
    }

    /**
     * @return array{0: string, 1: string, 2: string}
     */
    private static function parseDatabaseUrl(string $databaseUrl): array
    {
        $parts = parse_url($databaseUrl);

        if ($parts === false) {
            throw new RuntimeException('DATABASE_URL is invalid.');
        }

        $host = $parts['host'] ?? null;
        $port = (string) ($parts['port'] ?? 5432);
        $database = isset($parts['path'])
            ? ltrim($parts['path'], '/')
            : null;
        $user = isset($parts['user'])
            ? urldecode($parts['user'])
            : null;
        $password = isset($parts['pass'])
            ? urldecode($parts['pass'])
            : null;

        if (
            $host === null ||
            $database === null ||
            $database === '' ||
            $user === null ||
            $password === null
        ) {
            throw new RuntimeException(
                'DATABASE_URL is missing required connection details.'
            );
        }

        $dsn = sprintf(
            'pgsql:host=%s;port=%s;dbname=%s',
            $host,
            $port,
            $database
        );

        return [$dsn, $user, $password];
    }
}