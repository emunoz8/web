type TreeHeaderProps = {
  gameStarted: boolean;
  terminal: boolean;
  showHints: boolean;
  optionCount: number;
  stateCount: number;
};

function TreeHeader({ gameStarted, terminal, showHints, optionCount, stateCount }: TreeHeaderProps) {
  return (
    <div className="panel-header">
      <div>
        <p className="section-kicker">Tree View</p>
        <h2>Move Tree</h2>
      </div>
      <p className="move-summary">
        {!gameStarted ? "Choose who starts." : terminal ? "Terminal state." : showHints ? `${optionCount} moves, ${stateCount} states` : "Hints hidden"}
      </p>
    </div>
  );
}

export default TreeHeader;
