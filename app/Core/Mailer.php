<?php

declare(strict_types=1);

namespace App\Core;

final class Mailer
{
    public static function send(string $to, string $subject, string $html): bool
    {
        if (Config::get('APP_ENV') === 'testing') {
            return true;
        }

        $apiKey = Config::get('RESEND_API_KEY');
        $from = Config::get('MAIL_FROM');

        if (!$apiKey || !$from) {
            error_log('Mailer::send failed: RESEND_API_KEY or MAIL_FROM is not configured.');

            return false;
        }

        $payload = json_encode([
            'from' => $from,
            'to' => [$to],
            'subject' => $subject,
            'html' => $html,
        ], JSON_THROW_ON_ERROR);

        $curl = curl_init('https://api.resend.com/emails');

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 10,
        ]);

        $response = curl_exec($curl);
        $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);

        curl_close($curl);

        if ($response === false || $statusCode < 200 || $statusCode >= 300) {
            error_log(sprintf(
                'Mailer::send failed (status %d): %s',
                $statusCode,
                $error !== '' ? $error : (string) $response
            ));

            return false;
        }

        return true;
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function render(string $template, array $data = []): string
    {
        $viewPath = dirname(__DIR__) . '/Views/emails/' . $template . '.php';

        if (!file_exists($viewPath)) {
            throw new \RuntimeException(
                sprintf('Email template "%s" could not be found.', $template)
            );
        }

        extract($data, EXTR_SKIP);

        ob_start();
        require $viewPath;

        return ob_get_clean();
    }
}
