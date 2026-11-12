import { fetchMove, fetchPokemon, fetchType } from "./pokeapi";
import {
  analyzeTeamDefense,
  ATTACKING_TYPES,
  buildRecommendation,
  buildResistanceMap,
  buildTeamSummary,
  buildTypeMultiplierMap,
  computeRoleBalance,
  findTypeCoverage,
  groupTeamTypes,
  listImmunities,
  listSharedWeaknesses,
  teamMoveNames,
  type Finding,
  type PokemonType,
  type RoleBalance,
  type TeamPokemon,
  type TypeCoverage,
  type TypeGroup,
} from "./team-analysis";

/*
|--------------------------------------------------------------------------
| Load Team Analysis
|--------------------------------------------------------------------------
|
| Fetches what the analysis needs from PokéAPI and runs the calculations,
| returning everything the panel renders as one plain object.
|
*/

export type ChartMember = {
  name: string;
  image: string;
  types: string[];
  ability: string;
};

export type Weakness = TypeGroup & { recommendation: string | null };

export type TeamAnalysisResult = {
  summary: Finding[];
  chartMembers: ChartMember[];
  weaknesses: Weakness[];
  immunities: TypeGroup[];
  teamTypes: TypeGroup[];
  coverage: TypeCoverage;
  roleBalance: RoleBalance;
};

/** `team` is the saved slots, in slot order. */
export async function loadTeamAnalysis(
  team: TeamPokemon[],
): Promise<TeamAnalysisResult> {
  const [details, allTypeData, moveTypeData] = await Promise.all([
    Promise.all(team.map((pokemon) => fetchPokemon(pokemon.pokemonApiId))),
    Promise.all(ATTACKING_TYPES.map(fetchType)),
    fetchMoveTypeData(team),
  ]);

  const defense = analyzeTeamDefense(buildTypeMultiplierMap(details, team));
  const resistanceMap = buildResistanceMap(allTypeData);
  const roleBalance = computeRoleBalance(details, team);

  return {
    summary: buildTeamSummary(defense, details, roleBalance.findings),
    chartMembers: details.map((pokemon, index) => ({
      name: formatPokemonDisplayName(pokemon.name),
      image:
        pokemon.sprites.other["official-artwork"].front_default ??
        pokemon.sprites.front_default ??
        "",
      types: pokemon.types.map((entry) => entry.type.name),
      ability: team[index]?.ability ?? "",
    })),
    weaknesses: listSharedWeaknesses(defense).map((group) => ({
      ...group,
      recommendation: buildRecommendation(
        group.type,
        resistanceMap[group.type as PokemonType],
      ),
    })),
    immunities: listImmunities(defense),
    teamTypes: groupTeamTypes(details),
    coverage: findTypeCoverage(moveTypeData),
    roleBalance,
  };
}

// PokéAPI's /type data for each type the team has a move of.
async function fetchMoveTypeData(team: TeamPokemon[]) {
  const moves = await Promise.all(teamMoveNames(team).map(fetchMove));
  const moveTypes = new Set(moves.map((move) => move.type.name));

  return Promise.all([...moveTypes].map(fetchType));
}
