import { MOVE_TIER_BEST, MOVE_TIER_WORSE } from "../constants/gameConstants";
import type { MoveTier, PlayerSymbol, StatusTone } from "../types";

export function getStatusLabel(
  gameStarted: boolean,
  winner: PlayerSymbol | null,
  draw: boolean,
  turn: PlayerSymbol,
  playerTurn: boolean,
): string {
  if (!gameStarted) {
    return "Waiting To Start";
  }
  if (winner) {
    return `Winner: ${winner}`;
  }
  if (draw) {
    return "Forced Draw";
  }
  return playerTurn ? `Your Turn (${turn})` : `AI Thinking (${turn})`;
}

export function getStatusTone(
  gameStarted: boolean,
  winner: PlayerSymbol | null,
  draw: boolean,
  playerTurn: boolean,
): StatusTone {
  if (!gameStarted) {
    return "idle";
  }
  if (winner) {
    return "win";
  }
  if (draw) {
    return "draw";
  }
  return playerTurn ? "active" : "cool";
}

export function scoreLabel(score: MoveTier): string {
  if (score === MOVE_TIER_BEST) {
    return "Best";
  }
  if (score === MOVE_TIER_WORSE) {
    return "Worse";
  }
  return "Option";
}

export function scoreClass(score: MoveTier): "win" | "draw" | "loss" {
  if (score === MOVE_TIER_BEST) {
    return "win";
  }
  if (score === MOVE_TIER_WORSE) {
    return "loss";
  }
  return "draw";
}
