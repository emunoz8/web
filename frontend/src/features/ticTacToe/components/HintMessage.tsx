type HintMessageProps = {
  gameStarted: boolean;
  terminal: boolean;
  showHints: boolean;
  playerTurn: boolean;
};

function HintMessage({ gameStarted, terminal, showHints, playerTurn }: HintMessageProps) {
  if (!gameStarted) {
    return <p className="hint">Choose who starts to begin.</p>;
  }

  if (terminal) {
    return <p className="hint">Game over.</p>;
  }

  if (showHints && playerTurn) {
    return <p className="hint">Select a square on the root board or choose a canonical state below.</p>;
  }

  if (showHints) {
    return <p className="hint">AI is making the next move.</p>;
  }

  return <p className="hint">Hint states are hidden.</p>;
}

export default HintMessage;
