import { useEffect, useRef } from "react";
import type { ChartMember } from "./load-team-analysis";

/*
 * The 18-type defensive chart. public/js/type-chart.js draws it for the
 * team builder too, so instead of a second copy in React, this hands
 * type-chart.js an element to draw into. React leaves that element's
 * contents alone; it only re-draws when `members` changes.
 */
export function DefensiveChart({ members }: { members: ChartMember[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderDefensiveChart(containerRef.current, members);
  }, [members]);

  return <div id="analysis-defensive-chart" ref={containerRef} />;
}
