type CalcCreditProps = {
  libraryUrl: string;
};

/**
 * The "Calculations by @smogon/calc" line under the calculator.
 *
 * Deliberately tiny: it's the first React component in Brymon, here to
 * prove the build works end to end before the real calculator moves over.
 */
export function CalcCredit({ libraryUrl }: CalcCreditProps) {
  return (
    <p className="calc-credit" data-rendered-by="react">
      Calculations by{" "}
      <a href={libraryUrl} rel="noopener">
        @smogon/calc
      </a>
      , the calculator behind Pokémon Showdown.
    </p>
  );
}
