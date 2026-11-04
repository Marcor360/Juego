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
import { useFonts } from "expo-font";
import { useSharedValue } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import UIIcon, { type UIIconName } from "../components/UIIcon";
import Scene from "../components/SceneLoader";
import { useGameAudio } from "../game/audio/useGameAudio";
import { World } from "../game/engine/world";
import { chapters } from "../game/levels/forest";
import { collect, objective } from "../game/missions/progress";
import {
  dialogueSpeaker,
  speakerNames,
  type Speaker,
} from "../game/dialogues/presentation";
import ItemArt from "../components/ItemArt";
import Portrait from "../components/Portrait";
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
  const iconNames: Record<string, UIIconName> = {
    "▶": "play",
    "▤": "book",
    "↥": "upload",
    "⚙": "settings",
    "ⓘ": "info",
    "◇": "bag",
  };
  const icon = label === "Pausa" ? "pause" : iconNames[label[0]];
  const displayLabel =
    icon && label !== "Pausa" ? label.slice(1).trim() : label;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label.replace(/\s+/g, " ")}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.button,
        gold && styles.gold,
        small && styles.small,
        disabled && { opacity: 0.5 },
        (pressed || hovered) &&
          !disabled && {
            backgroundColor: "#ffe5b2",
            transform: [{ translateY: 1 }],
          },
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon && <UIIcon name={icon} size={small ? 16 : 19} />}
        <Text style={[styles.buttonText, small && { fontSize: 15 }]}>
          {displayLabel}
        </Text>
      </View>
    </Pressable>
  );
}
export default function Game() {
  useFonts({ Pixelify: require("../assets/fonts/PixelifySans.ttf") });
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
      speaker: Speaker;
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
    action = useSharedValue(0),
    falling = useSharedValue(0);
  const pickup = useSharedValue({ x: 0, y: 0, at: -10 });
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
  useEffect(() => {
    if (!message.startsWith("✧")) return;
    const timer = setTimeout(
      () => setMessage((current) => (current === message ? "" : current)),
      6500,
    );
    return () => clearTimeout(timer);
  }, [message]);
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
  function say(
    lines: string[],
    done?: () => void,
    speaker: Speaker = "narrator",
  ) {
    soundRef.current("interaction");
    world.release();
    setDialogue({ lines, index: 0, done, speaker });
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
      say(
        content.guide,
        () => {
          p.guide = true;
          refresh();
        },
        "guide",
      );
      return;
    }
    if (!p.guide) {
      setMessage("Primero habla con la guía del bosque.");
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
        say(
          [
            "Gracias por escucharme. Ya no siento que deba recorrer este camino a solas.",
          ],
          undefined,
          "travelerHappy",
        );
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
      setMessage("");
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
        for (const event of world.drainPickups()) {
          pickup.value = { x: event.x, y: event.y, at: time.value };
          setMessage(
            `✧ ${world.progress.lights.length}/3 · ${content.reflections[Number(event.id.slice(-1)) - 1]}`,
          );
          refresh();
        }
        x.value = world.x;
        y.value = world.y;
        falling.value = world.vy > 0 ? 1 : 0;
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
        motion.value = 0;
        acc = 0;
      }
      action.value =
        l.panel === "complete"
          ? Date.now() - completionStart.current < 900
            ? 4
            : Date.now() - completionStart.current < 1800
              ? 5
              : 6
          : l.dialogue &&
              dialogueSpeaker(l.dialogue.speaker, l.dialogue.index) === "hero"
            ? 3
            : 0;
      time.value += dt;
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
      {label === "◀" || label === "▶" ? (
        <UIIcon
          name={label === "◀" ? "left" : "play"}
          size={21}
          color="#f6e8c7"
        />
      ) : (
        <Text style={styles.touchText}>{label}</Text>
      )}
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
          pickup={pickup}
          talking={
            dialogue
              ? dialogueSpeaker(dialogue.speaker, dialogue.index)
              : panel === "traveler"
                ? "traveler"
                : null
          }
          falling={falling}
        />
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 960,
            height: 540,
            transform: [{ scale: width / 960 }],
            transformOrigin: "top left",
          }}
        >
          {screen === "menu" && (
            <View style={styles.menu}>
              <View style={styles.bookMark} accessibilityElementsHidden>
                <ItemArt index={3} size={78} />
              </View>
              <Text style={[styles.title, { fontSize: 29 }]}>
                El camino de una
              </Text>
              <View style={styles.ribbon}>
                <Text style={[styles.precursora, { fontSize: 60 }]}>
                  Precursora
                </Text>
              </View>
              <Text style={[styles.subtitle, { fontSize: 16 }]}>
                Una aventura de fe, aprendizaje y perseverancia
              </Text>
              <View style={{ width: "79%", gap: 9 }}>
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
                EL BOSQUE DE LAS DUDAS · CAPÍTULO I
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
                  <Text style={styles.objectiveText}>
                    {objective(progress)}
                  </Text>
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
                  <Button
                    small
                    label="◇ Inventario"
                    onPress={() => setPanel("inventory")}
                  />
                  <Button
                    small
                    label="Pausa"
                    onPress={() => setPanel("pause")}
                  />
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Portrait
                    speaker={dialogueSpeaker(dialogue.speaker, dialogue.index)}
                    size={66}
                  />
                  <View>
                    <Text style={styles.overline}>EL BOSQUE DE LAS DUDAS</Text>
                    <Text style={styles.speaker}>
                      {
                        speakerNames[
                          dialogueSpeaker(dialogue.speaker, dialogue.index)
                        ]
                      }
                    </Text>
                  </View>
                </View>
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
                      <Text style={styles.body}>
                        Efectos visuales reducidos
                      </Text>
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
                      <Text style={styles.heading}>
                        Un respiro en el camino
                      </Text>
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
                      {(save?.tools.includes("fe") || progress.complete) && (
                        <View style={{ alignItems: "center" }}>
                          <ItemArt index={2} size={125} />
                        </View>
                      )}
                      <Text style={styles.body}>
                        {save?.tools.includes("fe") || progress.complete
                          ? `${faith.icon} ${faith.name}\n\n${faith.description}\n\n${faith.ability}`
                          : "Cada experiencia te ayudará a descubrir una nueva herramienta. Sigue explorando."}
                      </Text>
                    </>
                  )}
                  {panel === "traveler" && (
                    <>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 14,
                          alignItems: "center",
                        }}
                      >
                        <Portrait speaker="traveler" size={66} />
                        <Text style={styles.heading}>El claro del viajero</Text>
                      </View>
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
                          say(
                            [
                              "Gracias por escucharme. Saber que no estoy solo me da fuerzas para seguir.",
                            ],
                            undefined,
                            "travelerHappy",
                          );
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
                            onPress={() => {
                              setMessage("");
                              setWords((w) => [...w, i]);
                            }}
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
            <Pressable
              style={styles.download}
              onPress={() => void exportGame()}
            >
              <Text style={styles.downloadText}>↓ Descargar partida</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#19282d",
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    position: "absolute",
    left: "44%",
    right: "4%",
    top: "5%",
    bottom: "5%",
    alignItems: "center",
    justifyContent: "center",
  },
  bookMark: {
    height: 51,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  olive: { fontSize: 39, color: "#667653" },
  bookPages: { flexDirection: "row", alignItems: "center" },
  bookPage: {
    width: 35,
    height: 37,
    backgroundColor: "#fff1d6",
    borderWidth: 2,
    borderColor: "#825c4e",
    borderBottomWidth: 4,
    padding: 5,
    gap: 4,
  },
  bookLine: { height: 2, width: 21, backgroundColor: "#c6a57f" },
  title: {
    fontFamily: "Pixelify",
    fontWeight: "500",
    color: "#55374b",
    textAlign: "center",
    letterSpacing: 1,
  },
  ribbon: {
    backgroundColor: "#d8b2c8",
    paddingHorizontal: 25,
    paddingBottom: 4,
    borderTopWidth: 2,
    borderBottomWidth: 5,
    borderColor: "#a57994",
    marginVertical: 5,
    boxShadow: "0 3px 0 #734c6622",
  },
  precursora: {
    fontFamily: "Pixelify",
    fontWeight: "700",
    color: "#503146",
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    textAlign: "center",
    color: "#593f50",
    marginTop: 9,
    marginBottom: 20,
    maxWidth: 330,
    lineHeight: 22,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#fff0d9",
    borderWidth: 2,
    borderColor: "#b58c6d",
    borderBottomWidth: 4,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    borderRadius: 7,
    boxShadow: "0 3px 8px #3c283a22",
  },
  gold: {
    backgroundColor: "#f8cf82",
    borderColor: "#b87e40",
    borderTopColor: "#fff0ba",
  },
  small: { paddingVertical: 7, paddingHorizontal: 14, minHeight: 38 },
  buttonText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#553c44",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  prototype: {
    fontFamily: "Pixelify",
    fontSize: 11,
    color: "#63495a",
    marginTop: 19,
    letterSpacing: 2,
  },
  shade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#152b3ac4",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    width: "70%",
    maxWidth: 700,
    padding: 26,
    backgroundColor: "#fff2de",
    borderWidth: 2,
    borderColor: "#caac86",
    borderBottomWidth: 5,
    gap: 14,
    borderRadius: 12,
    boxShadow: "0 12px 35px #10232366",
  },
  heading: {
    fontSize: 29,
    color: "#62455e",
    fontFamily: "Pixelify",
    fontWeight: "600",
  },
  body: { fontSize: 17, color: "#52454b", lineHeight: 25 },
  muted: { fontSize: 13, color: "#74616c", lineHeight: 19 },
  chapter: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#dcc7b5",
    gap: 7,
  },
  hud: {
    position: "absolute",
    top: 16,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  objective: {
    padding: 13,
    backgroundColor: "#173c3eea",
    borderWidth: 1,
    borderColor: "#9dad7a",
    borderRadius: 8,
    maxWidth: "63%",
    boxShadow: "0 3px 10px #142b3433",
  },
  overline: {
    fontFamily: "Pixelify",
    fontSize: 12,
    color: "#d4b87d",
    letterSpacing: 1.3,
    fontWeight: "600",
  },
  objectiveText: {
    fontSize: 15,
    color: "#fff1ca",
    marginTop: 5,
    fontWeight: "500",
  },
  prompt: {
    position: "absolute",
    bottom: 94,
    alignSelf: "center",
    backgroundColor: "#203e3fe8",
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#a9ac7e",
  },
  controls: {
    position: "absolute",
    bottom: 20,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  touch: {
    width: 64,
    height: 58,
    backgroundColor: "#183c3ecc",
    borderWidth: 1,
    borderColor: "#ded5b497",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  touchText: { fontSize: 25, color: "#f6e8c7", fontWeight: "600" },
  toast: {
    position: "absolute",
    bottom: 13,
    alignSelf: "center",
    maxWidth: "62%",
    backgroundColor: "#19383eea",
    padding: 11,
    borderRadius: 7,
  },
  toastText: { color: "#fff0d9", fontSize: 13 },
  dialogue: {
    fontSize: 21,
    color: "#51424b",
    lineHeight: 31,
    marginVertical: 10,
  },
  portraitFrame: {
    height: 66,
    width: 66,
    backgroundColor: "#d6d7b8",
    borderWidth: 2,
    borderColor: "#b7ae89",
    borderRadius: 9,
    alignItems: "center",
    overflow: "hidden",
  },
  speaker: {
    fontSize: 19,
    fontFamily: "Pixelify",
    color: "#65475e",
    marginTop: 4,
  },
  download: {
    position: "absolute",
    left: 22,
    bottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#fff0d9e8",
    borderWidth: 1,
    borderColor: "#b6977a",
    borderRadius: 6,
  },
  downloadText: { color: "#574453", fontSize: 13 },
});
