import {
  createContext,
  useContext,
  useReducer,
  type Context,
  type ReactNode,
} from "react";
import {
  calcReducer,
  createInitialCalcState,
  type CalcDispatch,
  type CalcState,
} from "./calc-reducer";
import type { SavedPokemon, SavedTeam } from "./SidePanel";

/*
|--------------------------------------------------------------------------
| Calculator Context
|--------------------------------------------------------------------------
|
| CalcProvider owns the calculator's state (calc-reducer.ts) and shares it
| with any component inside it, so panels read what they need instead of
| receiving it through every component in between.
|
| Three contexts, because the values change at different rates:
| - state changes on every keystroke;
| - dispatch never changes (React keeps the same function), so a
|   component that only sends actions isn't re-rendered by state changes;
| - savedTeams comes from PHP once and never changes.
|
*/

// undefined means "no provider above this component", which is a bug.
// null is a real savedTeams value (signed out), so it can't mean that.
const CalcStateContext = createContext<CalcState | undefined>(undefined);
const CalcDispatchContext = createContext<CalcDispatch | undefined>(undefined);
const SavedTeamsContext = createContext<SavedTeam[] | null | undefined>(
  undefined,
);

type CalcProviderProps = {
  // null when signed out, [] when signed in without saved teams.
  savedTeams: SavedTeam[] | null;
  linkedPokemon: SavedPokemon | null;
  children: ReactNode;
};

export function CalcProvider({
  savedTeams,
  linkedPokemon,
  children,
}: CalcProviderProps) {
  // The third argument builds the first state lazily, once.
  const [state, dispatch] = useReducer(
    calcReducer,
    linkedPokemon,
    createInitialCalcState,
  );

  return (
    <SavedTeamsContext.Provider value={savedTeams}>
      <CalcDispatchContext.Provider value={dispatch}>
        <CalcStateContext.Provider value={state}>
          {children}
        </CalcStateContext.Provider>
      </CalcDispatchContext.Provider>
    </SavedTeamsContext.Provider>
  );
}

function useRequiredContext<T>(
  context: Context<T | undefined>,
  hookName: string,
): T {
  const value = useContext(context);

  // Fail loudly instead of rendering with missing data.
  if (value === undefined) {
    throw new Error(`${hookName} must be used inside <CalcProvider>.`);
  }

  return value;
}

export function useCalcState(): CalcState {
  return useRequiredContext(CalcStateContext, "useCalcState");
}

export function useCalcDispatch(): CalcDispatch {
  return useRequiredContext(CalcDispatchContext, "useCalcDispatch");
}

export function useSavedTeams(): SavedTeam[] | null {
  return useRequiredContext(SavedTeamsContext, "useSavedTeams");
}
