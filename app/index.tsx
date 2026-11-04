import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  Switch,
  AppState,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Scene from "../components/SceneLoader";
import { useGameAudio } from "../game/audio/useGameAudio";
import { World } from "../game/engine/world";
import { chapters } from "../game/levels/forest";
import { collect, objective } from "../game/missions/progress";
import content from "../game/dialogues/content.json";
import { faith } from "../game/inventory/tools";
import { newSave, defaultSettings, type Save } from "../game/save/schema";
import { loadSave, storeSave } from "../game/save/storage";
import { downloadSave, importSave } from "../game/save/transfer";
type Screen = "menu" | "chapters" | "play";
type Panel =
  | "settings"
  | "credits"
  | "pause"
  | "inventory"
  | "traveler"
  | "riddle"
  | "complete"
  | null;
function Button({
  label,
  onPress,
  disabled = false,
  gold = false,
  small = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  gold?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.button,
        gold && styles.gold,
        small && styles.small,
        disabled && { opacity: 0.45 },
        (pressed || hovered) &&
          !disabled && {
            backgroundColor: "#f9d791",
            transform: [{ translateY: 1 }],
          },
      ]}
    >
      <Text style={[styles.buttonText, small && { fontSize: 13 }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export default function Game() {
  const insets = useSafeAreaInsets(),
    size = useWindowDimensions(),
    width = Math.min(
      size.width - insets.left - insets.right,
      ((size.height - insets.top - insets.bottom) * 16) / 9,
    ),
    height = (width * 9) / 16;
  const [screen, setScreen] = useState<Screen>("menu"),
    [panel, setPanel] = useState<Panel>(null),
    [ready, setReady] = useState(false),
    [save, setSave] = useState<Save | null>(null),
    [settings, setSettings] = useState({ ...defaultSettings });
  const world = useRef(new World()).current;

  const [progress, setProgress] = useState({ ...world.progress }),
    [message, setMessage] = useState(""),
    [dialogue, setDialogue] = useState<{
      lines: string[];
      index: number;
      done?: () => void;
    } | null>(null),
    [words, setWords] = useState<number[]>([]),
    [near, setNear] = useState("");
  const sound = useGameAudio(
    settings,
    screen === "play" && !panel && !dialogue,
  );
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const lastStep = useRef(0);
  const x = useSharedValue(65),
    y = useSharedValue(226),
    camera = useSharedValue(0),
    time = useSharedValue(0),
    motion = useSharedValue(0),
    action = useSharedValue(0);
  const completionStart = useRef(0);
  const live = useRef({ screen, panel, dialogue, settings });
  live.current = { screen, panel, dialogue, settings };
  const saveRef = useRef<Save | null>(null);
  useEffect(() => {
    loadSave().then((s) => {
      setSave(s);
      saveRef.current = s;
      if (s) setSettings(s.settings);
      setReady(true);
    });
  }, []);
  async function persist() {
    const old = saveRef.current;
    const s: Save = {
      ...newSave(),
      checkpoint: Math.round(world.x),
      missions: JSON.parse(JSON.stringify(world.progress)),
      tools: world.progress.complete ? ["fe"] : [],
      unlockedChapters: world.progress.complete ? [1, 2] : [1],
      settings: { ...live.current.settings },
    };
    if (old?.missions.complete) {
      s.tools = ["fe"];
      s.unlockedChapters = [1, 2];
      s.missions.complete = true;
      s.missions.riddle = true;
      s.missions.traveler = true;
      s.missions.guide = true;
      s.missions.lights = ["light1", "light2", "light3"];
      s.missions.lamps = ["lamp1", "lamp2"];
    }
    try {
      await storeSave(s);
      saveRef.current = s;
      setSave(s);
    } catch {
      setMessage("No se pudo guardar. Descarga la partida antes de salir.");
    }
    return s;
  }
  function refresh() {
    soundRef.current("discovery");
    setProgress(JSON.parse(JSON.stringify(world.progress)));
    void persist();
  }
  function say(lines: string[], done?: () => void) {
    soundRef.current("interaction");
    world.release();
    setDialogue({ lines, index: 0, done });
  }
  function resume(s: Save) {
    world.progress = JSON.parse(JSON.stringify(s.missions));
    world.restore(s.checkpoint);
    setProgress({ ...world.progress });
    setScreen("play");
    setPanel(null);
    setDialogue(null);
    setMessage("A/D o ← → · Espacio para saltar · E para interactuar");
  }
  function start() {
    if (save) {
      say(
        [
          "Ya tienes una aventura guardada. Puedes repetir el bosque desde el diario sin perder tus herramientas.",
        ],
        () => setScreen("chapters"),
      );
      return;
    }
    const s = newSave();
    saveRef.current = s;
    resume(s);
    void persist();
  }
  function interact() {
    if (live.current.panel) return;
    const d = live.current.dialogue;
    if (d) {
      if (d.index < d.lines.length - 1)
        setDialogue({ ...d, index: d.index + 1 });
      else {
        setDialogue(null);
        d.done?.();
      }
      return;
    }
    const o = world.nearby();
    if (!o) return;
    const p = world.progress;
    if (o.kind === "guide") {
      say(content.guide, () => {
        p.guide = true;
        refresh();
      });
      return;
    }
    if (!p.guide) {
      setMessage("Primero habla con la guía del bosque.");
      return;
    }
    if (o.kind === "light") {
      if (!p.lights.includes(o.id)) {
        collect(p, o.id);
        refresh();
        say([content.reflections[Number(o.id.slice(-1)) - 1]]);
      }
      return;
    }
    if (o.kind === "lamp") {
      if (p.lights.length < 3) {
        say([
          "Encuentra las tres luces de esperanza antes de encender los faroles.",
        ]);
        return;
      }
      if (!p.lamps.includes(o.id)) {
        collect(p, o.id);
        refresh();
        say([
          p.lamps.length === 2
            ? "¡Excelente! Incluso una pequeña luz puede ayudarte a encontrar el camino."
            : "El primer farol ilumina el sendero. Busca el segundo.",
        ]);
      }
      return;
    }
    if (o.kind === "traveler") {
      if (p.lamps.length < 2) return;
      if (p.traveler) {
        say([
          "Gracias por escucharme. Ya no siento que deba recorrer este camino a solas.",
        ]);
        return;
      }
      world.release();
      setPanel("traveler");
      return;
    }
    if (o.kind === "riddle") {
      if (!p.traveler) {
        say(["Hay alguien en el claro que necesita que lo escuches."]);
        return;
      }
      if (p.riddle) {
        say(["El sendero está abierto. El santuario te espera."]);
        return;
      }
      world.release();
      setWords([]);
      setPanel("riddle");
      return;
    }
    if (o.kind === "chest" && p.riddle) {
      p.complete = true;
      refresh();
      world.release();
      completionStart.current = Date.now();
      setPanel("complete");
    }
  }
  const interactRef = useRef(interact);
  interactRef.current = interact;
  useEffect(() => {
    let raf = 0,
      last = 0,
      acc = 0,
      lastNear = "";
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      const l = live.current;
      if (l.screen === "play" && !l.panel && !l.dialogue) {
        acc += dt;
        while (acc >= 1 / 120) {
          world.step(1 / 120);
          acc -= 1 / 120;
        }
        x.value = world.x;
        y.value = world.y;
        camera.value = world.camera;
        motion.value = !world.grounded ? 2 : world.moving ? world.facing : 0;
        if (world.moving && world.grounded && now - lastStep.current > 340) {
          lastStep.current = now;
          soundRef.current("step");
        }
        const n = world.nearby()?.id ?? "";
        if (n !== lastNear) {
          lastNear = n;
          setNear(n);
        }
      } else {
        world.release();
        acc = 0;
      }
      action.value =
        l.panel === "complete"
          ? Date.now() - completionStart.current < 900
            ? 4
            : Date.now() - completionStart.current < 1800
              ? 5
              : 6
          : l.dialogue
            ? 3
            : 0;
      if (!l.settings.reducedMotion) time.value += dt;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", " ", "e", "escape", "i"].includes(k))
        e.preventDefault();
      if (k === "escape" && live.current.screen === "play") {
        world.release();
        setPanel((v) => (v === null ? "pause" : null));
        return;
      }
      if (k === "i" && live.current.screen === "play") {
        world.release();
        setPanel((v) => (v === "inventory" ? null : "inventory"));
        return;
      }
      if (live.current.screen !== "play") return;
      if (k === "e" && !e.repeat) {
        interactRef.current();
        return;
      }
      if (live.current.panel || live.current.dialogue) return;
      if (k === "a" || k === "arrowleft") world.input.left = true;
      if (k === "d" || k === "arrowright") world.input.right = true;
      if (k === " " && !e.repeat) world.input.jump = true;
    };
    const up = (e: KeyboardEvent) => {
      if (["a", "ArrowLeft"].includes(e.key)) world.input.left = false;
      if (["d", "ArrowRight"].includes(e.key)) world.input.right = false;
    };
    const blur = () => {
      world.release();
      if (live.current.screen === "play") setPanel("pause");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
  useEffect(() => {
    const s = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        world.release();
        if (live.current.screen === "play") {
          setPanel("pause");
          void persist();
        }
      }
    });
    return () => s.remove();
  }, []);
  async function importGame() {
    try {
      const s = await importSave();
      if (s) {
        await storeSave(s);
        saveRef.current = s;
        setSave(s);
        setSettings(s.settings);
        resume(s);
        setMessage("Partida cargada correctamente.");
      }
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "No se pudo cargar la partida.",
      );
    }
  }
  async function exportGame() {
    try {
      await downloadSave(
        screen === "play" ? await persist() : saveRef.current!,
      );
      setMessage("Partida descargada.");
    } catch {
      setMessage("No se pudo descargar la partida.");
    }
  }
  const controlsBlocked = !!panel || !!dialogue;
  const touch = (label: string, key: "left" | "right" | "jump") => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={controlsBlocked}
      onPressIn={() => {
        world.input[key] = true;
      }}
      onPressOut={() => {
        if (key !== "jump") world.input[key] = false;
      }}
      style={styles.touch}
    >
      <Text style={styles.touchText}>{label}</Text>
    </Pressable>
  );
  return (
    <SafeAreaView style={styles.root}>
      <View
        style={{
          width,
          height,
          overflow: "hidden",
          backgroundColor: "#284e54",
        }}
      >
        <Scene
          width={width}
          height={height}
          menu={screen !== "play"}
          x={x}
          y={y}
          camera={camera}
          time={time}
          motion={motion}
          action={action}
          progress={progress}
          reducedMotion={settings.reducedMotion}
        />
        {screen === "menu" && (
          <View style={styles.menu}>
            <Text style={styles.book}>❧ ▤ ❧</Text>
            <Text
              style={[styles.title, { fontSize: Math.max(19, width * 0.026) }]}
            >
              El camino de una
            </Text>
            <View style={styles.ribbon}>
              <Text
                style={[
                  styles.precursora,
                  { fontSize: Math.max(27, width * 0.046) },
                ]}
              >
                Precursora
              </Text>
            </View>
            <Text
              style={[
                styles.subtitle,
                { fontSize: Math.max(10, width * 0.013) },
              ]}
            >
              Una aventura de fe, aprendizaje y perseverancia
            </Text>
            <View style={{ width: "80%", gap: height < 430 ? 4 : 9 }}>
              <Button
                label="▶  Comenzar aventura"
                gold
                onPress={start}
                disabled={!ready}
              />
              <Button
                label="▤  Continuar"
                onPress={() => save && resume(save)}
                disabled={!ready || !save}
              />
              {Platform.OS === "web" && (
                <Button
                  label="↥  Cargar partida"
                  onPress={() => void importGame()}
                  disabled={!ready}
                />
              )}
              <View style={styles.row}>
                <Button
                  label="⚙  Ajustes"
                  small
                  onPress={() => setPanel("settings")}
                />
                <Button
                  label="ⓘ  Créditos"
                  small
                  onPress={() => setPanel("credits")}
                />
              </View>
            </View>
            <Text style={styles.prototype}>
              PROTOTIPO · ARTE DE ESCENARIO PROVISIONAL
            </Text>
          </View>
        )}
        {screen === "chapters" && (
          <View style={styles.shade}>
            <View style={[styles.paper, { width: "76%", maxHeight: "92%" }]}>
              <Text style={styles.heading}>Tu diario de viaje</Text>
              <Text style={styles.body}>Cada paso tiene su tiempo.</Text>
              <ScrollView>
                {chapters.map((c, i) => (
                  <View key={c} style={styles.chapter}>
                    <Text style={styles.body}>
                      {i + 1}. {c}
                    </Text>
                    {i === 0 ? (
                      <Button
                        small
                        label={
                          save?.missions.complete
                            ? "Repetir bosque"
                            : "Explorar"
                        }
                        onPress={() => {
                          const s = save ?? newSave();
                          if (s.missions.complete) {
                            world.progress = newSave().missions;
                            world.x = 65;
                            world.y = 226;
                            world.camera = 0;
                            world.release();
                            setProgress({ ...world.progress });
                            setScreen("play");
                          } else resume(s);
                        }}
                      />
                    ) : (
                      <Text style={styles.muted}>
                        {i === 1 && save?.missions.complete
                          ? "Desbloqueado · Próximamente"
                          : "🔒 Un nuevo sendero espera"}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
              <Button
                label="Volver al inicio"
                small
                onPress={() => setScreen("menu")}
              />
            </View>
          </View>
        )}
        {screen === "play" && (
          <>
            <View style={styles.hud}>
              <View style={styles.objective}>
                <Text style={styles.overline}>
                  CAPÍTULO I · EL BOSQUE DE LAS DUDAS
                </Text>
                <Text style={styles.objectiveText}>{objective(progress)}</Text>
              </View>
              <View style={styles.row}>
                <Button
                  small
                  label="▤ Diario"
                  onPress={() => {
                    world.release();
                    setScreen("chapters");
                    void persist();
                  }}
                />
                <Button small label="◇" onPress={() => setPanel("inventory")} />
                <Button small label="Ⅱ" onPress={() => setPanel("pause")} />
              </View>
            </View>
            {near && !controlsBlocked && (
              <View style={styles.prompt}>
                <Text style={styles.objectiveText}>E · Interactuar</Text>
              </View>
            )}
            <View style={styles.controls}>
              <View style={styles.row}>
                {touch("◀", "left")}
                {touch("▶", "right")}
              </View>
              <View style={styles.row}>
                {touch("↑", "jump")}
                <Pressable
                  accessibilityRole="button"
                  disabled={!!panel}
                  onPress={interact}
                  style={styles.touch}
                >
                  <Text style={styles.touchText}>E</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
        {!!message && !panel && !dialogue && (
          <Pressable onPress={() => setMessage("")} style={styles.toast}>
            <Text style={styles.toastText}>{message} ×</Text>
          </Pressable>
        )}
        {dialogue && (
          <View style={styles.shade}>
            <View style={[styles.paper, { width: "70%" }]}>
              <Text style={styles.overline}>EL BOSQUE DE LAS DUDAS</Text>
              <Text style={styles.dialogue}>
                {dialogue.lines[dialogue.index]}
              </Text>
              <Button
                label={
                  dialogue.index === dialogue.lines.length - 1
                    ? "Seguir mi camino →"
                    : "Continuar →"
                }
                gold
                onPress={interact}
              />
            </View>
          </View>
        )}
        {panel && (
          <View style={styles.shade}>
            <View style={[styles.paper, { maxHeight: "92%" }]}>
              <ScrollView contentContainerStyle={{ gap: 12 }}>
                {panel === "settings" && (
                  <>
                    <Text style={styles.heading}>Ajustes</Text>
                    <Text style={styles.body}>Efectos visuales reducidos</Text>
                    <Switch
                      accessibilityLabel="Reducir efectos visuales"
                      value={settings.reducedMotion}
                      onValueChange={(v) =>
                        setSettings((s) => ({ ...s, reducedMotion: v }))
                      }
                    />
                    {(["music", "effects"] as const).map((k) => (
                      <View key={k}>
                        <Text style={styles.body}>
                          {k === "music" ? "Música" : "Efectos"} ·{" "}
                          {Math.round(settings[k] * 100)}%
                        </Text>
                        <View style={styles.row}>
                          <Button
                            small
                            label="−"
                            onPress={() =>
                              setSettings((s) => ({
                                ...s,
                                [k]: Math.max(0, s[k] - 0.1),
                              }))
                            }
                          />
                          <Button
                            small
                            label="+"
                            onPress={() =>
                              setSettings((s) => ({
                                ...s,
                                [k]: Math.min(1, s[k] + 0.1),
                              }))
                            }
                          />
                        </View>
                      </View>
                    ))}
                    <Text style={styles.muted}>
                      Audio original sintetizado para este prototipo. Los
                      ajustes se conservan en la partida.
                    </Text>
                  </>
                )}
                {panel === "credits" && (
                  <>
                    <Text style={styles.heading}>
                      Hecho para un camino especial
                    </Text>
                    <Text style={styles.body}>
                      El camino de una Precursora{"\n\n"}Una aventura de fe,
                      aprendizaje y perseverancia.{"\n\n"}Personaje: paquete
                      visual proporcionado por Marcor360. Escenarios y
                      personajes secundarios: gráficos temporales para este
                      prototipo. Motor: Expo, React Native y Skia.{"\n\n"}Sin
                      anuncios, compras ni cuentas.
                    </Text>
                  </>
                )}
                {panel === "pause" && (
                  <>
                    <Text style={styles.heading}>Un respiro en el camino</Text>
                    <Button
                      label="Continuar aventura"
                      gold
                      onPress={() => setPanel(null)}
                    />
                    <Button
                      label="Ajustes"
                      onPress={() => setPanel("settings")}
                    />
                    {Platform.OS === "web" && (
                      <Button
                        label="Descargar partida"
                        onPress={() => void exportGame()}
                      />
                    )}
                    <Button
                      label="Guardar y volver al inicio"
                      onPress={async () => {
                        await persist();
                        setPanel(null);
                        setDialogue(null);
                        setScreen("menu");
                        setMessage(
                          "Partida guardada. En web puedes descargar una copia desde el menú.",
                        );
                      }}
                    />
                  </>
                )}
                {panel === "inventory" && (
                  <>
                    <Text style={styles.heading}>Tus herramientas</Text>
                    <Text style={styles.body}>
                      {save?.tools.includes("fe") || progress.complete
                        ? `${faith.icon} ${faith.name}\n\n${faith.description}\n\n${faith.ability}`
                        : "Cada experiencia te ayudará a descubrir una nueva herramienta. Sigue explorando."}
                    </Text>
                  </>
                )}
                {panel === "traveler" && (
                  <>
                    <Text style={styles.heading}>El claro del viajero</Text>
                    <Text style={styles.body}>
                      «He intentado avanzar, pero tengo miedo de equivocarme.
                      Siento que no puedo seguir».
                    </Text>
                    <Button
                      label="No deberías sentirte así."
                      onPress={() => {
                        setPanel(null);
                        say([
                          "A veces, antes de dar consejos, necesitamos escuchar y reconocer cómo se siente la otra persona. Intenta hablar con el viajero de nuevo.",
                        ]);
                      }}
                    />
                    <Button
                      label="Entiendo que tengas miedo. Podemos dar un paso juntos."
                      gold
                      onPress={() => {
                        world.progress.traveler = true;
                        refresh();
                        setPanel(null);
                        say([
                          "Gracias por escucharme. Saber que no estoy solo me da fuerzas para seguir.",
                        ]);
                      }}
                    />
                    <Button
                      label="Seguro que no es tan difícil."
                      onPress={() => {
                        setPanel(null);
                        say([
                          "Lo que para una persona parece sencillo puede ser difícil para otra. Escúchalo con empatía y vuelve a intentarlo.",
                        ]);
                      }}
                    />
                  </>
                )}
                {panel === "riddle" && (
                  <>
                    <Text style={styles.heading}>
                      El desafío de la confianza
                    </Text>
                    <Text style={styles.body}>
                      Ordena las palabras para reconstruir esta idea sobre la
                      confianza.
                    </Text>
                    <Text style={styles.muted}>
                      {content.riddle.reference} · {content.riddle.notice}
                    </Text>
                    <Text style={styles.dialogue}>
                      {words.map((i) => content.riddle.words[i]).join(" ") ||
                        "…"}
                    </Text>
                    <View style={[styles.row, { flexWrap: "wrap" }]}>
                      {[3, 0, 5, 2, 6, 1, 4].map((i) => (
                        <Button
                          key={i}
                          small
                          label={content.riddle.words[i]}
                          disabled={words.includes(i)}
                          onPress={() => setWords((w) => [...w, i])}
                        />
                      ))}
                    </View>
                    <View style={styles.row}>
                      <Button
                        small
                        label="Reintentar"
                        onPress={() => setWords([])}
                      />
                      <Button
                        small
                        gold
                        label="Comprobar"
                        onPress={() => {
                          if (words.join(",") === "0,1,2,3,4,5,6") {
                            world.progress.riddle = true;
                            refresh();
                            setPanel(null);
                            say([
                              "La niebla se disipa. Puedes seguir adelante con confianza.",
                            ]);
                          } else {
                            setWords([]);
                            setMessage(
                              "Comienza por «Confía en Jehová» y vuelve a intentarlo.",
                            );
                          }
                        }}
                      />
                    </View>
                    {message && <Text style={styles.body}>{message}</Text>}
                  </>
                )}
                {panel === "complete" && (
                  <>
                    <Text style={styles.overline}>CAPÍTULO COMPLETADO</Text>
                    <Text style={styles.heading}>Una luz para tu camino</Text>
                    <Text style={styles.dialogue}>{content.reward}</Text>
                    <Text style={styles.body}>
                      La biblioteca del aprendizaje está desbloqueada. Su
                      aventura llegará en una próxima fase.
                    </Text>
                    {Platform.OS === "web" && (
                      <Button
                        gold
                        label="Descargar partida"
                        onPress={() => void exportGame()}
                      />
                    )}
                    <Button
                      label="Abrir el diario de viaje"
                      onPress={() => {
                        setPanel(null);
                        setScreen("chapters");
                      }}
                    />
                  </>
                )}
                {panel !== "complete" && panel !== "pause" && (
                  <Button
                    label="Volver"
                    small
                    onPress={() => {
                      if (saveRef.current) {
                        const s = { ...saveRef.current, settings };
                        void storeSave(s)
                          .then(() => {
                            saveRef.current = s;
                            setSave(s);
                          })
                          .catch(() =>
                            setMessage("No se pudieron guardar los ajustes."),
                          );
                      }
                      setPanel(null);
                    }}
                  />
                )}
              </ScrollView>
            </View>
          </View>
        )}
        {screen === "menu" && save && Platform.OS === "web" && (
          <Pressable style={styles.download} onPress={() => void exportGame()}>
            <Text style={styles.downloadText}>↓ Descargar partida</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#182f38",
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    position: "absolute",
    left: "43%",
    right: "5%",
    top: "4%",
    bottom: "3%",
    alignItems: "center",
    justifyContent: "center",
  },
  book: { fontSize: 25, color: "#644653" },
  title: {
    fontFamily: Platform.OS === "web" ? "Georgia" : "serif",
    fontWeight: "700",
    color: "#4f3045",
    textAlign: "center",
  },
  ribbon: {
    backgroundColor: "#d6a7be",
    paddingHorizontal: 20,
    borderBottomWidth: 4,
    borderColor: "#9c6b89",
  },
  precursora: {
    fontFamily: Platform.OS === "web" ? "Georgia" : "serif",
    fontWeight: "900",
    color: "#4f3045",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#4a3545",
    marginVertical: 10,
    maxWidth: 310,
  },
  button: {
    backgroundColor: "#fff0d1",
    borderWidth: 2,
    borderColor: "#ae805e",
    borderBottomWidth: 4,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    borderRadius: 3,
  },
  gold: { backgroundColor: "#ffd17c", borderColor: "#aa7442" },
  small: { paddingVertical: 6, paddingHorizontal: 12, minHeight: 34 },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#563e43",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  prototype: { fontSize: 8, color: "#493b4a", marginTop: 9, letterSpacing: 1 },
  shade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#182e3dbb",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    width: "65%",
    maxWidth: 700,
    padding: 22,
    backgroundColor: "#fff0d9",
    borderWidth: 3,
    borderColor: "#b9997c",
    gap: 12,
    borderRadius: 4,
  },
  heading: {
    fontSize: 25,
    color: "#59415d",
    fontWeight: "700",
    fontFamily: Platform.OS === "web" ? "Georgia" : "serif",
  },
  body: { fontSize: 16, color: "#5b4b55", lineHeight: 24 },
  muted: { fontSize: 12, color: "#796b78", lineHeight: 18 },
  chapter: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#dcc7b5",
    gap: 7,
  },
  hud: {
    position: "absolute",
    top: 12,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  objective: {
    padding: 10,
    backgroundColor: "#243d43e8",
    borderWidth: 1,
    borderColor: "#adbd90",
    maxWidth: "62%",
  },
  overline: {
    fontSize: 10,
    color: "#b99a63",
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  objectiveText: { fontSize: 13, color: "#fff1ca", marginTop: 4 },
  prompt: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "#314b4ddd",
    paddingHorizontal: 12,
    paddingBottom: 6,
    borderRadius: 4,
  },
  controls: {
    position: "absolute",
    bottom: 16,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  touch: {
    width: 54,
    height: 48,
    backgroundColor: "#f4e7cfbb",
    borderWidth: 2,
    borderColor: "#e0c69d",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  touchText: { fontSize: 22, color: "#4d4759", fontWeight: "700" },
  toast: {
    position: "absolute",
    bottom: 5,
    alignSelf: "center",
    maxWidth: "80%",
    backgroundColor: "#243b4bea",
    padding: 9,
    borderRadius: 3,
  },
  toastText: { color: "#fff0d9", fontSize: 12 },
  dialogue: {
    fontSize: 19,
    color: "#594555",
    lineHeight: 29,
    marginVertical: 12,
  },
  download: {
    position: "absolute",
    left: 18,
    bottom: 14,
    padding: 10,
    backgroundColor: "#fff0d9dd",
    borderRadius: 4,
  },
  downloadText: { color: "#574453", fontSize: 12 },
});
