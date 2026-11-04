import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  PanResponder,
  Platform,
  Animated,
} from "react-native";
import {
  books,
  countCorrect,
  limits,
  type BookAttempt,
  type Difficulty,
} from "../../game/chapter2/puzzles";
import { Button, s, theme } from "./ui";
export function BookBoard({
  board,
  onMode,
  onStart,
  onSwap,
  onPause,
}: {
  board: BookAttempt | null;
  onMode: (d: Difficulty) => void;
  onStart: () => void;
  onSwap: (a: number, b: number) => void;
  onPause: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null),
    [dragging, setDragging] = useState<number | null>(null),
    refs = useRef<Record<number, View | null>>({}),
    b = board;
  function pick(i: number) {
    if (b?.status !== "running") return;
    if (selected === null) setSelected(i);
    else {
      onSwap(selected, i);
      setSelected(null);
    }
  }
  async function drop(from: number, x: number, y: number) {
    const entries = Object.entries(refs.current);
    for (const [key, ref] of entries) {
      if (!ref) continue;
      const hit = await new Promise<boolean>((resolve) =>
        ref.measureInWindow((rx, ry, w, h) =>
          resolve(x >= rx && x <= rx + w && y >= ry && y <= ry + h),
        ),
      );
      if (hit) {
        onSwap(from, Number(key));
        setSelected(null);
        break;
      }
    }
    setDragging(null);
  }
  return (
    <View style={s.gap}>
      <Text style={s.body}>
        Reconstruye el orden de los 66 libros. Intercambia dos tarjetas
        tocándolas, usando Tab y Entrar, o arrastrando una sobre otra.
      </Text>
      <View style={s.row}>
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <Button
            key={d}
            label={`${d === "easy" ? "Exploración" : d === "medium" ? "Estudio" : "Desafío"} · ${limits[d] / 60} min`}
            selected={b?.difficulty === d}
            disabled={b?.status === "running" || b?.status === "won"}
            onPress={() => {
              setSelected(null);
              onMode(d);
            }}
          />
        ))}
      </View>
      {b && (
        <>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <Text style={s.title}>{countCorrect(b.board)}/66 en su lugar</Text>
            <Text style={s.body}>
              {Math.floor(Math.ceil(b.remaining) / 60)}:
              {String(Math.ceil(b.remaining) % 60).padStart(2, "0")} · {b.swaps}{" "}
              intercambios
            </Text>
          </View>
          <Text style={s.muted}>
            Mejor avance: {b.bestCorrect}/66 · El reloj se detiene al pausar o
            salir de esta pantalla.
          </Text>
          {b.status === "ready" || b.status === "paused" ? (
            <Button
              primary
              label={
                b.status === "ready" ? "Comenzar" : "Continuar el mismo tablero"
              }
              onPress={onStart}
            />
          ) : b.status === "running" ? (
            <Button label="Pausar el reloj" onPress={onPause} />
          ) : (
            <Text style={[s.body, { color: theme.green }]}>
              {b.status === "won"
                ? "¡Los 66 libros están en orden!"
                : "El tiempo terminó. Puedes volver a intentarlo o elegir otra dificultad."}
            </Text>
          )}
          {b.status === "timeout" && (
            <Button
              primary
              label="Nuevo intento"
              onPress={() => onMode(b.difficulty)}
            />
          )}
          {(["hebrew", "greek"] as const).map((section) => (
            <View key={section} style={s.gap}>
              <Text style={s.title}>
                {section === "hebrew"
                  ? "Escrituras Hebreas · 39 libros"
                  : "Escrituras Griegas Cristianas · 27 libros"}
              </Text>
              <View style={s.row}>
                {b.board.map((id, i) => {
                  const expected = books[i];
                  if (expected.section !== section) return null;
                  const book = books.find((book) => book.id === id)!;
                  return (
                    <BookTile
                      key={i}
                      index={i}
                      text={`${i + 1}. ${book.name}`}
                      active={b.status === "running"}
                      selected={
                        b.status === "won" || selected === i || dragging === i
                      }
                      register={(ref) => {
                        refs.current[i] = ref;
                      }}
                      onPress={() => pick(i)}
                      onDrag={() => setDragging(i)}
                      onDrop={(x, y) => void drop(i, x, y)}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
function BookTile({
  index,
  text,
  active,
  selected,
  register,
  onPress,
  onDrag,
  onDrop,
}: {
  index: number;
  text: string;
  active: boolean;
  selected: boolean;
  register: (v: View | null) => void;
  onPress: () => void;
  onDrag: () => void;
  onDrop: (x: number, y: number) => void;
}) {
  const offset = useRef(new Animated.ValueXY()).current;
  const current = useRef({ active, onDrag, onDrop });
  current.current = { active, onDrag, onDrop };
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        current.current.active && Math.hypot(g.dx, g.dy) > 8,
      onPanResponderGrant: () => current.current.onDrag(),
      onPanResponderMove: (_, g) => offset.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        current.current.onDrop(g.moveX, g.moveY);
        offset.setValue({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => {
        current.current.onDrop(-1, -1);
        offset.setValue({ x: 0, y: 0 });
      },
    }),
  ).current;
  return (
    <View
      ref={register}
      {...pan.panHandlers}
      style={{ width: "30%", minWidth: 100, flexGrow: 1 }}
    >
      <Animated.View
        style={{
          transform: offset.getTranslateTransform(),
          zIndex: selected ? 10 : 0,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Posición ${index + 1}, ${text}`}
          accessibilityState={{ disabled: !active, selected }}
          disabled={!active}
          onPress={onPress}
          style={[
            s.button,
            { minHeight: 62, paddingHorizontal: 9, paddingVertical: 8 },
            selected && s.selected,
          ]}
        >
          <Text style={{ fontSize: 13, color: theme.ink }}>{text}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
