// Uses the type colours from team-builder.css, shared with the rest of Brymon.
export function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`pokemon-type-badge pokemon-type-${type.toLowerCase()}`}>
      {type}
    </span>
  );
}
