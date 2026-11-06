import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  evaluateStage,
  shuffled,
  optionAvailable,
  type SceneDefinition,
} from "../game/chapter1/challenges";
import { challengeRevision, type ChallengeDraft } from "../game/chapter1/draft";
import type { Progress } from "../game/missions/progress";
export default function ChallengePanel({
  scene,
  progress,
  onComplete,
  initialDraft,
  onChange,
}: {
  scene: SceneDefinition;
  progress: Progress;
  onComplete: (history: string[][]) => boolean;
  initialDraft: ChallengeDraft | null;
  onChange: (draft: ChallengeDraft) => void;
}) {
  const [step, setStep] = useState(initialDraft?.history.length ?? 0),
    [history, setHistory] = useState<string[][]>(() => initialDraft?.history.map(answer => [...answer]) ?? []),
    [selected, setSelected] = useState<string[]>(() => [...(initialDraft?.selected ?? [])]),
    [feedback, setFeedback] = useState(""),
    [hints, setHints] = useState(initialDraft?.hints ?? false);
  const stage = scene.stages[step];
  const [options, setOptions] = useState(() => initialDraft
    ? initialDraft.order.map(id => stage.options.find(option => option.id === id)!)
    : shuffled(stage.options));
  const changed = useRef(onChange);
  changed.current = onChange;
  const submitted = useRef(false);
  useEffect(() => {
    if (submitted.current) return;
    changed.current({ version: 1, scene: scene.number, revision: challengeRevision(scene), history, selected, order: options.map(option => option.id), hints });
  }, [scene, history, selected, options, hints]);
  function check() {
    if (submitted.current) return;
    if (!evaluateStage(stage, selected, history, progress)) {
      setFeedback(
        "Revisa lo que observaste y cómo se relaciona con tu decisión. Puedes volver a intentarlo.",
      );
      return;
    }
    const next = [...history, selected];
    if (step + 1 === scene.stages.length) {
      submitted.current = true;
      if (!onComplete(next)) submitted.current = false;
      return;
    }
    setHistory(next);
    setStep(step + 1);
    setSelected([]);
    setFeedback("");
    setHints(false);
    setOptions(shuffled(scene.stages[step + 1].options));
  }
  function toggle(id: string) {
    setFeedback("");
    if (stage.kind === "order" || stage.kind === "multi")
      setSelected((v) =>
        v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
      );
    else setSelected([id]);
  }
  return (
    <View style={{ gap: 16 }}>
      <Text style={s.eyebrow}>
        PASO {step + 1} DE {scene.stages.length} ·{" "}
        {stage.kind === "reflect"
          ? "REFLEXIÓN PERSONAL"
          : "OBSERVA · PIENSA · DECIDE"}
      </Text>
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={s.prompt}>{stage.prompt}</Text>
      <Text style={s.reference}>{stage.kind === "order"
        ? "Elige los fragmentos en orden. Algunos sobran; toca uno elegido para quitarlo."
        : stage.kind === "multi" ? "Puedes marcar varias opciones. Revisa cuántas pide la pregunta."
        : stage.kind === "reflect" ? "Elige la reflexión que te represente. Aquí no hay una respuesta incorrecta."
        : "Elige una sola respuesta y después pulsa Comprobar decisión."}</Text>
      {stage.kind === "order" && (
        <View style={s.answer}>
          <Text style={s.text}>
            {selected.length
              ? selected
                  .map((id) =>
                    stage.options
                      .find((o) => o.id === id)!
                      .text.toLocaleUpperCase("es"),
                  )
                  .join(" ")
              : "Toca los fragmentos en el orden que elijas."}
          </Text>
        </View>
      )}
      <View style={stage.kind === "order" ? s.wrap : { gap: 10 }}>
        {options.map((o) => {
          const active = selected.includes(o.id),
            available = optionAvailable(stage, o.id, progress);
          return (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: !available }}
              disabled={!available}
              onPress={() => toggle(o.id)}
              style={[
                s.option,
                active && s.chosen,
                !available && { opacity: 0.45 },
              ]}
            >
              <Text style={[s.text, active && { color: "#fff5d9" }]}>
                {stage.kind === "order"
                  ? o.text.toLocaleUpperCase("es")
                  : o.text}
                {!available ? " · Falta encontrar el recurso" : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {feedback !== "" && (
        <Text accessibilityLiveRegion="polite" style={s.feedback}>
          {feedback}
        </Text>
      )}
      {hints && <Text style={s.text}>{stage.hint}</Text>}
      <View style={s.wrap}>
        <Pressable
          accessibilityRole="button"
          onPress={check}
          disabled={!selected.length}
          style={[s.option, s.gold, !selected.length && { opacity: 0.45 }]}
        >
          <Text style={s.text}>
            {stage.kind === "reflect"
              ? "Guardar reflexión"
              : "Comprobar decisión"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setSelected([]);
            setFeedback("");
          }}
          style={s.option}
        >
          <Text style={s.text}>Borrar selección</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setHints(true)}
          style={s.option}
        >
          <Text style={s.text}>Consultar una pista</Text>
        </Pressable>
      </View>
      <Text style={s.reference}>Puedes salir del reto y retomarlo desde Pausa. Los pasos aceptados y tu selección se conservan.</Text>
      <Text style={s.reference}>{scene.reference}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  eyebrow: { color: "#67766c", fontSize: 13, letterSpacing: 1 },
  prompt: { color: "#3e514a", fontSize: 21, lineHeight: 29 },
  text: { color: "#354b45", fontSize: 17, lineHeight: 24 },
  answer: {
    backgroundColor: "#e8e3d1",
    borderRadius: 10,
    padding: 18,
    minHeight: 72,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: "#a9ad90",
    borderRadius: 9,
    backgroundColor: "#fffaf0",
    minHeight: 48,
  },
  chosen: { backgroundColor: "#365f59", borderColor: "#365f59" },
  gold: { backgroundColor: "#f1d28b", borderColor: "#ac8854" },
  feedback: { color: "#8b5439", fontSize: 17, lineHeight: 25 },
  reference: { fontSize: 13, color: "#68766c", lineHeight: 20 },
});
