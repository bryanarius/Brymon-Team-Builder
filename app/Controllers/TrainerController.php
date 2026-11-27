<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Models\Follow;
use App\Models\RecentSearch;
use App\Models\User;

/**
 * Find other trainers by username or display name. Public, like profiles.
 *
 * /trainers is the whole page; /trainers/results is just the results, which
 * trainer-search.js swaps in as you type. Both render the same partial.
 */
final class TrainerController extends Controller
{
    private const PAGE_SIZE = 20;

    // Display names are at most 50 characters, so longer searches can't match.
    private const MAX_QUERY_LENGTH = 50;

    public function index(): void
    {
        $results = $this->search();

        $this->view('trainers/index', $results + [
            'pageTitle' => $results['query'] !== ''
                ? "Trainers matching \"{$results['query']}\""
                : 'Find Trainers',
        ]);
    }

    public function results(): void
    {
        header('Content-Type: text/html; charset=UTF-8');

        $this->view('trainers/results', $this->search());
    }

    /**
     * @return array<string, mixed> the data both views need
     */
    private function search(): array
    {
        $rawQuery = $_GET['q'] ?? '';
        $query = is_string($rawQuery)
            ? mb_substr(trim($rawQuery), 0, self::MAX_QUERY_LENGTH)
            : '';

        $page = self::pageFromQuery();
        $trainers = [];
        $hasNextPage = false;

        if ($query !== '') {
            // One extra row says whether there's a next page, without a COUNT.
            $trainers = (new User())->searchTrainers(
                $query,
                self::PAGE_SIZE + 1,
                ($page - 1) * self::PAGE_SIZE
            );

            $hasNextPage = count($trainers) > self::PAGE_SIZE;
            $trainers = array_slice($trainers, 0, self::PAGE_SIZE);
        }

        $viewerId = Auth::activeId();
        $relationships = $viewerId !== null
            ? (new Follow())->findRelationshipsWith($viewerId, array_column($trainers, 'id'))
            : ['following' => [], 'followers' => []];

        // An empty search box shows who you opened recently, like Instagram.
        $recentTrainers = $query === '' && $viewerId !== null
            ? (new RecentSearch())->findForUser($viewerId, RecentSearch::MAX_KEPT)
            : [];

        return [
            'query' => $query,
            'trainers' => $trainers,
            'recentTrainers' => $recentTrainers,
            'page' => $page,
            'hasNextPage' => $hasNextPage,
            'viewerId' => $viewerId,
            'viewerFollowingIds' => $relationships['following'],
            'viewerFollowerIds' => $relationships['followers'],
        ];
    }
}
