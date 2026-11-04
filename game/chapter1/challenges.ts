import content from "../dialogues/chapter1.json" with { type: "json" };
import type { Progress } from "../missions/progress.ts";
export type Option = { id: string; text: string };
export type Stage = {
  kind: string;
  prompt: string;
  options: Option[];
  answers: string[];
  hint: string;
  requires?: Record<string, string>;
  byAnswer?: Record<string, string[]>;
};
export type SceneDefinition = {
  number: number;
  id: string;
  title: string;
  dialogue: { speaker: string; text: string }[];
  stages: Stage[];
  reference: string;
  intro: string;
};
export const scenes = content.scenes as SceneDefinition[];
export const getScene = (n: number) => scenes[n - 1];
export function shuffled<T>(items: T[], random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function optionAvailable(stage: Stage, id: string, p: Progress) {
  const rule = stage.requires?.[id];
  if (!rule) return true;
  const [kind, value] = rule.split(":");
  return (kind === "item" ? p.items : p.evidence).includes(value);
}
export function evaluateStage(
  stage: Stage,
  selected: string[],
  history: string[][],
  p: Progress,
) {
  if (
    selected.some(
      (id) =>
        !stage.options.some((o) => o.id === id) ||
        !optionAvailable(stage, id, p),
    )
  )
    return false;
  const expected = stage.byAnswer?.[history[0]?.[0]] ?? stage.answers;
  if (stage.kind === "order") {
    const text = (id: string) =>
      stage.options.find((o) => o.id === id)?.text.toLocaleLowerCase("es");
    return (
      selected.length === expected.length &&
      selected.every((id, i) => text(id) === text(expected[i]))
    );
  }
  if (stage.kind === "multi")
    return (
      selected.length === expected.length &&
      expected.every((id) => selected.includes(id))
    );
  return selected.length === 1 && expected.includes(selected[0]);
}
