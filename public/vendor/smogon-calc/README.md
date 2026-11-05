# @smogon/calc 0.12.0

Pokémon Showdown's damage calculator, used by Brymon's damage calculator.
These are the package's prebuilt browser bundles, copied unchanged from
`npm pack @smogon/calc@0.12.0`:

| File          | Package path                    | Defines                                          |
| ------------- | ------------------------------- | ------------------------------------------------ |
| `data.min.js` | `dist/data/production.min.js`   | `window.calc.Generations` (species, moves, ...)  |
| `calc.min.js` | `dist/production.min.js`        | `window.calc.calculate`, `Pokemon`, `Move`, ...  |

Load `data.min.js` first. To upgrade, `npm pack` the new version and copy
the same two files.

- Source: https://github.com/smogon/damage-calc
- License: MIT (see `LICENSE`)
