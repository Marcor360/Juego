import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  AppState,
  Switch,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import LibraryScene from "./LibrarySceneLoader";
import type { SceneFrame } from "./LibraryScene";
import { FixedStepClock } from "../../game/engine/ticker";
import { LibraryWorld } from "../../game/chapter2/engine/world";
import {
  rooms,
  sceneTargets,
  type RoomId,
  type Interaction,
} from "../../game/chapter2/maps/library";
import {
  activeScene,
  scene,
  getAttempt,
  questionsFor,
  missingFor,
  flagLabels,
  completeLibraryScene,
  hasScene,
  ch2id,
  addFlag,
  type LibraryState,
} from "../../game/chapter2/state";
import { createAttempt } from "../../game/questions";
import {
  newBookAttempt,
  swapBooks,
  tickBooks,
  type Difficulty,
} from "../../game/chapter2/puzzles";
import { withLibrary } from "../../game/chapter2/campaign";
import type { Save } from "../../game/save/schema";
import { Button, Modal, Portrait, names, s, theme } from "./ui";
import { Questions } from "./Questions";
import { BookBoard } from "./BookBoard";
import { useLibraryAudio } from "../../game/chapter2/audio";
import documents from "../../game/chapter2/content/references.json";
import { downloadSave } from "../../game/save/transfer";
type Panel =
  | "pause"
  | "map"
  | "journal"
  | "inventory"
  | "questions"
  | "books"
  | "settings"
  | "complete"
  | null;
