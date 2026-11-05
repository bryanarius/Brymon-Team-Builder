<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Config;
use App\Core\Controller;
use App\Core\UsageStats;

final class UsageStatsController extends Controller
{
    public function show(string $format): void
    {
        header('Content-Type: application/json; charset=UTF-8');

        if (!UsageStats::isSupported($format)) {
            $this->sendJson([
                'message' => 'Unknown format.',
                'formats' => array_keys(UsageStats::FORMATS),
            ], 404);

            return;
        }

        $usageStats = new UsageStats(
            (string) Config::get(
                'CACHE_DIR',
                sys_get_temp_dir() . '/brymon-cache'
            )
        );

        try {
            $stats = $usageStats->forFormat($format);
        } catch (\RuntimeException) {
            $this->sendJson([
                'message' =>
                    'Usage stats are temporarily unavailable. Please try again later.',
            ], 503);

            return;
        }

        // The stats change monthly; let browsers reuse a response for an hour.
        header('Cache-Control: public, max-age=3600');

        $this->sendJson($stats, 200);
    }
}
