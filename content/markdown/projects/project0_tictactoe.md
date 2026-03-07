# Tic Tac Toe
### Minimax Lookup Generator
**08/06/25**

This project started as something I wanted to build years earlier in an AI course. We used *Artificial Intelligence: A Modern Approach* and spent a lot of time working through game-playing problems, search, and Minimax. At the time, I understood the idea, but I did not have the skill to build the full Tic-Tac-Toe agent I had in mind.

That finally changed. I finished the project as a Java lookup generator that computes optimal Tic-Tac-Toe moves ahead of time, compresses the state space, and writes the result to JSON for a frontend UI to consume. That lookup now also powers an interactive feature route inside this site.

[Live Demo](/tic-tac-toe)

[Game UI Repo](https://github.com/emunoz8/tic-tac-toe-game-ui)

[Lookup Generator Repo](https://github.com/emunoz8/tictactoe-minimax-lookup-generator)

![Book Cover](/assets/images/projects/book-cover.jpg)
*Artificial Intelligence: A Modern Approach - 4th Edition*

![Tic-Tac-Toe Minimax Diagram](/assets/images/projects/tictactoe-minimax-diagram.jpg)
*Diagram from Chapter 5 showing Minimax in Tic-Tac-Toe*

---

## What I built

- A Java 17 project that computes optimal Tic-Tac-Toe moves using Minimax implemented as Negamax
- A lookup generator that writes a compact `tictactoe_combined_lookup.json` file
- A symmetry-aware state reducer so equivalent boards are solved once instead of repeatedly
- A tested service layer that validates move quality, terminal handling, and canonical board generation

## How it works

Each board is represented as a 9-character string:

- Empty board: `"---------"`
- X opens in the center: `"----X----"`
- O responds in the corner: `"O---X----"`

From there, the generator recursively evaluates legal moves, scores positions, and stores the best move for each canonical non-terminal board state.

The implementation uses:

- Minimax via Negamax recurrence
- Depth-adjusted terminal scoring so the solver prefers faster wins and slower losses
- Memoization to reuse solved subproblems
- Symmetry reduction across the 8 Tic-Tac-Toe board symmetries
- Early win-check cutoff with `MIN_MOVES_TO_WIN = 5`

## Results

The finished generator documents and enforces the actual legal game space instead of brute forcing every labeling.

- Raw upper bound of cell labelings: `3^9 = 19,683`
- Legal complete game sequences: `255,168`
- Reachable legal board states: `5,478`
- Canonical reachable states after symmetry reduction: `765`
- Canonical non-terminal states used for the current X-start lookup: `627`

The current generator mode is focused on X-start games, which keeps the lookup smaller while still covering the version used by the UI.

## Testing and output

The repo includes JUnit tests that verify:

- choosing an immediate winning move
- blocking an immediate loss
- returning no move on terminal boards
- storing the empty board for X-start generation
- excluding O-first states from the current lookup mode
- canonicalizing symmetric board states correctly

Run flow:

```bash
mvn clean test
java -cp target/classes LookUpGenerator
```

Output:

- `tictactoe_combined_lookup.json`

That JSON is then consumed by the frontend game UI so the browser can respond instantly with optimal moves instead of running the full search every turn.

## Why I like this project

This is one of those projects that marks the difference between understanding a concept in class and actually engineering it into something usable. What started as "I should come back and finish that someday" turned into a complete Java project with tests, optimizations, reproducible output, and a clean bridge into a frontend experience.
