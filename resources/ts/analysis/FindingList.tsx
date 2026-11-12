import type { Finding, FindingKind } from "./team-analysis";

const ICONS: Record<FindingKind, string> = {
  warning: "!",
  positive: "✓",
  neutral: "i",
};

/** A list of findings, each with a ! / ✓ / i icon. */
export function FindingList({
  findings,
  className = "team-analysis-summary-list",
}: {
  findings: Finding[];
  className?: string;
}) {
  return (
    <ul className={className}>
      {findings.map(({ kind, message }) => (
        <li
          key={message}
          className={`team-analysis-summary-item summary-${kind}`}
        >
          <span className="team-analysis-summary-icon" aria-hidden="true">
            {ICONS[kind]}
          </span>
          <span>{message}</span>
        </li>
      ))}
    </ul>
  );
}
