/** Shared, content-independent question engine. No positional answer keys. */
export type Option = { id: string; text: string; feedback?: string };
export type Question = {
  id: string;
  kind: "single" | "multi" | "order" | "classify" | "match" | "reflect";
  prompt: string;
  options: Option[];
  answer: string[];
  groups?: Option[];
  explanation: string;
  hints: string[];
  reference?: string;
};
export type Attempt = {
  version: number;
  seed: number;
  questionIds: string[];
  optionOrders: Record<string, string[]>;
  step: number;
  selected: string[];
  accepted: Record<string, string[]>;
  hints: Record<string, number>;
  finished: boolean;
};
export function randomFor(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function shuffle<T>(
  items: readonly T[],
  random: () => number = Math.random,
) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export function createAttempt(
  questions: Question[],
  seed = Date.now() >>> 0,
  independent = false,
): Attempt {
  const random = randomFor(seed),
    ids = independent
      ? shuffle(
          questions.map((q) => q.id),
          random,
        )
      : questions.map((q) => q.id);
  return {
    version: 1,
    seed,
    questionIds: ids,
    optionOrders: Object.fromEntries(
      questions.map((q) => [
        q.id,
        shuffle(
          q.options.map((o) => o.id),
          random,
        ),
      ]),
    ),
    step: 0,
    selected: [],
    accepted: {},
    hints: {},
    finished: false,
  };
}
export function evaluateQuestion(q: Question, selected: string[]) {
  if (new Set(selected).size !== selected.length) return false;
  if (q.kind === "reflect")
    return selected.length === 1 && q.options.some((o) => o.id === selected[0]);
  if (q.kind === "order")
    return JSON.stringify(q.answer) === JSON.stringify(selected);
  return (
    selected.length === q.answer.length &&
    q.answer.every((id) => selected.includes(id))
  );
}
export function acceptAnswer(a: Attempt, questions: Question[]) {
  const q = questions.find((q) => q.id === a.questionIds[a.step]);
  if (!q || !evaluateQuestion(q, a.selected)) return false;
  a.accepted[q.id] = [...a.selected];
  a.step++;
  a.selected = [];
  a.finished = a.step === a.questionIds.length;
  return true;
}
export function validateAttempt(raw: unknown, questions: Question[]): Attempt {
  const a = raw as Attempt,
    ids = questions.map((q) => q.id);
  const valid = (v: unknown, allowed: string[]) =>
    Array.isArray(v) &&
    new Set(v).size === v.length &&
    v.every((id) => allowed.includes(id));
  if (
    !a ||
    a.version !== 1 ||
    !Number.isInteger(a.seed) ||
    a.seed < 0 ||
    a.seed > 4294967295 ||
    !valid(a.questionIds, ids) ||
    a.questionIds.length !== ids.length ||
    !Number.isInteger(a.step) ||
    a.step < 0 ||
    a.step > ids.length ||
    a.finished !== (a.step === ids.length) ||
    !a.optionOrders ||
    !a.accepted ||
    !a.hints ||
    !Array.isArray(a.selected)
  )
    throw Error("Intento de preguntas incompatible.");
  if (
    [a.optionOrders, a.accepted, a.hints].some(
      (map) =>
        Array.isArray(map) ||
        typeof map !== "object" ||
        Object.keys(map).some((id) => !ids.includes(id)),
    )
  )
    throw Error("Preguntas desconocidas en el intento.");
  for (let i = 0; i < ids.length; i++) {
    const q = questions.find((q) => q.id === a.questionIds[i])!;
    if (
      !valid(
        a.optionOrders[q.id],
        q.options.map((o) => o.id),
      ) ||
      a.optionOrders[q.id].length !== q.options.length
    )
      throw Error("Orden de opciones inválido.");
    if (i < a.step && !evaluateQuestion(q, a.accepted[q.id] ?? []))
      throw Error("Respuesta aceptada incoherente.");
    if (i >= a.step && Object.hasOwn(a.accepted, q.id))
      throw Error("Pasos de investigación adelantados.");
  }
  const current = questions.find((q) => q.id === a.questionIds[a.step]);
  const allowed = current
    ? current.kind === "match" || current.kind === "classify"
      ? current.options.flatMap((o) =>
          (current.groups ?? []).map((g) => `${o.id}=>${g.id}`),
        )
      : current.options.map((o) => o.id)
    : [];
  if (
    !valid(a.selected, allowed) ||
    (current &&
      ["single", "reflect"].includes(current.kind) &&
      a.selected.length > 1) ||
    (current &&
      ["match", "classify"].includes(current.kind) &&
      new Set(a.selected.map((id) => id.split("=>")[0])).size !==
        a.selected.length) ||
    Object.entries(a.hints).some(
      ([id, n]) => !ids.includes(id) || !Number.isInteger(n) || n < 0 || n > 3,
    )
  )
    throw Error("Selección o pistas inválidas.");
  return JSON.parse(JSON.stringify(a));
}
