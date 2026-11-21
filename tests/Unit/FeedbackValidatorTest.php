<?php

declare(strict_types=1);

use App\Core\Validator;
use PHPUnit\Framework\TestCase;

final class FeedbackValidatorTest extends TestCase
{
    /**
     * @param array<string, string> $overrides
     * @return array<string, string>
     */
    private function feedback(array $overrides = []): array
    {
        return [
            'kind' => 'bug',
            'summary' => 'Showdown import fails for Ogerpon',
            'details' => 'Pasting my team shows "Import failed".',
            'expected' => '',
            'attachment' => '',
            'contact_email' => '',
            ...$overrides,
        ];
    }

    public function testAValidBugReportHasNoErrors(): void
    {
        $this->assertSame([], Validator::feedback($this->feedback()));
    }

    public function testAValidSuggestionHasNoErrors(): void
    {
        $this->assertSame([], Validator::feedback($this->feedback([
            'kind' => 'suggestion',
            'summary' => 'Show Speed tiers',
            'details' => 'A list of which of my Pokémon outspeed common threats.',
        ])));
    }

    public function testUnknownKindIsRejected(): void
    {
        $errors = Validator::feedback($this->feedback(['kind' => 'complaint']));

        $this->assertArrayHasKey('kind', $errors);
    }

    public function testSummaryAndDetailsAreRequired(): void
    {
        $errors = Validator::feedback($this->feedback([
            'summary' => '   ',
            'details' => '',
        ]));

        $this->assertSame('Add a short summary.', $errors['summary']);
        $this->assertSame('Describe what happened.', $errors['details']);
    }

    public function testMissingDetailsMessageMatchesTheKind(): void
    {
        $errors = Validator::feedback($this->feedback([
            'kind' => 'suggestion',
            'details' => '',
        ]));

        $this->assertSame('Describe your idea.', $errors['details']);
    }

    public function testFieldsHaveMaximumLengths(): void
    {
        $errors = Validator::feedback($this->feedback([
            'summary' => str_repeat('a', Validator::FEEDBACK_SUMMARY_MAX + 1),
            'details' => str_repeat('a', Validator::FEEDBACK_DETAILS_MAX + 1),
            'expected' => str_repeat('a', Validator::FEEDBACK_EXPECTED_MAX + 1),
            'attachment' => str_repeat('a', Validator::FEEDBACK_ATTACHMENT_MAX + 1),
        ]));

        $this->assertSame(
            ['summary', 'details', 'expected', 'attachment'],
            array_keys($errors)
        );
    }

    public function testLengthsCountCharactersNotBytes(): void
    {
        // "é" is two bytes; 120 of them is still a 120-character summary.
        $summary = str_repeat('é', Validator::FEEDBACK_SUMMARY_MAX);

        $this->assertSame([], Validator::feedback($this->feedback([
            'summary' => $summary,
        ])));
    }

    public function testAFullShowdownTeamFitsAsAnAttachment(): void
    {
        // Six detailed sets are about 1,500 characters.
        $team = str_repeat(
            "Nickname (Ogerpon-Wellspring) @ Wellspring Mask\n"
            . "Ability: Water Absorb\nTera Type: Water\n"
            . "EVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n"
            . "- Swords Dance\n- Ivy Cudgel\n- Horn Leech\n- Play Rough\n\n",
            6
        );

        $this->assertSame([], Validator::feedback($this->feedback([
            'attachment' => $team,
        ])));
    }

    public function testContactEmailIsOptionalButMustBeValid(): void
    {
        $this->assertSame([], Validator::feedback($this->feedback([
            'contact_email' => 'trainer@example.com',
        ])));

        $errors = Validator::feedback($this->feedback([
            'contact_email' => 'not-an-email',
        ]));

        $this->assertArrayHasKey('contact_email', $errors);
    }
}
