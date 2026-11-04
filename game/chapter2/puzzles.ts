import bookData from "./content/books.json" with { type: "json" };
import { randomFor } from "../questions.ts";
export const books = bookData;
export const bookIds = books.map((b) => b.id);
export type Difficulty = "easy" | "medium" | "hard";
export const limits: Record<Difficulty, number> = {
  easy: 600,
  medium: 360,
  hard: 180,
};
export type BookAttempt = {
  id: string;
  seed: number;
  difficulty: Difficulty;
  board: string[];
  elapsed: number;
  remaining: number;
  swaps: number;
  bestCorrect: number;
  status: "ready" | "running" | "paused" | "timeout" | "won";
};
export type BookRecord = { seconds: number; swaps: number };
export function countCorrect(board: string[]) {
  return board.reduce((sum, id, i) => sum + Number(id === bookIds[i]), 0);
}
export function newBookAttempt(
  difficulty: Difficulty,
  seed = Date.now() >>> 0,
): BookAttempt {
  const random = randomFor(seed),
    board = [...bookIds];
  for (let i = board.length - 1; i > 0; i--) {
    const j = Math.floor(random() * i);
    [board[i], board[j]] = [board[j], board[i]];
  }
  return {
    id: "books_" + seed.toString(16),
    seed,
    difficulty,
    board,
    elapsed: 0,
    remaining: limits[difficulty],
    swaps: 0,
    bestCorrect: 0,
    status: "ready",
  };
}
export function swapBooks(a: BookAttempt, first: number, second: number) {
  if (
    a.status !== "running" ||
    !Number.isInteger(first) ||
    !Number.isInteger(second) ||
    first < 0 ||
    second < 0 ||
    first >= 66 ||
    second >= 66 ||
    first === second
  )
    return false;
  [a.board[first], a.board[second]] = [a.board[second], a.board[first]];
  a.swaps++;
  const correct = countCorrect(a.board);
  a.bestCorrect = Math.max(a.bestCorrect, correct);
  if (correct === 66) a.status = "won";
  return true;
}
export function tickBooks(a: BookAttempt, dt: number) {
  if (a.status !== "running" || !Number.isFinite(dt) || dt <= 0) return;
  a.elapsed = Math.min(limits[a.difficulty], a.elapsed + dt);
  a.remaining = Math.max(0, limits[a.difficulty] - a.elapsed);
  if (a.remaining === 0) a.status = "timeout";
}
export function validateBookAttempt(raw: unknown): BookAttempt {
  const a = raw as BookAttempt;
  if (
    !a ||
    !Object.hasOwn(limits, a.difficulty) ||
    typeof a.id !== "string" ||
    a.id.length > 100 ||
    !Number.isInteger(a.seed) ||
    a.seed < 0 ||
    a.seed > 4294967295 ||
    !Array.isArray(a.board) ||
    a.board.length !== 66 ||
    new Set(a.board).size !== 66 ||
    a.board.some((id) => !bookIds.includes(id)) ||
    !["ready", "running", "paused", "timeout", "won"].includes(a.status) ||
    !Number.isInteger(a.swaps) ||
    a.swaps < 0 ||
    !Number.isInteger(a.bestCorrect) ||
    a.bestCorrect < 0 ||
    a.bestCorrect > 66 ||
    !Number.isFinite(a.elapsed) ||
    a.elapsed < 0 ||
    a.elapsed > limits[a.difficulty] ||
    !Number.isFinite(a.remaining) ||
    Math.abs(a.remaining + a.elapsed - limits[a.difficulty]) > 0.001 ||
    a.bestCorrect < countCorrect(a.board)
  )
    throw Error("Reto de libros incompatible.");
  if (
    (a.status === "won") !== (countCorrect(a.board) === 66) ||
    (a.status === "timeout" && a.remaining !== 0) ||
    (a.remaining === 0 && !["timeout", "won"].includes(a.status)) ||
    (a.status === "ready" && (a.elapsed !== 0 || a.swaps !== 0))
  )
    throw Error("Estado del cronómetro incoherente.");
  // Every imported arrangement must be reachable from its seeded board in the
  // declared number of swaps, including parity. A ready board has never moved.
  const initial = newBookAttempt(a.difficulty, a.seed).board,
    visited = new Set<number>();
  let cycles = 0;
  for (let i = 0; i < 66; i++) {
    if (visited.has(i)) continue;
    cycles++;
    let j = i;
    while (!visited.has(j)) {
      visited.add(j);
      j = initial.indexOf(a.board[j]);
    }
  }
  const minimum = 66 - cycles;
  if (
    a.swaps < minimum ||
    (a.swaps - minimum) % 2 !== 0 ||
    (a.status === "ready" && minimum !== 0)
  )
    throw Error("Intercambios incompatibles con la mezcla inicial.");
  return JSON.parse(JSON.stringify(a));
}
