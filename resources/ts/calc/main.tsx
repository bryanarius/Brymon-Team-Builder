import { createRoot } from "react-dom/client";
import { CalcCredit } from "./CalcCredit";
import "./legacy-bridge";

/*
|--------------------------------------------------------------------------
| Damage Calculator Island
|--------------------------------------------------------------------------
|
| PHP renders the page and leaves an empty-looking mount point. React
| takes over only that element; the rest of the page is untouched.
|
| The mount point holds a plain-HTML fallback, so the credit still shows
| if this script fails to load.
|
*/

const creditRoot = document.getElementById("calc-credit-root");

if (creditRoot) {
  createRoot(creditRoot).render(
    <CalcCredit libraryUrl="https://github.com/smogon/damage-calc" />,
  );
}
