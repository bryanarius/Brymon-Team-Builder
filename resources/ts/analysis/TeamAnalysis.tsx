import { useEffect, useState, type ReactNode } from "react";
import { TypeBadge } from "../components/TypeBadge";
import { AnalysisItem } from "./AnalysisItem";
import { DefensiveChart } from "./DefensiveChart";
import { FindingList } from "./FindingList";
import { loadTeamAnalysis, type TeamAnalysisResult } from "./load-team-analysis";
import {
  formatTypeName,
  getWeaknessSeverity,
  ROLE_LABELS,
  ROLE_ORDER,
  type RoleBalance,
  type TeamPokemon,
  type TypeCoverage,
} from "./team-analysis";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; analysis: TeamAnalysisResult };

/** The analysis panel on a saved team's page. */
export function TeamAnalysis({ team }: { team: TeamPokemon[] }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (team.length === 0) {
      return;
    }

    // Ignore a result that arrives after the component has gone away.
    let current = true;

    loadTeamAnalysis(team)
      .then((analysis) => {
        if (current) {
          setState({ status: "ready", analysis });
        }
      })
      .catch((error: unknown) => {
        console.error("Team analysis error:", error);

        if (current) {
          setState({ status: "error" });
        }
      });

    return () => {
      current = false;
    };
  }, [team]);

  if (team.length === 0) {
    return <Status>Add Pokémon to this team to view analysis.</Status>;
  }

  if (state.status === "loading") {
    return <Status>Loading team analysis...</Status>;
  }

  if (state.status === "error") {
    return <Status>Unable to load team analysis.</Status>;
  }

  const { analysis } = state;

  return (
    <div className="team-analysis-content">
      <article className="team-analysis-summary">
        <div className="team-analysis-summary-header">
          <h3>Summary</h3>

          <span className="team-analysis-summary-label">Key Findings</span>
        </div>

        <FindingList findings={analysis.summary} />
      </article>

      <Card title="Defensive Coverage">
        <DefensiveChart members={analysis.chartMembers} />
      </Card>

      <Card title="Shared Weaknesses" list>
        {analysis.weaknesses.length === 0 ? (
          <EmptyMessage>No shared weaknesses found.</EmptyMessage>
        ) : (
          analysis.weaknesses.map(({ type, pokemon, recommendation }) => {
            const severity = getWeaknessSeverity(pokemon.length);

            return (
              <AnalysisItem
                key={type}
                badge={<TypeBadge type={formatTypeName(type)} />}
                pokemon={pokemon}
                severity={{
                  label: severity.label,
                  className: `analysis-severity-${severity.level}`,
                }}
                heading={`Pokémon weak to ${formatTypeName(type)}:`}
                showMultipliers
                recommendation={recommendation}
              />
            );
          })
        )}
      </Card>

      <Card title="Immunities" list>
        {analysis.immunities.length === 0 ? (
          <EmptyMessage>This team has no base-type immunities.</EmptyMessage>
        ) : (
          analysis.immunities.map(({ type, pokemon }) => (
            <AnalysisItem
              key={type}
              badge={<TypeBadge type={formatTypeName(type)} />}
              pokemon={pokemon}
              severity={{
                label: "Immunity",
                className: "analysis-severity-positive",
              }}
              heading={`Pokémon immune to ${formatTypeName(type)}:`}
            />
          ))
        )}
      </Card>

      <Card title="Team Types" list>
        {analysis.teamTypes.map(({ type, pokemon }) => (
          <AnalysisItem
            key={type}
            badge={<TypeBadge type={formatTypeName(type)} />}
            pokemon={pokemon}
            heading={`Pokémon with the ${formatTypeName(type)} type:`}
          />
        ))}
      </Card>

      {/* team-analysis.css lays this list out by its id. */}
      <Card title="Type Coverage" list listId="analysis-type-coverage">
        <TypeCoverageSection coverage={analysis.coverage} />
      </Card>

      <Card title="Role Balance" list>
        <RoleBalanceSection roleBalance={analysis.roleBalance} />
      </Card>
    </div>
  );
}

function TypeCoverageSection({ coverage }: { coverage: TypeCoverage }) {
  if (coverage.covered.length === 0) {
    return (
      <EmptyMessage>Select moves on this team to see type coverage.</EmptyMessage>
    );
  }

  return (
    <>
      <TypeBadgeList heading="Super-effective against:" types={coverage.covered} />

      {coverage.gaps.length > 0 && (
        <TypeBadgeList heading="No coverage against:" types={coverage.gaps} />
      )}
    </>
  );
}

function RoleBalanceSection({ roleBalance }: { roleBalance: RoleBalance }) {
  const { roleMembers, findings, teamSize } = roleBalance;

  if (teamSize === 0) {
    return <EmptyMessage>Add Pokémon to this team to see role balance.</EmptyMessage>;
  }

  const populatedRoles = ROLE_ORDER.filter(
    (role) => roleMembers[role].length > 0,
  );

  return (
    <>
      <FindingList
        findings={findings}
        className="team-analysis-summary-list analysis-role-findings"
      />

      {populatedRoles.length === 0 ? (
        <EmptyMessage>
          No roles detected yet — set natures, EVs, and moves on this team.
        </EmptyMessage>
      ) : (
        populatedRoles.map((role) => (
          <AnalysisItem
            key={role}
            badge={<span className="analysis-role-badge">{ROLE_LABELS[role]}</span>}
            pokemon={roleMembers[role]}
            heading={`${ROLE_LABELS[role]}:`}
          />
        ))
      )}
    </>
  );
}

function TypeBadgeList({ heading, types }: { heading: string; types: string[] }) {
  return (
    <>
      <p className="analysis-breakdown-heading">{heading}</p>

      <div className="analysis-type-badge-list">
        {types
          .slice()
          .sort()
          .map((type) => (
            <TypeBadge key={type} type={formatTypeName(type)} />
          ))}
      </div>
    </>
  );
}

// `list` wraps the content in the stacked-rows layout most cards use.
function Card({
  title,
  list = false,
  listId,
  children,
}: {
  title: string;
  list?: boolean;
  listId?: string;
  children: ReactNode;
}) {
  return (
    <article className="team-analysis-card">
      <h3>{title}</h3>

      {list ? (
        <div className="analysis-type-list" id={listId}>
          {children}
        </div>
      ) : (
        children
      )}
    </article>
  );
}

function Status({ children }: { children: ReactNode }) {
  return (
    <div className="team-analysis-status" role="status" aria-live="polite">
      {children}
    </div>
  );
}

function EmptyMessage({ children }: { children: ReactNode }) {
  return <p className="analysis-empty-message">{children}</p>;
}
