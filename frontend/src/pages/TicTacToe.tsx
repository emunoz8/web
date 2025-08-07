import React, { useEffect, useState, useCallback } from "react";

type Player = "X" | "O";
type Cell = Player | "-";
type Lookup = Record<string, number>;

function boardToKey(board: Cell[]): string {
  return board.join("");
}

export default function TicTacToe() {
  const [lookupX, setLookupX] = useState<Lookup | null>(null);
  const [lookupO, setLookupO] = useState<Lookup | null>(null);
  const [board, setBoard] = useState<Cell[]>(Array(9).fill("-"));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [aiPlayer, setAiPlayer] = useState<Player | null>(null);
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);

  useEffect(() => {
    fetch("/tictactoe_lookup_X.json").then((res) => res.json()).then(setLookupX);
    fetch("/tictactoe_lookup_O.json").then((res) => res.json()).then(setLookupO);
  }, []);

  const checkWinner = (b: Cell[]): Player | "Draw" | null => {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (const [a,b1,c] of lines) {
      if (b[a] !== "-" && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    return b.includes("-") ? null : "Draw";
  };

  const handlePlayerMove = (index: number) => {
    if (winner || board[index] !== "-" || currentPlayer !== (aiPlayer === "X" ? "O" : "X")) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
    } else {
      setCurrentPlayer(aiPlayer!);
    }
  };

const aiMove = useCallback((currentBoard: Cell[]) => {
  const lookup = aiPlayer === "X" ? lookupX : lookupO;
  if (!lookup) {
   
    return;
  }

  const key = boardToKey(currentBoard);
  console.log(key);
  const bestMove = lookup[key];
  if (bestMove === undefined) {
    return;
  }
  const newBoard = [...currentBoard];
  newBoard[bestMove] = aiPlayer!;
  setBoard(newBoard);

  const gameResult = checkWinner(newBoard);
  if (gameResult) {
    setWinner(gameResult);
  } else {
    setCurrentPlayer(aiPlayer === "X" ? "O" : "X");
  }
}, [aiPlayer, lookupX, lookupO, setBoard, setWinner, setCurrentPlayer]);

useEffect(() => {
  if (aiPlayer && currentPlayer === aiPlayer && lookupX && lookupO) {
    setTimeout(() => aiMove(board), 150);
  }
}, [currentPlayer, aiPlayer, board, lookupX, lookupO, aiMove]);

const startGame = (ai: Player, current: Player) => {
  setBoard(Array(9).fill("-"));
  setAiPlayer(ai);
  setWinner(null);
  setCurrentPlayer(current);
};

const chooseAiFirst = (aiPlayerSymbol: Player) => {
  const current = "X"; // X always starts first
  startGame(aiPlayerSymbol, current);
};

const handleReset = () => {
  setAiPlayer(null);    // clear AI choice to show UI again
  setBoard(Array(9).fill("-"));
  setWinner(null);
  setCurrentPlayer("X"); // or any default, doesn't matter since game hasn't started
};


return (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",    // full viewport height
      textAlign: "center" // center text inside
    }}
  >
    <h1>Tic Tac Toe AI</h1>

    {!aiPlayer && (
      <div>
        <p>Who should go first?</p>
        <button onClick={() => chooseAiFirst("O")}>Player First (X)</button>
        <button onClick={() => chooseAiFirst("X")}>AI First (X)</button>
      </div>
    )}

    {aiPlayer && (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 100px)", gap: 5, marginTop: 20 }}>
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => handlePlayerMove(i)}
              style={{ height: 100, fontSize: 32 }}
            >
              {cell}
            </button>
          ))}
        </div>

        {winner && (
          <div style={{ marginTop: 20 }}>
            <h2>{winner === "Draw" ? "It's a draw!" : `${winner} wins!`}</h2>
            <button onClick={handleReset}>Play Again</button>
          </div>
        )}
      </>
    )}
  </div>
);

}
