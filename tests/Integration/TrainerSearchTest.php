<?php

declare(strict_types=1);

use App\Core\Database;
use App\Models\User;
use PHPUnit\Framework\TestCase;

final class TrainerSearchTest extends TestCase
{
    private PDO $db;

    protected function setUp(): void
    {
        $this->db = Database::connection();

        $this->cleanDatabase();
    }

    protected function tearDown(): void
    {
        $this->cleanDatabase();
    }

    public function testMatchesUsernamesIgnoringCase(): void
    {
        $this->createUser('MistyWater');
        $this->createUser('brock');

        $this->assertSame(['MistyWater'], $this->usernames('misty'));
        $this->assertSame(['MistyWater'], $this->usernames('WATER'));
    }

    public function testMatchesDisplayNames(): void
    {
        $this->createUser('trainer_1', 'Cynthia');
        $this->createUser('trainer_2', 'Steven');

        $this->assertSame(['trainer_1'], $this->usernames('cynth'));
    }

    public function testBestMatchesComeFirst(): void
    {
        // Contains "leon", starts with "leon", is exactly "leon".
        $this->createUser('chaleon');
        $this->createUser('leonfan');
        $this->createUser('leon');

        $this->assertSame(['leon', 'leonfan', 'chaleon'], $this->usernames('leon'));
    }

    public function testWildcardsOnlyMatchThemselves(): void
    {
        $this->createUser('ash', '100% Pikachu');
        $this->createUser('red_kanto');
        $this->createUser('gary');

        $this->assertSame(['ash'], $this->usernames('%'));
        $this->assertSame(['red_kanto'], $this->usernames('_'));
        $this->assertSame([], $this->usernames('\\'));
    }

    public function testBlankSearchesFindNobody(): void
    {
        $this->createUser('serena');

        $this->assertSame([], $this->usernames(''));
        $this->assertSame([], $this->usernames('   '));
    }

    public function testSurroundingSpacesAreIgnored(): void
    {
        $this->createUser('serena');

        $this->assertSame(['serena'], $this->usernames('  ser  '));
    }

    public function testResultsArePagedWithoutRepeatsOrGaps(): void
    {
        foreach (['gym_a', 'gym_b', 'gym_c', 'gym_d', 'gym_e'] as $username) {
            $this->createUser($username);
        }

        $users = new User();

        $pages = array_merge(
            array_column($users->searchTrainers('gym', 2, 0), 'username'),
            array_column($users->searchTrainers('gym', 2, 2), 'username'),
            array_column($users->searchTrainers('gym', 2, 4), 'username'),
        );

        $this->assertSame(['gym_a', 'gym_b', 'gym_c', 'gym_d', 'gym_e'], $pages);
    }

    public function testResultsIncludeProfileFieldsButNoPrivateOnes(): void
    {
        $id = $this->createUser('dawn', 'Dawn', 393);

        $trainer = (new User())->searchTrainers('dawn', 10)[0];

        $this->assertSame($id, $trainer['id']);
        $this->assertSame('Dawn', $trainer['display_name']);
        $this->assertSame(393, $trainer['avatar_pokemon_id']);
        $this->assertArrayNotHasKey('email', $trainer);
        $this->assertArrayNotHasKey('password_hash', $trainer);
    }

    /**
     * @return list<string>
     */
    private function usernames(string $query): array
    {
        return array_column((new User())->searchTrainers($query, 20), 'username');
    }

    private function createUser(
        string $username,
        ?string $displayName = null,
        ?int $avatarPokemonId = null,
    ): int {
        $statement = $this->db->prepare(
            '
            INSERT INTO users (
                username,
                email,
                password_hash,
                display_name,
                avatar_pokemon_id
            )
            VALUES (
                :username,
                :email,
                :password_hash,
                :display_name,
                :avatar_pokemon_id
            )
            RETURNING id
            '
        );

        $statement->execute([
            'username' => $username,
            'email' => $username . '@example.com',
            'password_hash' => password_hash('test-password', PASSWORD_DEFAULT),
            'display_name' => $displayName,
            'avatar_pokemon_id' => $avatarPokemonId,
        ]);

        return (int) $statement->fetchColumn();
    }

    private function cleanDatabase(): void
    {
        $this->db->exec(
            'TRUNCATE TABLE
                follows,
                team_likes,
                team_pokemon,
                teams,
                users
             RESTART IDENTITY CASCADE'
        );
    }
}
