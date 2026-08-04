BEGIN;

ALTER TABLE team_pokemon
ADD COLUMN pokemon_name VARCHAR(100);

COMMIT;