type Dialogue = {
  lines: { speaker: string; text: string }[];
  index: number;
  scene?: number;
  closing?: boolean;
  returnToBooks?: boolean;
};
export default function LibraryGame({
  save,
  width,
  height,
  onChange,
  onExit,
}: {
  save: Save;
  width: number;
  height: number;
  onChange: (s: Save) => Promise<void>;
  onExit: () => void;
}) {
  const worldRef = useRef<LibraryWorld | null>(null);
  if (!worldRef.current) worldRef.current = new LibraryWorld(save.library);
  const world = worldRef.current,
    state = world.state;
  const [room, setRoom] = useState(state.room),
    [panel, setPanel] = useState<Panel>(null),
    [dialogue, setDialogue] = useState<Dialogue | null>(null),
    [notice, setNotice] = useState(""),
    [feedback, setFeedback] = useState<{ title: string; text: string } | null>(
      null,
    ),
    [, setRevision] = useState(0),
    [near, setNear] = useState(""),
    [order, setOrder] = useState<string[]>([]),
    [optional, setOptional] = useState(false),
    [settings, setSettings] = useState(save.settings),
    [action, setAction] = useState(-1);
  const sound = useLibraryAudio(
      room,
      settings,
      panel !== "pause" && panel !== "settings",
    ),
    soundRef = useRef(sound);
  soundRef.current = sound;
  const base = useRef(save),
    current = useRef({ panel, dialogue, feedback, settings });
  current.current = { panel, dialogue, feedback, settings };
  const frame = useSharedValue<SceneFrame>({
      x: state.x,
      y: state.y,
      cx: world.cameraX,
      cy: world.cameraY,
      time: state.worldTime,
      direction: 0,
      moving: false,
      actors: [],
    }),
    persistRef = useRef<() => Promise<void>>(async () => {}),
    interaction = useRef<() => void>(() => {}),
    active = useRef(true),
    boardSeconds = useRef(-1),
    victoryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compact = width < 740;
  async function persist() {
    const campaign = withLibrary(
      { ...base.current, settings: current.current.settings },
      world.snapshot(),
    );
    base.current = campaign;
    try {
      await onChange(campaign);
    } catch (e) {
      setNotice(
        "No se pudo guardar localmente. Descarga una copia antes de cerrar. " +
          (e as Error).message,
      );
    }
  }
  persistRef.current = persist;
  function refresh() {
    setRevision((n) => n + 1);
    void persist();
  }
  function pauseBoard() {
    const b = state.board;
    if (b?.status === "running") b.status = "paused";
    world.release();
    refresh();
  }
  function close() {
    pauseBoard();
    setPanel(null);
    setDialogue(null);
    setFeedback(null);
    setAction(-1);
  }
  function open(p: Panel) {
    world.release();
    if (p === "map") addFlag(state, "map_opened");
    if (p !== "books" && state.board?.status === "running")
      state.board.status = "paused";
    setPanel(p);
    setDialogue(null);
    refresh();
  }
  useEffect(() => {
    let request = 0,
      previous = performance.now(),
      hud = 0,
      footstep = 0,
      autosave = 0,
      priorOrder = "",
      priorNear = "";
    const clock = new FixedStepClock();
    const actorPrevious: Record<
      string,
      { x: number; y: number; left: boolean }
    > = {};
    const update = (now: number) => {
      const elapsed = Math.max(0, (now - previous) / 1000);
      previous = now;
      const ui = current.current,
        blocked =
          !active.current || !!ui.panel || !!ui.dialogue || !!ui.feedback;
      if (!blocked) {
        clock.advance(elapsed, (dt) => world.step(dt));
      } else {
        world.release();
        clock.reset();
      }
      if (
        active.current &&
        ui.panel === "books" &&
        state.board?.status === "running"
      ) {
        tickBooks(state.board, elapsed);
        const sec = Math.ceil(state.board.remaining);
        if (sec !== boardSeconds.current) {
          boardSeconds.current = sec;
          setRevision((n) => n + 1);
          void persistRef.current();
        }
        if ((state.board.status as string) === "timeout") {
          setNotice(
            "Se terminó el tiempo. Puedes reintentar sin perder tu investigación.",
          );
          setRevision((n) => n + 1);
          setPanel(null);
          setAction(7);
          setDialogue({
            lines: scene(16).timeout ?? [],
            index: 0,
            returnToBooks: true,
          });
        }
      }
      const events = world.drain();
      if (events.length) {
        const last = events.find((e) => e.text);
        if (last?.text) setNotice(last.text);
        if (events.some((e) => e.type === "transition")) {
          setRoom(state.room);
          priorOrder = "";
        }
        setRevision((n) => n + 1);
        void persistRef.current();
      }
      footstep += elapsed;
      if (world.moving && footstep > 0.4) {
        footstep = 0;
        soundRef.current("step");
      }
      const actors = world.actors.map((a) => {
        const old = actorPrevious[a.id] ?? {
            x: a.x,
            y: a.y,
            left: state.actorMemory[`${state.room}:${a.id}`]?.left ?? false,
          },
          left = Math.abs(a.x - old.x) > 0.001 ? a.x < old.x : old.left;
        actorPrevious[a.id] = { x: a.x, y: a.y, left };
        return {
          id: a.id,
          x: a.x,
          y: a.y,
          moving:
            !!a.path?.length && Math.hypot(a.x - old.x, a.y - old.y) > 0.001,
          left,
        };
      });
      frame.value = {
        x: state.x,
        y: state.y,
        cx: world.cameraX,
        cy: world.cameraY,
        time: state.worldTime,
        direction: ["down", "up", "left", "right"].indexOf(state.direction),
        moving: world.moving,
        actors,
      };
      hud += elapsed;
      autosave += elapsed;
      {
        // Reorder React children only when an entity actually crosses another's feet.
        const ids = [
            ...world.room.furniture.map((p) => ({ id: p.id, y: p.y })),
            ...world.actors.map((a) => ({ id: a.id, y: a.y })),
            { id: "hero", y: state.y },
          ]
            .sort((a, b) => a.y - b.y)
            .map((a) => a.id),
          key = ids.join("|");
        if (key !== priorOrder) {
          priorOrder = key;
          setOrder(ids);
        }
      }
      if (hud > 0.12) {
        hud = 0;
        const n = world.nearby()?.label ?? "";
        if (n !== priorNear) {
          priorNear = n;
          setNear(n);
        }
      }
      if (autosave > 5 && !blocked) {
        autosave = 0;
        void persistRef.current();
      }
      request = requestAnimationFrame(update);
    };
    request = requestAnimationFrame(update);
    const background = () => {
      active.current = false;
      world.release();
      if (state.board?.status === "running") state.board.status = "paused";
      setPanel("pause");
      void persistRef.current();
    };
    const subscription = AppState.addEventListener("change", (s) => {
      if (s !== "active") background();
      else {
        active.current = true;
        previous = performance.now();
      }
    });
    const visibility = () => {
      if (document.hidden) background();
      else {
        active.current = true;
        previous = performance.now();
      }
    };
    if (Platform.OS === "web")
      document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(request);
      if (victoryTimer.current) clearTimeout(victoryTimer.current);
      subscription.remove();
      if (Platform.OS === "web")
        document.removeEventListener("visibilitychange", visibility);
      world.release();
      if (state.board?.status === "running") state.board.status = "paused";
    };
  }, []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const inputKeys: Record<string, keyof typeof world.input> = {
      w: "up",
      arrowup: "up",
      s: "down",
      arrowdown: "down",
      a: "left",
      arrowleft: "left",
      d: "right",
      arrowright: "right",
    };
    const key = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase(),
        dir = inputKeys[k],
        ui = current.current;
      if (dir) {
        if (e.type === "keyup") world.input[dir] = false;
        else if (!ui.panel && !ui.dialogue && !ui.feedback)
          world.input[dir] = true;
        if (!ui.panel && !ui.dialogue && !ui.feedback) e.preventDefault();
      }
      if (e.type !== "keydown" || e.repeat) return;
      if (k === "e" && !ui.panel && !ui.dialogue && !ui.feedback) {
        e.preventDefault();
        interaction.current();
      }
      if (k === "escape") {
        e.preventDefault();
        world.release();
        if (state.board?.status === "running") state.board.status = "paused";
        setPanel(ui.panel ? null : "pause");
        setDialogue(null);
        setFeedback(null);
        void persistRef.current();
      }
      if (k === "i" && !ui.dialogue && !ui.feedback) open("inventory");
      if (k === "j" && !ui.dialogue && !ui.feedback) open("journal");
      if (k === "m" && !ui.dialogue && !ui.feedback) open("map");
    };
    const blur = () => {
      world.release();
      if (state.board?.status === "running") {
        state.board.status = "paused";
        setPanel("pause");
        void persistRef.current();
      }
    };
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", key);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("keyup", key);
      window.removeEventListener("blur", blur);
    };
  }, []);
  function begin(n: number) {
    soundRef.current("page");
    world.release();
    setPanel(null);
    setOptional(false);
    const cursor = state.dialogues[ch2id(n)] ?? 0;
    if (cursor < scene(n).dialogue.length) {
      setDialogue({ lines: scene(n).dialogue, index: cursor, scene: n });
      setAction(2);
    } else afterIntro(n);
  }
  function finish(n: number) {
    try {
      completeLibraryScene(state, n);
      soundRef.current("success");
      if (n === 16 && state.board) {
        const b = state.board,
          record = state.records[b.difficulty];
        if (!record || b.elapsed < record.seconds)
          state.records[b.difficulty] = { seconds: b.elapsed, swaps: b.swaps };
      }
      refresh();
      setPanel(null);
      const lines = scene(n).closing;
      if (lines.length) {
        setDialogue({ lines, index: 0, scene: n, closing: true });
      } else {
        setNotice("Escena completada: " + scene(n).title);
        if (n === 16) open("complete");
      }
      setAction(n === 16 ? 8 : -1);
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  function afterIntro(n: number) {
    if (n === 1) addFlag(state, "traveler_talk");
    const missing = missingFor(state, n);
    if (missing.length) {
      setFeedback({
        title: "Antes de continuar",
        text: missing.map((f) => flagLabels[f] ?? f).join("\n"),
      });
      refresh();
      setAction(-1);
      return;
    }
    if (n === 16) {
      if (state.board?.status === "won") {
        finish(16);
        return;
      }
      if (!state.board) state.board = newBookAttempt("easy");
      open("books");
      setAction(1);
      return;
    }
    if (questionsFor(n).length) {
      getAttempt(state, n);
      open("questions");
      setAction(1);
    } else finish(n);
  }
  function advance() {
    if (!dialogue) return;
    const next = dialogue.index + 1;
    if (dialogue.scene && !dialogue.closing)
      state.dialogues[ch2id(dialogue.scene)] = next;
    refresh();
    if (dialogue.closing && dialogue.scene === 16 && next === 8) {
      world.restore("balcony", 320, 230);
      setRoom("balcony");
      refresh();
    }
    if (next < dialogue.lines.length) {
      setAction(dialogue.lines[next].speaker === "hero" ? 2 : 7);
      setDialogue({ ...dialogue, index: next });
      return;
    }
    setDialogue(null);
    setAction(-1);
    if (dialogue.returnToBooks) {
      open("books");
      return;
    }
    if (dialogue.closing) {
      if (dialogue.scene === 16) open("complete");
      return;
    }
    if (dialogue.scene) afterIntro(dialogue.scene);
  }
  function interact() {
    world.release();
    const object = world.nearby();
    if (!object) {
      const npc = world.actors.find(
        (a) => Math.hypot(a.x - state.x, a.y - state.y) < 52,
      );
      if (npc) {
        setDialogue({
          lines: [
            {
              speaker:
                npc.role === "citizen" ? `citizen_${npc.column}` : npc.role,
              text:
                npc.activity === "read"
                  ? "Estoy buscando una referencia para comprender mejor lo que leí. Es un buen lugar para aprender con calma."
                  : npc.activity === "talk"
                    ? "Qué gusto compartir este espacio. Cada persona trae una pregunta y algo que aprender."
                    : "Voy a devolver este libro. Si necesitas pasar, te dejo espacio.",
            },
          ],
          index: 0,
        });
      }
      return;
    }
    if (object.type === "door") {
      try {
        world.enter(object.id);
        setRoom(state.room);
        refresh();
      } catch (e) {
        setNotice((e as Error).message);
      }
      return;
    }
    const n = activeScene(state);
    if (object.scene) {
      const target =
          n === 14 && state.flags.includes("upper_stairs")
            ? { room: "landing" as const, id: "upper_door" }
            : sceneTargets[n],
        same =
          (target?.room === state.room && target?.id === object.id) ||
          (n === 14 && object.id === "upper_door");
      if (same && !hasScene(state, 16)) {
        begin(n);
        return;
      }
      if (object.id === "researcher" && hasScene(state, 12)) {
        setOptional(true);
        if (state.attempts.debate_extra?.finished)
          state.attempts.debate_extra = createAttempt(
            questionsFor(12, true),
            Date.now() >>> 0,
            true,
          );
        getAttempt(state, 12, true);
        open("questions");
        return;
      }
      if (hasScene(state, object.scene)) {
        setDialogue({
          lines: [
            {
              speaker: object.role ?? "narrator",
              text:
                object.role === "traveler"
                  ? "Me alegra verte avanzar. Sigue haciendo preguntas; siempre hay algo nuevo por descubrir."
                  : object.role === "assistant"
                    ? "Gracias por ayudar con la biblioteca. Los pasillos y las puertas siguen abiertos para que explores."
                    : "Qué gusto volver a verte. Aquí puedes estudiar con calma y compartir lo que vas aprendiendo.",
            },
          ],
          index: 0,
        });
        return;
      }
      setNotice(
        "Esta conversación continuará cuando completes el objetivo actual. Consulta el cuaderno.",
      );
      return;
    }
    try {
      if (object.kind === "rest") {
        state.health = 3;
        setNotice("Descansaste. Tus tres corazones están completos.");
        refresh();
        return;
      }
      if (
        state.room === "dark" &&
        object.id.startsWith("floor_mark") &&
        !state.flags.includes("lantern_equipped")
      )
        throw Error("Equipa la linterna de Fe para poder examinar las marcas.");
      world.activate(object.id);
      soundRef.current(object.kind === "mechanism" ? "mechanism" : "page");
      const doc = documents[object.id as keyof typeof documents];
      if (doc) {
        setFeedback(doc);
        setAction(
          object.kind === "book" || object.kind === "reference" ? 1 : 2,
        );
      } else
        setNotice(
          object.id === "lights_on"
            ? "Las lámparas iluminan el pasillo. Vuelve con el auxiliar."
            : "Acción completada. Consulta tu siguiente objetivo.",
        );
      refresh();
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  interaction.current = interact;
  const n = activeScene(state),
    target =
      n === 14 && state.flags.includes("upper_stairs")
        ? { room: "landing" as const, id: "upper_door" }
        : sceneTargets[n],
    attempt =
      panel === "questions"
        ? getAttempt(state, optional ? 12 : n, optional)
        : null;
  async function download() {
    try {
      await downloadSave(
        withLibrary({ ...base.current, settings }, world.snapshot()),
      );
      setNotice("Copia de la campaña descargada.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  const direction = (dir: keyof typeof world.input, label: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        "Caminar " +
        { up: "arriba", down: "abajo", left: "izquierda", right: "derecha" }[
          dir
        ]
      }
      onPressIn={() => {
        world.input[dir] = true;
      }}
      onPressOut={() => {
        world.input[dir] = false;
      }}
      style={{
        width: compact ? 44 : 48,
        height: compact ? 44 : 48,
        backgroundColor: "#34485bd9",
        borderColor: "#c8b68b",
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff4d9", fontSize: 23 }}>{label}</Text>
    </Pressable>
  );
  return (
    <View
      style={{ width, height, backgroundColor: "#362c39", overflow: "hidden" }}
    >
      <LibraryScene
        width={width}
        height={height}
        room={room}
        frame={frame}
        order={order}
        flags={[...state.flags]}
        completed={state.completed.length}
        reducedMotion={settings.reducedMotion}
        action={action}
      />
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          right: 12,
          flexDirection: "row",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            backgroundColor: "#293d4be8",
            padding: compact ? 8 : 12,
            borderRadius: 10,
            maxWidth: "52%",
            borderWidth: 1,
            borderColor: "#bda87d",
          }}
        >
          <Text
            style={{
              color: "#ecd9a7",
              fontSize: compact ? 10 : 12,
              letterSpacing: 1,
            }}
          >
            CAPÍTULO II ·{" "}
            {state.health === 3
              ? "♥ ♥ ♥"
              : state.health === 2
                ? "♥ ♥ ♡"
                : "♥ ♡ ♡"}
          </Text>
          <Text
            style={{
              color: "#fff5e1",
              fontSize: compact ? 12 : 16,
              fontWeight: "600",
            }}
          >
            {world.room.name}
          </Text>
          <Text
            numberOfLines={2}
            style={{ color: "#e2d5ec", fontSize: compact ? 10 : 12 }}
          >
            {state.completed.length === 16
              ? "Biblioteca completada"
              : `${n}/16 · ${scene(n).title.toLocaleLowerCase("es")}`}
          </Text>
        </View>
        <View style={[s.row, { alignItems: "flex-start" }]}>
          <Button
            label={compact ? "Mapa" : "Mapa · M"}
            onPress={() => open("map")}
          />
          {!compact && (
            <Button label="Cuaderno · J" onPress={() => open("journal")} />
          )}
          <Button
            label={compact ? "Ⅱ" : "Pausa"}
            onPress={() => open("pause")}
          />
        </View>
      </View>
      {!panel && !dialogue && !feedback && (
        <>
          <View
            style={{
              position: "absolute",
              left: 16,
              bottom: 14,
              gap: 3,
              alignItems: "center",
            }}
          >
            {direction("up", "↑")}
            <View style={s.row}>
              {direction("left", "←")}
              {direction("down", "↓")}
              {direction("right", "→")}
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              right: 16,
              bottom: 18,
              maxWidth: "48%",
            }}
          >
            <Button primary label={near || "Saludar · E"} onPress={interact} />
          </View>
          {notice !== "" && (
            <Pressable
              onPress={() => setNotice("")}
              style={{
                position: "absolute",
                bottom: compact ? 110 : 125,
                left: "24%",
                right: "24%",
                padding: 9,
                borderRadius: 8,
                backgroundColor: "#293d4beb",
              }}
            >
              <Text
                numberOfLines={3}
                style={{ color: "#ffeed3", fontSize: compact ? 11 : 13 }}
              >
                {notice} ×
              </Text>
            </Pressable>
          )}
        </>
      )}
      {dialogue && (
        <View style={s.overlay}>
          <View style={s.paper}>
            <View style={[s.row, { marginBottom: 14 }]}>
              <Portrait role={dialogue.lines[dialogue.index].speaker} />
              <View style={{ flex: 1 }}>
                <Text style={s.muted}>LA BIBLIOTECA DEL APRENDIZAJE</Text>
                <Text style={s.title}>
                  {names[dialogue.lines[dialogue.index].speaker] ??
                    "Una voz en la biblioteca"}
                </Text>
              </View>
            </View>
            <Text style={[s.body, { marginBottom: 20 }]}>
              {dialogue.lines[dialogue.index].text}
            </Text>
            <Button
              primary
              label={
                dialogue.index + 1 < dialogue.lines.length
                  ? "Continuar →"
                  : "Seguir mi camino →"
              }
              onPress={advance}
            />
          </View>
        </View>
      )}
      {feedback && (
        <Modal
          title={feedback.title}
          onClose={() => {
            setFeedback(null);
            setAction(-1);
          }}
        >
          <Text style={s.body}>{feedback.text}</Text>
          <Button
            primary
            label="Seguir explorando"
            onPress={() => {
              setFeedback(null);
              setAction(-1);
            }}
          />
        </Modal>
      )}
      {panel && (
        <Modal
          title={
            panel === "map"
              ? "Plano de la biblioteca"
              : panel === "journal"
                ? "Cuaderno de investigación"
                : panel === "inventory"
                  ? "Mis herramientas"
                  : panel === "questions"
                    ? "Investiga y comprende"
                    : panel === "books"
                      ? "El desafío de los 66 libros"
                      : panel === "settings"
                        ? "Ajustes"
                        : panel === "complete"
                          ? "¡Has obtenido Conocimiento!"
                          : "Un descanso entre libros"
          }
          onClose={close}
        >
          {panel === "pause" && (
            <>
              <Text style={s.body}>
                Tu investigación se conserva. Las respuestas incorrectas no
                quitan corazones.
              </Text>
              <Button primary label="Continuar" onPress={close} />
              <View style={s.row}>
                <Button label="Cuaderno" onPress={() => open("journal")} />
                <Button
                  label="Herramientas"
                  onPress={() => open("inventory")}
                />
                <Button label="Ajustes" onPress={() => open("settings")} />
              </View>
              {Platform.OS === "web" && (
                <Button
                  label="Descargar partida"
                  onPress={() => void download()}
                />
              )}
              <Button
                label="Guardar y volver al menú"
                onPress={async () => {
                  pauseBoard();
                  await persist();
                  onExit();
                }}
              />
            </>
          )}
          {panel === "map" && (
            <>
              <Text style={s.body}>
                {world.room.name} · Piso {state.floor + 1}
              </Text>
              <Text style={s.muted}>
                Solo se muestran los espacios que has descubierto. Las puertas
                indican sus requisitos.
              </Text>
              <View style={s.row}>
                {state.discovered.map((id) => (
                  <View
                    key={id}
                    style={[
                      s.button,
                      { minWidth: 140, maxWidth: 260 },
                      id === state.room && s.selected,
                    ]}
                  >
                    <Text style={s.buttonText}>{rooms[id].name}</Text>
                    <Text style={s.muted}>Piso {rooms[id].floor + 1}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.title}>Salidas de esta sala</Text>
              {world.room.doors.map((d) => (
                <Text key={d.id} style={s.body}>
                  {(!d.required || hasScene(state, d.required)) &&
                  (!d.flag || state.flags.includes(d.flag))
                    ? "◇"
                    : "🔒"}{" "}
                  {rooms[d.to].name}
                  {d.required && !hasScene(state, d.required)
                    ? ` · Completa la escena ${d.required}`
                    : ""}
                  {d.flag && !state.flags.includes(d.flag)
                    ? " · Mecanismo pendiente"
                    : ""}
                </Text>
              ))}
              <Button label="Ver mi objetivo" onPress={() => open("journal")} />
            </>
          )}
          {panel === "journal" && (
            <>
              <Text style={s.title}>
                {state.completed.length === 16
                  ? "Has completado este capítulo"
                  : scene(n).title}
              </Text>
              {state.completed.length < 16 && (
                <>
                  <Text style={s.body}>
                    Busca a tu interlocutor en: {rooms[target.room].name}.
                  </Text>
                  {missingFor(state, n).map((f) => (
                    <Text key={f} style={s.body}>
                      ◇ {flagLabels[f] ?? f}
                    </Text>
                  ))}
                </>
              )}
              <Text style={s.muted}>
                {state.completed.length}/16 escenas completadas · Checkpoint:{" "}
                {rooms[state.checkpoint].name}
              </Text>
              {state.reflections.map((r, i) => (
                <Text key={i} style={s.body}>
                  ✓ {r}
                </Text>
              ))}
              <Text style={s.title}>Referencias consultadas</Text>
              {Object.entries(documents)
                .filter(
                  ([id]) => id.startsWith("ref_") && state.flags.includes(id),
                )
                .map(([id, doc]) => (
                  <View key={id}>
                    <Text style={s.buttonText}>{doc.title}</Text>
                    <Text style={s.body}>{doc.text}</Text>
                  </View>
                ))}
              <Text style={s.muted}>
                Reflexiones originales adaptadas; no son citas textuales.
                Consulta las referencias en su contexto.
              </Text>
            </>
          )}
          {panel === "inventory" && (
            <>
              <Text style={s.title}>Fe · Linterna</Text>
              <Text style={s.body}>
                La herramienta que obtuviste en el bosque permite descubrir las
                marcas de los senderos oscuros.
              </Text>
              <Button
                primary
                label={
                  state.flags.includes("lantern_equipped")
                    ? "Linterna equipada"
                    : "Equipar linterna"
                }
                onPress={() => {
                  addFlag(state, "lantern_equipped");
                  refresh();
                }}
              />
              {hasScene(state, 16) && (
                <>
                  <Text style={s.title}>Conocimiento · Cuaderno</Text>
                  <Text style={s.body}>
                    Conserva lo aprendido y te ayudará a investigar los caminos
                    que vendrán.
                  </Text>
                </>
              )}
            </>
          )}
          {panel === "settings" && (
            <>
              <Text style={s.body}>Reducir movimiento ambiental</Text>
              <Switch
                value={settings.reducedMotion}
                onValueChange={(reducedMotion) =>
                  setSettings((v) => ({ ...v, reducedMotion }))
                }
              />
              <Text style={s.body}>
                Música: {Math.round(settings.music * 100)}%
              </Text>
              <View style={s.row}>
                {[0, 0.25, 0.5, 0.75, 1].map((music) => (
                  <Button
                    key={music}
                    label={`${music * 100}%`}
                    selected={settings.music === music}
                    onPress={() => setSettings((v) => ({ ...v, music }))}
                  />
                ))}
              </View>
              <Text style={s.body}>
                Efectos: {Math.round(settings.effects * 100)}%
              </Text>
              <View style={s.row}>
                {[0, 0.5, 1].map((effects) => (
                  <Button
                    key={effects}
                    label={`${effects * 100}%`}
                    selected={settings.effects === effects}
                    onPress={() => setSettings((v) => ({ ...v, effects }))}
                  />
                ))}
              </View>
              <Button
                primary
                label="Guardar ajustes"
                onPress={() => {
                  refresh();
                  open("pause");
                }}
              />
            </>
          )}
          {panel === "questions" && attempt && (
            <Questions
              key={`${n}_${optional}`}
              attempt={attempt}
              questions={questionsFor(optional ? 12 : n, optional)}
              onChange={refresh}
              onFinish={() => {
                if (optional) {
                  state.optionalDebates++;
                  setNotice(
                    "Terminaste el debate adicional. Puedes seguir investigando.",
                  );
                  close();
                  refresh();
                } else {
                  if (n === 13) {
                    const a = getAttempt(state, n),
                      q = questionsFor(n)[0],
                      id = a.accepted[q.id]?.[0],
                      text = q.options.find((o) => o.id === id)?.text;
                    if (text && !state.reflections.includes(text))
                      state.reflections.push(text);
                  }
                  finish(n);
                }
              }}
            />
          )}
          {panel === "books" && (
            <BookBoard
              board={state.board}
              onMode={(d) => {
                state.board = newBookAttempt(d);
                refresh();
              }}
              onStart={() => {
                if (
                  state.board &&
                  ["ready", "paused"].includes(state.board.status)
                ) {
                  state.board.status = "running";
                  refresh();
                }
              }}
              onPause={pauseBoard}
              onSwap={(a, b) => {
                if (state.board && swapBooks(state.board, a, b)) {
                  soundRef.current("card");
                  refresh();
                  if (state.board.status === "won") {
                    setAction(8);
                    victoryTimer.current = setTimeout(() => finish(16), 1100);
                  }
                }
              }}
            />
          )}
          {panel === "complete" && (
            <>
              <Portrait role="happy" size={100} />
              <Text style={s.body}>
                La Fe te ayudó a dar el primer paso. El Conocimiento te ayuda a
                comprender por dónde caminas. Tu nueva herramienta está guardada
                y el capítulo 3 queda desbloqueado.
              </Text>
              {Object.entries(state.records).map(([d, r]) => (
                <Text key={d} style={s.muted}>
                  {d === "easy"
                    ? "Exploración"
                    : d === "medium"
                      ? "Estudio"
                      : "Desafío"}
                  : {Math.floor(r!.seconds)} segundos · {r!.swaps} intercambios
                </Text>
              ))}
              <Button primary label="Explorar la biblioteca" onPress={close} />
              {Platform.OS === "web" && (
                <Button
                  label="Descargar mi partida"
                  onPress={() => void download()}
                />
              )}
              <Button
                label="Volver al menú"
                onPress={async () => {
                  await persist();
                  onExit();
                }}
              />
            </>
          )}
        </Modal>
      )}
    </View>
  );
}
