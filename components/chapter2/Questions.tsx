import React, { useState, useRef } from "react";
import { View, Text, PanResponder, Animated } from "react-native";
import {
  acceptAnswer,
  type Attempt,
  type Question,
} from "../../game/questions";
import { Button, s, theme } from "./ui";
import referenceNotes from "../../game/chapter2/content/reference-notes.json";
export function Questions({
  attempt,
  questions,
  onChange,
  onFinish,
}: {
  attempt: Attempt;
  questions: Question[];
  onChange: () => void;
  onFinish: () => void;
}) {
  const [showContext, setShowContext] = useState(false),
    [confirmed, setConfirmed] = useState(""),
    [feedback, setFeedback] = useState(""),
    [item, setItem] = useState<string | null>(null),
    [, render] = useState(0),
    targets = useRef<Record<string, View | null>>({}),
    a = attempt,
    found = questions.find((q) => q.id === a.questionIds[a.step]);
  if (confirmed)
    return (
      <View style={s.gap}>
        <Text style={s.title}>Investigación completada</Text>
        <Text style={s.body}>{confirmed}</Text>
        <Button
          primary
          label="Continuar investigación →"
          onPress={() => {
            setConfirmed("");
            if (a.finished) onFinish();
          }}
        />
      </View>
    );
  if (!found)
    return <Button label="Terminar investigación" primary onPress={onFinish} />;
  const q: Question = found;
  const order = a.optionOrders[q.id],
    grouped = q.kind === "classify" || q.kind === "match";
  function changed() {
    setFeedback("");
    render((n) => n + 1);
    onChange();
  }
  function choose(id: string) {
    if (grouped) {
      setItem(id);
      return;
    }
    if (q.kind === "single" || q.kind === "reflect") a.selected = [id];
    else if (a.selected.includes(id))
      a.selected = a.selected.filter((s) => s !== id);
    else a.selected.push(id);
    changed();
  }
  function assign(option: string, group: string) {
    a.selected = a.selected.filter((id) => !id.startsWith(option + "=>"));
    a.selected.push(`${option}=>${group}`);
    setItem(null);
    changed();
  }
  async function drop(option: string, x: number, y: number) {
    for (const [id, ref] of Object.entries(targets.current)) {
      if (!ref) continue;
      const hit = await new Promise<boolean>((resolve) =>
        ref.measureInWindow((rx, ry, w, h) =>
          resolve(x >= rx && x <= rx + w && y >= ry && y <= ry + h),
        ),
      );
      if (hit) {
        assign(option, id);
        return;
      }
    }
  }
  function check() {
    if (acceptAnswer(a, questions)) {
      setFeedback("");
      onChange();
      setConfirmed(q.explanation);
      render((n) => n + 1);
    } else {
      const chosen = q.options.find((o) => a.selected.includes(o.id));
      setFeedback(
        (chosen?.feedback ??
          "Revisa la relación entre las ideas y las fuentes que consultaste.") +
          " " +
          q.explanation,
      );
    }
  }
  return (
    <View style={s.gap}>
      <Text style={s.muted}>
        Investigación {a.step + 1} de {a.questionIds.length} ·{" "}
        {q.reference ?? "Aplica lo que descubriste"}
      </Text>
      <Text style={s.title}>{q.prompt}</Text>
      {q.reference &&
        referenceNotes[q.reference as keyof typeof referenceNotes] && (
          <>
            <Button
              label={
                showContext
                  ? "Ocultar contexto"
                  : "Consultar contexto de la referencia"
              }
              onPress={() => setShowContext((v) => !v)}
            />
            {showContext && (
              <View
                style={{
                  padding: 14,
                  backgroundColor: "#eee5d8",
                  borderRadius: 8,
                }}
              >
                <Text style={s.muted}>CONTEXTO ADAPTADO · {q.reference}</Text>
                <Text style={s.body}>
                  {referenceNotes[q.reference as keyof typeof referenceNotes]}
                </Text>
              </View>
            )}
          </>
        )}
      {q.kind === "order" && (
        <View
          style={{ padding: 14, backgroundColor: "#e8e0ed", borderRadius: 8 }}
        >
          <Text style={s.body}>
            {a.selected
              .map((id) => q.options.find((o) => o.id === id)?.text)
              .join(" → ") || "Construye aquí tu secuencia."}
          </Text>
          <Text style={s.muted}>
            Toca una tarjeta seleccionada para retirarla.
          </Text>
        </View>
      )}
      <View style={s.row}>
        {order.map((id) => {
          const option = q.options.find((o) => o.id === id)!,
            assigned = grouped
              ? a.selected.find((s) => s.startsWith(id + "=>"))?.split("=>")[1]
              : null;
          return (
            <Draggable
              key={id}
              enabled={grouped}
              onDrop={(x, y) => void drop(id, x, y)}
            >
              <Button
                label={
                  option.text +
                  (assigned
                    ? " · " + q.groups?.find((g) => g.id === assigned)?.text
                    : "")
                }
                selected={item === id || a.selected.includes(id)}
                onPress={() => choose(id)}
              />
            </Draggable>
          );
        })}
      </View>
      {grouped && (
        <>
          <Text style={s.muted}>
            Arrastra cada tarjeta a su destino, o toca una tarjeta y después su
            categoría.
          </Text>
          {q.groups?.map((g) => (
            <View
              key={g.id}
              ref={(ref) => {
                targets.current[g.id] = ref;
              }}
            >
              <Button
                label={g.text}
                selected={!!item}
                onPress={() => item && assign(item, g.id)}
              />
            </View>
          ))}
        </>
      )}
      {feedback !== "" && (
        <Text
          accessibilityLiveRegion="polite"
          style={[s.body, { color: theme.green }]}
        >
          {feedback}
        </Text>
      )}
      {(a.hints[q.id] ?? 0) > 0 && (
        <Text style={s.body}>{q.hints.slice(0, a.hints[q.id]).join("\n")}</Text>
      )}
      <View style={s.row}>
        <Button primary label="Comprobar" onPress={check} />
        <Button
          label="Limpiar selección"
          onPress={() => {
            a.selected = [];
            setItem(null);
            changed();
          }}
        />
        <Button
          label="Pedir una pista"
          disabled={(a.hints[q.id] ?? 0) >= q.hints.length}
          onPress={() => {
            a.hints[q.id] = (a.hints[q.id] ?? 0) + 1;
            onChange();
            render((n) => n + 1);
          }}
        />
      </View>
    </View>
  );
}
function Draggable({
  enabled,
  onDrop,
  children,
}: {
  enabled: boolean;
  onDrop: (x: number, y: number) => void;
  children: React.ReactNode;
}) {
  const offset = useRef(new Animated.ValueXY()).current;
  const current = useRef({ enabled, onDrop });
  current.current = { enabled, onDrop };
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        current.current.enabled && Math.hypot(g.dx, g.dy) > 10,
      onPanResponderMove: (_, g) => offset.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        current.current.onDrop(g.moveX, g.moveY);
        offset.setValue({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => offset.setValue({ x: 0, y: 0 }),
    }),
  ).current;
  return (
    <View {...pan.panHandlers} style={{ maxWidth: "100%" }}>
      <Animated.View style={{ transform: offset.getTranslateTransform() }}>
        {children}
      </Animated.View>
    </View>
  );
}
