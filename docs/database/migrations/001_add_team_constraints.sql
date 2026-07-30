ALTER TABLE users
ADD CONSTRAINT users_username_not_blank
CHECK (BTRIM(username) <> '');

ALTER TABLE users
ADD CONSTRAINT users_email_not_blank
CHECK (BTRIM(email) <> '');

ALTER TABLE teams
ADD CONSTRAINT teams_name_not_blank
CHECK (BTRIM(name) <> '');

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_slot_range
CHECK (slot_number BETWEEN 1 AND 6);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_api_id_positive
CHECK (pokemon_api_id > 0);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_hp_ev_range
CHECK (hp_ev BETWEEN 0 AND 252);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_attack_ev_range
CHECK (attack_ev BETWEEN 0 AND 252);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_defense_ev_range
CHECK (defense_ev BETWEEN 0 AND 252);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_special_attack_ev_range
CHECK (special_attack_ev BETWEEN 0 AND 252);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_special_defense_ev_range
CHECK (special_defense_ev BETWEEN 0 AND 252);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_speed_ev_range
CHECK (speed_ev BETWEEN 0 AND 252);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_total_evs
CHECK (
    hp_ev
    + attack_ev
    + defense_ev
    + special_attack_ev
    + special_defense_ev
    + speed_ev
    <= 510
);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_hp_iv_range
CHECK (hp_iv BETWEEN 0 AND 31);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_attack_iv_range
CHECK (attack_iv BETWEEN 0 AND 31);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_defense_iv_range
CHECK (defense_iv BETWEEN 0 AND 31);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_special_attack_iv_range
CHECK (special_attack_iv BETWEEN 0 AND 31);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_special_defense_iv_range
CHECK (special_defense_iv BETWEEN 0 AND 31);

ALTER TABLE team_pokemon
ADD CONSTRAINT team_pokemon_speed_iv_range
CHECK (speed_iv BETWEEN 0 AND 31);