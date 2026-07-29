<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Team Builder';

require dirname(__DIR__) . '/layouts/header.php';
?>

<section class="team-builder-page">

    <div class="container">

        <header class="team-builder-header">

            <div>
                <h1>Team Builder</h1>

                <p>
                    Build your Pokémon team and save it for later.
                </p>
            </div>

        </header>

        <?php if (!empty($errors['form'])): ?>
            <div class="alert error">
                <?= htmlspecialchars($errors['form']) ?>
            </div>
        <?php endif; ?>

        <form
            action="/teambuilder"
            method="POST"
            class="team-builder-form"
        >

            <div class="team-builder-details">

                <div class="form-group">

                    <label for="name">
                        Team Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        maxlength="100"
                        value="<?= htmlspecialchars($old['name'] ?? '') ?>"
                    >

                    <?php if (!empty($errors['name'])): ?>

                        <p class="field-error">
                            <?= htmlspecialchars($errors['name']) ?>
                        </p>

                    <?php endif; ?>

                </div>

                <div class="form-group">

                    <label for="notes">
                        Team Notes
                    </label>

                    <textarea
                        id="notes"
                        name="notes"
                        rows="4"
                    ><?= htmlspecialchars($old['notes'] ?? '') ?></textarea>

                    <?php if (!empty($errors['notes'])): ?>

                        <p class="field-error">
                            <?= htmlspecialchars($errors['notes']) ?>
                        </p>

                    <?php endif; ?>

                </div>

            </div>

            <section class="team-preview">

                <h2>Your Team</h2>

                <div class="team-slots">

                    <?php for ($slot = 1; $slot <= 6; $slot++): ?>

                        <button
                            type="button"
                            class="team-slot"
                        >

                            <span class="slot-plus">+</span>

                            <span class="slot-number">
                                Slot <?= $slot ?>
                            </span>

                        </button>

                    <?php endfor; ?>

                </div>

            </section>

            <section class="pokemon-search-placeholder">

                <h2>Pokémon Search</h2>

                <p>
                    Pokémon search and filtering will be available here.
                </p>

            </section>

            <div class="builder-actions">

                <button
                    class="button button-primary"
                    type="submit"
                >
                    Save Team
                </button>

            </div>

        </form>

    </div>

</section>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>