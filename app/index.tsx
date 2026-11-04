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
import Scene from "../components/SceneLoader";
import MainMenu from "../components/MainMenu";
import Portrait from "../components/Portrait";
import ItemArt from "../components/ItemArt";
import ChallengePanel from "../components/ChallengePanel";
import UIIcon, { type UIIconName } from "../components/UIIcon";
import { useGameAudio } from "../game/audio/useGameAudio";
import { World } from "../game/engine/world";
import { FixedStepClock, MAX_FRAME_SECONDS } from "../game/engine/ticker";
import {
  chapters,
  zones,
  checkpoints,
  evidenceDescriptions,
} from "../game/levels/forest";
import {
  addUnique,
  hasMission,
  currentScene,
  objective,
  prerequisites,
  missionTitles,
} from "../game/missions/progress";
import { getScene } from "../game/chapter1/challenges";
import { speakerNames, type Speaker } from "../game/dialogues/presentation";
import { newSave, defaultSettings, type Save } from "../game/save/schema";
import { loadSave, storeSave } from "../game/save/storage";
import { downloadSave, importSave } from "../game/save/transfer";
import { faith } from "../game/inventory/tools";
type Panel =
  | "settings"
  | "credits"
  | "pause"
  | "inventory"
  | "journal"
  | "challenge"
  | "boundary"
  | "reward"
  | "complete"
  | null;
type Dialogue = {
  lines: { speaker: string; text: string }[];
  index: number;
  done?: () => void;
};
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
  const icons: Record<string, UIIconName> = {
    "▶": "play",
    "▤": "book",
    "↥": "upload",
    "⚙": "settings",
    "ⓘ": "info",
    "◇": "bag",
  };
  const icon = label === "Pausa" ? "pause" : icons[label[0]];
  const text = icon && label !== "Pausa" ? label.slice(1).trim() : label;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.button,
        gold && styles.gold,
        small && styles.small,
        disabled && { opacity: 0.45 },
        (pressed || hovered) && !disabled && { backgroundColor: "#e8cc9b" },
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          flexDirection: "row",
          gap: 9,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon && <UIIcon name={icon} size={small ? 16 : 19} />}
        <Text style={[styles.buttonText, small && { fontSize: 15 }]}>
          {text}
        </Text>
      </View>
    </Pressable>
  );
}
function reflectionChoices(raw: string) {
  try {
    const picks = JSON.parse(raw);
    if (!Array.isArray(picks)) return "";
    return picks
      .map((ids, i) =>
        Array.isArray(ids)
          ? ids
              .map(
                (id) =>
                  getScene(10).stages[i]?.options.find((o) => o.id === id)
                    ?.text ?? "",
              )
              .join(" ")
          : "",
      )
      .join(" · ");
  } catch {
    return "";
  }
}
export default function Game() {
  useFonts({
    Pixelify: require("../assets/fonts/PixelifySans.ttf"),
    Cormorant: require("../assets/fonts/CormorantGaramond.ttf"),
  });
  const size = useWindowDimensions(),
    insets = useSafeAreaInsets(),
    width = Math.min(
      size.width - insets.left - insets.right,
      ((size.height - insets.top - insets.bottom) * 16) / 9,
    ),
    height = (width * 9) / 16,
    compact = height < 520;
  const world = useRef(new World()).current;
  const [screen, setScreen] = useState<"menu" | "chapters" | "play">("menu"),
    [panel, setPanel] = useState<Panel>(null),
    [ready, setReady] = useState(false),
    [save, setSave] = useState<Save | null>(null),
    [settings, setSettings] = useState({ ...defaultSettings }),
    [progress, setProgress] = useState({ ...world.progress }),
    [message, setMessage] = useState(""),
    [dialogue, setDialogue] = useState<Dialogue | null>(null),
    [near, setNear] = useState(""),
    [health, setHealth] = useState(3),
    [zone, setZone] = useState(zones[0].name),
    [challenge, setChallenge] = useState(1),
    [journalTab, setJournalTab] = useState<
      "missions" | "map" | "evidence" | "reflections"
    >("missions"),
    [cameraSector, setCameraSector] = useState(0),
    [storageNotice, setStorageNotice] = useState("");
  const x = useSharedValue(120),
    y = useSharedValue(226),
    camera = useSharedValue(0),
    time = useSharedValue(0),
    simulation = useSharedValue(0),
    motion = useSharedValue(0),
    action = useSharedValue(0),
    falling = useSharedValue(0),
    companionX = useSharedValue(80),
    companionY = useSharedValue(226),
    chestFrame = useSharedValue(0),
    pickup = useSharedValue({ x: 0, y: 0, at: -10 });
  const hudCache = useRef({ near: "", zone: zones[0].name, sector: 0 });
  const lastSaveError = useRef("");
  const replayOriginal = useRef<Save | null>(null);
  const saveRef = useRef<Save | null>(null),
    rewardAt = useRef(-1),
    stepAt = useRef(0);
  const live = useRef({ screen, panel, dialogue, settings });
  live.current = { screen, panel, dialogue, settings };
  const sound = useGameAudio(
      settings,
      screen === "play" && !panel && !dialogue,
    ),
    soundRef = useRef(sound);
  soundRef.current = sound;
  useEffect(() => {
    loadSave()
      .then(({ save: s, notice }) => {
        setSave(s);
        saveRef.current = s;
        if (s) setSettings(s.settings);
        if (notice) setStorageNotice(notice);
        setReady(true);
      })
      .catch(() => {
        setStorageNotice(
          "No se pudo preparar el guardado local. Puedes descargar tu progreso antes de cerrar.",
        );
        setReady(true);
      });
  }, []);
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(""), 6500);
    return () => clearTimeout(id);
  }, [message]);
  function syncHud() {
    const cache = hudCache.current,
      label = world.nearby()?.label ?? "",
      name =
        zones.find((z) => world.x >= z.start && world.x < z.end)?.name ??
        zones[0].name,
      sector = Math.floor(world.camera / 240);
    if (label !== cache.near) {
      cache.near = label;
      setNear(label);
    }
    if (name !== cache.zone) {
      cache.zone = name;
      setZone(name);
    }
    if (sector !== cache.sector) {
      cache.sector = sector;
      setCameraSector(sector);
    }
  }
  async function persist() {
    if (replayOriginal.current && !hasMission(world.progress, 16)) {
      saveRef.current = replayOriginal.current;
      setSave(replayOriginal.current);
      return replayOriginal.current;
    }
    if (replayOriginal.current) {
      const original = replayOriginal.current.missions;
      for (const key of ["lights", "items", "evidence", "reflections"] as const)
        for (const value of original[key])
          addUnique(world.progress[key], value);
      setProgress(JSON.parse(JSON.stringify(world.progress)));
      saveRef.current = replayOriginal.current;
      replayOriginal.current = null;
    }
    const prior = saveRef.current,
      s: Save = {
        ...newSave(),
        checkpoint: world.checkpoint,
        position: world.safePosition(),
        health: world.health,
        missions: JSON.parse(JSON.stringify(world.progress)),
        legacyRewards: prior?.legacyRewards ?? false,
        migratedFrom: prior?.migratedFrom ?? null,
        settings: { ...live.current.settings },
        tools:
          hasMission(world.progress, 15) || prior?.legacyRewards ? ["fe"] : [],
        unlockedChapters:
          hasMission(world.progress, 16) || prior?.legacyRewards ? [1, 2] : [1],
      };
    try {
      await storeSave(s);
      if (lastSaveError.current)
        setStorageNotice(
          "Se restableció el guardado local. Tu progreso actual está guardado.",
        );
      lastSaveError.current = "";
    } catch (e) {
      lastSaveError.current = "No se pudo guardar: " + (e as Error).message;
      setStorageNotice(lastSaveError.current);
      setMessage(lastSaveError.current);
    }
    // Even if disk is unavailable, the latest session remains downloadable.
    saveRef.current = s;
    setSave(s);
    return s;
  }
  function refresh() {
    syncHud();
    setProgress(JSON.parse(JSON.stringify(world.progress)));
    setHealth(world.health);
    void persist();
  }
  function say(lines: Dialogue["lines"], done?: () => void) {
    world.release();
    setDialogue({ lines, index: 0, done });
    soundRef.current("interaction");
  }
  function note(
    text: string,
    done?: () => void,
    speaker: Speaker = "narrator",
  ) {
    say([{ speaker, text }], done);
  }
  function resume(s: Save, replay = false) {
    if (!replay) replayOriginal.current = null;
    saveRef.current = s;
    setSave(s);
    world.progress = JSON.parse(JSON.stringify(s.missions));
    world.checkpoint = s.checkpoint;
    world.health = s.health;
    world.restore(s.position);
    world.drainEvents();
    syncHud();
    chestFrame.value = hasMission(world.progress, 15) ? 3 : 0;
    rewardAt.current = -1;
    setProgress({ ...world.progress });
    setHealth(world.health);
    setSettings(s.settings);
    setScreen("play");
    setPanel(null);
    setDialogue(null);
    setMessage(
      "A/D o ← → · Espacio: saltar · E: conversar · J: cuaderno · I: mochila",
    );
    if (!replay && s.migratedFrom === 1 && !s.missions.completedMissions.length)
      note(
        "El bosque ha cambiado. Tus herramientas anteriores se conservan, pero las 16 escenas nuevas comienzan desde la entrada. La partida anterior permanece como respaldo.",
      );
  }
  function start() {
    if (save) {
      setScreen("chapters");
      return;
    }
    const s = { ...newSave(), settings };
    resume(s);
    void persist();
    note(
      "Un sendero se abre entre los árboles. Antes de avanzar, prepara tu cuaderno: camina, salta, ábrelo e interactúa con el libro que está junto al camino.",
    );
  }
  function openJournal() {
    world.release();
    world.markTutorial("journal");
    setPanel("journal");
    refresh();
  }
  function complete(n: number, history: string[][] = []) {
    const decision =
      n === 5 ? (history[0]?.[0] ?? "") : JSON.stringify(history);
    try {
      world.complete(n, decision);
      refresh();
      soundRef.current("discovery");
      setPanel(null);
      if (n === 7)
        note(
          "Gracias por escuchar. Me gustaría acompañarte; podemos comprobar juntos el siguiente paso.",
          undefined,
          "traveler",
        );
      else if (n === 8)
        note(
          "Ahora tengo una acción concreta para comenzar. Gracias por pensar conmigo.",
          undefined,
          "travelerHappy",
        );
      else if (n === 16) setPanel("complete");
      else setMessage("Escena completada · " + missionTitles[n - 1]);
    } catch (e) {
      note((e as Error).message);
    }
  }
  function afterDialogue(n: number) {
    const missing = prerequisites(world.progress, n);
    if (missing.length) {
      note(missing.join("\n"));
      return;
    }
    if (getScene(n).stages.length) {
      setChallenge(n);
      setPanel("challenge");
      return;
    }
    if (n === 15) {
      rewardAt.current = time.value;
      world.release();
      action.value = 5;
      setMessage("El cofre se abre…");
      return;
    }
    complete(n);
  }
  function interact() {
    const state = live.current;
    if (state.dialogue) {
      const d = state.dialogue;
      if (d.index + 1 < d.lines.length)
        setDialogue({ ...d, index: d.index + 1 });
      else {
        setDialogue(null);
        d.done?.();
      }
      return;
    }
    if (state.panel) return;
    world.markTutorial("interact");
    const object = world.nearby();
    if (!object) {
      setMessage(
        "Acércate a alguien o a un objeto marcado. Las luces y pistas se recogen al pasar.",
      );
      return;
    }
    if (object.kind === "helper") {
      if (!hasMission(world.progress, 4)) {
        note("Escucha primero el relato de la caminante junto al arroyo.");
        return;
      }
      addUnique(world.progress.evidence, "helper_offer");
      refresh();
      note(
        "Puedo sostener la rama contigo. Pedir ayuda es una forma sensata de cuidar nuestras fuerzas.",
        undefined,
        "walker",
      );
      return;
    }
    if (object.kind === "rest") {
      if (hasMission(world.progress, 10)) {
        world.rest();
        refresh();
        setMessage("Descansas y recuperas tus tres corazones.");
      } else note("La guía te espera en el claro.");
      return;
    }
    if (object.kind === "boundary") {
      if (!hasMission(world.progress, 11)) {
        note(
          "Antes de entrar, ayuda al viajero del claro a reconocer la ruta segura.",
        );
        return;
      }
      world.release();
      setPanel("boundary");
      return;
    }
    const n = object.scene!;
    if (hasMission(world.progress, n)) {
      note(
        n === 15
          ? "La linterna de la Fe ya está en tu inventario."
          : `Anotaste esta experiencia en el cuaderno. ${objective(world.progress)}`,
      );
      return;
    }
    if (n !== currentScene(world.progress)) {
      note("Antes de continuar: " + objective(world.progress));
      return;
    }
    const s = getScene(n);
    say(s.dialogue, () => afterDialogue(n));
  }
  useEffect(() => {
    let id: number,
      last = 0,
      lastHudAt = -Infinity,
      cancelled = false;
    const ticker = new FixedStepClock();
    const loop = (now: number) => {
      if (cancelled) return;
      // Catch up after low-FPS frames without simulating an unlimited backlog.
      // A 15-FPS cap caused visible slow motion on slower devices.
      const dt = Math.min(
        Math.max(0, (now - last) / 1000 || 0),
        MAX_FRAME_SECONDS,
      );
      last = now;
      time.value += dt;
      const state = live.current;
      const playing =
        state.screen === "play" &&
        !state.panel &&
        !state.dialogue &&
        rewardAt.current < 0;
      if (playing) {
        ticker.advance(dt, (step) => world.step(step));
        const events = world.drainEvents();
        if (events.length) {
          let changed = false;
          for (const event of events) {
            changed = true;
            if (event.message) setMessage(event.message);
            if (event.type === "pickup") {
              pickup.value = { x: event.x!, y: event.y!, at: time.value };
              soundRef.current("discovery");
            }
            if (event.type === "damage") soundRef.current("interaction");
          }
          if (changed) refresh();
        }
        // HUD and view-window state need not rerender on every animation frame.
        if (now - lastHudAt >= 100) {
          lastHudAt = now;
          syncHud();
        }
        if (
          world.moving &&
          world.grounded &&
          time.value - stepAt.current > 0.3
        ) {
          soundRef.current("step");
          stepAt.current = time.value;
        }
      }
      if (!playing) ticker.reset();
      x.value = world.x;
      y.value = world.y;
      camera.value = world.camera;
      simulation.value = world.time;
      companionX.value = world.companionX;
      companionY.value = world.companionY;
      falling.value = world.vy > 0 ? 1 : 0;
      motion.value = playing
        ? world.grounded
          ? world.moving
            ? world.facing
            : 0
          : world.facing * 2
        : 0;
      if (rewardAt.current >= 0) {
        const elapsed = time.value - rewardAt.current;
        chestFrame.value = Math.min(3, Math.floor(elapsed / 0.6));
        action.value = elapsed > 1.8 ? 6 : 5;
        if (elapsed > 3) {
          rewardAt.current = -1;
          complete(15);
          setPanel("reward");
        }
      } else action.value = state.dialogue ? 3 : 0;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const down = (e: KeyboardEvent) => {
      if (live.current.screen !== "play") return;
      const key = e.key.toLowerCase();
      if ([" ", "arrowleft", "arrowright", "arrowup"].includes(key))
        e.preventDefault();
      if (key === "escape") {
        world.release();
        if (live.current.dialogue) {
          setDialogue(null);
          return;
        }
        setPanel((p) => (p ? null : "pause"));
        return;
      }
      if (e.repeat && ["e", "i", "j"].includes(key)) return;
      if (key === "e") {
        interact();
        return;
      }
      if (live.current.panel || live.current.dialogue) return;
      if (key === "i") {
        world.release();
        setPanel("inventory");
        return;
      }
      if (key === "j") {
        openJournal();
        return;
      }
      if (key === "a" || key === "arrowleft") world.input.left = true;
      if (key === "d" || key === "arrowright") world.input.right = true;
      if ((key === " " || key === "arrowup") && !e.repeat)
        world.input.jump = true;
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
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active" && live.current.screen === "play") {
        world.release();
        setPanel("pause");
        void persist();
      }
    });
    return () => sub.remove();
  }, []);
  async function exportGame() {
    try {
      await downloadSave(
        screen === "play" ? await persist() : (saveRef.current ?? newSave()),
      );
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  async function importGame() {
    try {
      const imported = await importSave();
      if (imported) {
        await storeSave(imported);
        saveRef.current = imported;
        setSave(imported);
        resume(imported);
        setMessage("Partida validada y restaurada.");
      }
    } catch (e) {
      note(
        "No se cargó la partida. " +
          (e as Error).message +
          " Tu progreso anterior se conserva.",
      );
    }
  }
  const portraitMenu = screen === "menu" && size.height > size.width;
  const stageWidth = portraitMenu
    ? size.width - insets.left - insets.right
    : width;
  const stageHeight = portraitMenu
    ? size.height - insets.top - insets.bottom
    : height;
  const talking = dialogue
    ? (dialogue.lines[dialogue.index].speaker as Speaker)
    : null;
  const paperWidth = compact ? "90%" : "76%";
  return (
    <SafeAreaView style={styles.root}>
      <View
        style={{
          width: stageWidth,
          height: stageHeight,
          overflow: "hidden",
          backgroundColor: "#203d40",
        }}
      >
        {screen !== "menu" && (
          <Scene
            width={width}
            height={height}
            menu={screen !== "play"}
            cameraSector={cameraSector}
            {...{
              x,
              y,
              camera,
              time,
              simulation,
              motion,
              action,
              falling,
              companionX,
              companionY,
              chestFrame,
              progress,
              pickup,
              talking,
            }}
            reducedMotion={settings.reducedMotion}
          />
        )}
        {screen === "menu" && (
          <MainMenu
            width={stageWidth}
            height={stageHeight}
            save={save}
            ready={ready}
            time={time}
            reducedMotion={settings.reducedMotion}
            onStart={start}
            onContinue={() => save && resume(save)}
            onImport={() => void importGame()}
            onSettings={() => setPanel("settings")}
            onCredits={() => setPanel("credits")}
            onExport={() => void exportGame()}
          />
        )}
        {screen === "chapters" && !panel && (
          <View style={styles.shade}>
            <View
              style={[styles.paper, { width: paperWidth, maxHeight: "92%" }]}
            >
              <ScrollView contentContainerStyle={{ gap: 12 }}>
                <Text style={styles.heading}>El diario de viaje</Text>
                {chapters.map((title, i) => (
                  <View key={title} style={styles.chapter}>
                    <Text style={styles.body}>
                      {save?.unlockedChapters.includes(i + 1) ? "✧" : "🔒"}{" "}
                      {String(i + 1).padStart(2, "0")} · {title}
                    </Text>
                    {i === 0 ? (
                      <View style={styles.row}>
                        <Button
                          small
                          label="Continuar el bosque"
                          onPress={() => resume(save ?? newSave())}
                        />
                        <Button
                          small
                          label="Repetir capítulo"
                          onPress={() => {
                            const s = {
                              ...newSave(),
                              settings,
                              legacyRewards:
                                save?.tools.includes("fe") ?? false,
                              migratedFrom: save?.tools.includes("fe")
                                ? (1 as const)
                                : null,
                            };
                            if (s.legacyRewards) {
                              s.tools = ["fe"];
                              s.unlockedChapters = [1, 2];
                            }
                            replayOriginal.current = save;
                            resume(s, true);
                            void persist();
                          }}
                        />
                      </View>
                    ) : (
                      <Text style={styles.muted}>
                        {i === 1 && save?.unlockedChapters.includes(2)
                          ? "Desbloqueado. Su aventura llegará en una próxima fase."
                          : "Una nueva experiencia espera al otro lado del sendero."}
                      </Text>
                    )}
                  </View>
                ))}
                <Button
                  label="Volver al inicio"
                  onPress={() => setScreen("menu")}
                />
              </ScrollView>
            </View>
          </View>
        )}
        {screen === "play" && (
          <>
            <View
              style={[styles.hud, compact && { top: 8, left: 9, right: 9 }]}
            >
              <View style={[styles.objective, compact && { padding: 8 }]}>
                <Text style={styles.overline}>
                  CAPÍTULO I · {zone.toLocaleUpperCase("es")}
                </Text>
                <Text
                  style={[styles.objectiveText, compact && { fontSize: 13 }]}
                >
                  {objective(progress)}
                </Text>
                <Text
                  accessibilityLabel={`${health} de 3 corazones`}
                  style={{ color: "#f0bb9c", fontSize: 17, marginTop: 3 }}
                >
                  {"♥ ".repeat(health)}
                  <Text style={{ color: "#a7aaa0" }}>
                    {"♡ ".repeat(3 - health)}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#ddd5b4" }}>
                    {" "}
                    · Luces {progress.lights.length}/7
                  </Text>
                </Text>
              </View>
              <View style={[styles.row, { alignItems: "flex-start" }]}>
                <Button small label="▤ Cuaderno" onPress={openJournal} />
                <Button
                  small
                  label="◇ Inventario"
                  onPress={() => {
                    world.release();
                    setPanel("inventory");
                  }}
                />
                <Button
                  small
                  label="Pausa"
                  onPress={() => {
                    world.release();
                    setPanel("pause");
                  }}
                />
              </View>
            </View>
            {!panel && !dialogue && rewardAt.current < 0 && (
              <>
                <View
                  style={[
                    styles.controls,
                    compact && { bottom: 10, left: 12, right: 12 },
                  ]}
                >
                  <View style={styles.row}>
                    {(["left", "right"] as const).map((key, i) => (
                      <Pressable
                        key={key}
                        accessibilityRole="button"
                        accessibilityLabel={
                          i ? "Caminar a la derecha" : "Caminar a la izquierda"
                        }
                        onPressIn={() => (world.input[key] = true)}
                        onPressOut={() => (world.input[key] = false)}
                        style={[
                          styles.touch,
                          compact && { width: 52, height: 48 },
                        ]}
                      >
                        <UIIcon
                          name={i ? "play" : "left"}
                          size={24}
                          color="#f6e8c7"
                        />
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.row}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Saltar"
                      onPressIn={() => (world.input.jump = true)}
                      onPress={() => (world.input.jump = true)}
                      style={[
                        styles.touch,
                        compact && { width: 52, height: 48 },
                      ]}
                    >
                      <Text style={styles.touchText}>↑</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Interactuar"
                      onPress={interact}
                      style={[
                        styles.touch,
                        compact && { width: 52, height: 48 },
                      ]}
                    >
                      <Text style={styles.touchText}>E</Text>
                    </Pressable>
                  </View>
                </View>
                {near !== "" && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={interact}
                    style={[styles.prompt, compact && { bottom: 66 }]}
                  >
                    <Text style={styles.objectiveText}>E · {near}</Text>
                  </Pressable>
                )}
              </>
            )}
          </>
        )}
        {screen === "menu" && !panel && !dialogue && storageNotice !== "" && (
          <View
            accessibilityRole="alert"
            style={{
              position: "absolute",
              left: stageWidth * 0.04,
              top: stageHeight * 0.14,
              width: portraitMenu ? stageWidth * 0.92 : stageWidth * 0.42,
              maxHeight: stageHeight * 0.55,
              padding: 12,
              gap: 8,
              backgroundColor: "#203d3df5",
              borderColor: "#bea778",
              borderWidth: 1,
              borderRadius: 8,
            }}
          >
            <ScrollView>
              <Text style={{ color: "#fff0cf", fontSize: 13, lineHeight: 19 }}>
                {storageNotice}
              </Text>
            </ScrollView>
            <Button
              small
              label="Entendido"
              onPress={() => setStorageNotice("")}
            />
          </View>
        )}
        {message !== "" && !dialogue && !panel && (
          <View
            pointerEvents="none"
            style={[
              styles.toast,
              screen === "menu"
                ? {
                    top: height * 0.2,
                    left: width * 0.04,
                    bottom: undefined,
                    maxWidth: "39%" as const,
                    alignSelf: "flex-start" as const,
                  }
                : { bottom: compact ? 67 : 86 },
            ]}
          >
            <Text style={styles.toastText}>{message}</Text>
          </View>
        )}
        {dialogue && (
          <View style={styles.dialogueShade}>
            <View
              style={[
                styles.dialoguePaper,
                {
                  width: compact ? "94%" : "82%",
                  padding: compact ? 16 : 25,
                  maxHeight: "87%",
                },
              ]}
            >
              <ScrollView contentContainerStyle={{ gap: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <Portrait speaker={talking!} size={compact ? 58 : 74} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.muted}>
                      EL BOSQUE DE LAS DUDAS · {dialogue.index + 1}/
                      {dialogue.lines.length}
                    </Text>
                    <Text style={styles.heading}>
                      {speakerNames[talking!] ?? "El camino"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.dialogue,
                    {
                      fontSize: compact ? 18 : 22,
                      lineHeight: compact ? 27 : 33,
                    },
                  ]}
                >
                  {dialogue.lines[dialogue.index].text}
                </Text>
                <Button
                  gold
                  label={
                    dialogue.index + 1 < dialogue.lines.length
                      ? "Continuar →"
                      : "Seguir mi camino →"
                  }
                  onPress={interact}
                />
              </ScrollView>
            </View>
          </View>
        )}
        {panel && (
          <View style={styles.shade}>
            <View
              style={[
                styles.paper,
                {
                  width: paperWidth,
                  maxWidth: 940,
                  maxHeight: "92%",
                  padding: compact ? 16 : 28,
                },
              ]}
            >
              <ScrollView contentContainerStyle={{ gap: 17 }}>
                {panel === "challenge" && (
                  <>
                    <Text style={styles.heading}>
                      {getScene(challenge).title}
                    </Text>
                    <ChallengePanel
                      key={challenge}
                      scene={getScene(challenge)}
                      progress={progress}
                      onComplete={(h) => complete(challenge, h)}
                    />
                  </>
                )}
                {panel === "boundary" && (
                  <>
                    <Text style={styles.heading}>El sendero de la niebla</Text>
                    <Text style={styles.body}>
                      El tramo que viene exige saltar entre apoyos móviles y
                      piedras húmedas. Tras entrar, el camino de regreso quedará
                      cubierto. Tu cuaderno, objetos y decisiones están
                      guardados.
                    </Text>
                    <Text style={styles.body}>
                      Si pierdes tus tres corazones, volverás al checkpoint de
                      la niebla sin perder tu historia. Puedes descansar antes
                      en el claro.
                    </Text>
                    <Button
                      gold
                      label="Estoy lista · entrar en la niebla"
                      onPress={() => {
                        world.enterMist();
                        setPanel(null);
                        refresh();
                      }}
                    />
                  </>
                )}
                {panel === "journal" && (
                  <>
                    <Text style={styles.heading}>Mi cuaderno del camino</Text>
                    <View style={[styles.row, { flexWrap: "wrap" }]}>
                      {(
                        ["missions", "map", "evidence", "reflections"] as const
                      ).map((tab, i) => (
                        <Button
                          small
                          key={tab}
                          gold={journalTab === tab}
                          label={
                            ["Misiones", "Mapa", "Evidencias", "Reflexiones"][i]
                          }
                          onPress={() => setJournalTab(tab)}
                        />
                      ))}
                    </View>
                    {journalTab === "missions" && (
                      <>
                        <Text style={styles.body}>{objective(progress)}</Text>
                        {!hasMission(progress, 1) && (
                          <Text style={styles.body}>
                            {Object.entries(progress.tutorial)
                              .map(
                                ([key, value]) =>
                                  `${value ? "✓" : "○"} ${{ walk: "Caminar", jump: "Saltar", journal: "Abrir cuaderno", interact: "Interactuar" }[key]}`,
                              )
                              .join(" · ")}
                          </Text>
                        )}
                        {!hasMission(progress, 1) && (
                          <Text style={styles.muted}>
                            Para completar la preparación, practica los cuatro
                            controles anteriores. Cuando todos tengan ✓, utiliza
                            el botón Finalizar preparación. También puedes
                            conversar con el cuaderno físico al inicio.
                          </Text>
                        )}
                        {!hasMission(progress, 1) &&
                          Object.values(progress.tutorial).every(Boolean) && (
                            <Button
                              gold
                              label="Finalizar preparación"
                              onPress={() => {
                                setPanel(null);
                                say(getScene(1).dialogue, () => complete(1));
                              }}
                            />
                          )}
                        {missionTitles.map((title, i) => (
                          <Text
                            key={title}
                            style={[
                              styles.body,
                              {
                                color: hasMission(progress, i + 1)
                                  ? "#3e7058"
                                  : "#797467",
                              },
                            ]}
                          >
                            {hasMission(progress, i + 1) ? "✓" : "○"}{" "}
                            {String(i + 1).padStart(2, "0")} · {title}
                          </Text>
                        ))}
                      </>
                    )}
                    {journalTab === "map" &&
                      (hasMission(progress, 2) ? (
                        <>
                          {zones.map((z) => (
                            <View
                              key={z.id}
                              style={[
                                styles.mapZone,
                                {
                                  borderColor:
                                    zone === z.name ? "#ac8552" : "#c7c5ad",
                                },
                              ]}
                            >
                              <Text style={styles.body}>
                                {zone === z.name ? "◆ " : "· "}
                                {z.name}
                              </Text>
                              <Text style={styles.muted}>
                                {z.id === "bridge"
                                  ? "Revisa el paso elevado; el puente principal sufrió daños."
                                  : z.id === "mist"
                                    ? "Checkpoint al entrar · apoyos móviles · regreso cerrado."
                                    : z.id === "refuge"
                                      ? "Entrega del mapa y descanso."
                                      : "Busca señales, conversa y observa el entorno."}
                              </Text>
                            </View>
                          ))}
                          <Text style={styles.muted}>
                            Checkpoint: {world.checkpoint.replace("ch1_", "")} ·
                            Los círculos de luz son recuerdos opcionales.
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.body}>
                          La guía te ayudará a interpretar el mapa al completar
                          la segunda escena.
                        </Text>
                      ))}
                    {journalTab === "evidence" && (
                      <>
                        {progress.evidence.length ? (
                          progress.evidence.map((id) => (
                            <View key={id} style={styles.mapZone}>
                              <Text style={styles.body}>
                                {evidenceDescriptions[id]}
                              </Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.body}>
                            Todavía no hay observaciones. Las pistas se guardan
                            al pasar cerca.
                          </Text>
                        )}
                        <Text style={styles.body}>
                          Mochila:{" "}
                          {progress.items
                            .map(
                              (id) =>
                                ({
                                  lever: "palanca",
                                  cover: "cubierta del farol",
                                  wick: "mecha",
                                })[id],
                            )
                            .join(", ") || "sin materiales todavía"}
                        </Text>
                      </>
                    )}
                    {journalTab === "reflections" && (
                      <>
                        {progress.reflections.length ? (
                          progress.reflections.map((r, i) => (
                            <Text key={i} style={styles.body}>
                              ✧ {r}
                            </Text>
                          ))
                        ) : (
                          <Text style={styles.body}>
                            Tus experiencias irán dejando pequeñas reflexiones.
                          </Text>
                        )}
                        {progress.decisions.CH1_10 && (
                          <Text style={styles.muted}>
                            En el descanso elegiste:{" "}
                            {reflectionChoices(progress.decisions.CH1_10)}. La
                            reflexión es personal; no se califica una oración.
                          </Text>
                        )}
                      </>
                    )}
                  </>
                )}
                {panel === "inventory" && (
                  <>
                    <Text style={styles.heading}>
                      Las herramientas del camino
                    </Text>
                    {save?.tools.includes("fe") || hasMission(progress, 15) ? (
                      <>
                        <View style={{ alignItems: "center" }}>
                          <ItemArt index={2} size={105} />
                        </View>
                        <Text style={styles.body}>
                          {faith.name}
                          {"\n\n"}
                          {faith.description}
                          {"\n\n"}
                          {faith.ability}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.body}>
                        Aún no has recibido una herramienta. Los materiales del
                        farol están en el cuaderno, en la pestaña Evidencias.
                      </Text>
                    )}
                  </>
                )}
                {panel === "settings" && (
                  <>
                    <Text style={styles.heading}>Ajustes</Text>
                    {(["music", "effects"] as const).map((key, i) => (
                      <View key={key} style={styles.mapZone}>
                        <Text style={styles.body}>
                          {i ? "Efectos" : "Música"} ·{" "}
                          {Math.round(settings[key] * 100)}%
                        </Text>
                        <View style={styles.row}>
                          <Button
                            small
                            label="−"
                            onPress={() =>
                              setSettings((s) => ({
                                ...s,
                                [key]: Math.max(0, +(s[key] - 0.1).toFixed(1)),
                              }))
                            }
                          />
                          <Button
                            small
                            label="+"
                            onPress={() =>
                              setSettings((s) => ({
                                ...s,
                                [key]: Math.min(1, +(s[key] + 0.1).toFixed(1)),
                              }))
                            }
                          />
                        </View>
                      </View>
                    ))}
                    <View
                      style={[styles.row, { justifyContent: "space-between" }]}
                    >
                      <Text style={styles.body}>
                        Reducir efectos y movimiento ambiental
                      </Text>
                      <Switch
                        value={settings.reducedMotion}
                        onValueChange={(reducedMotion) =>
                          setSettings((s) => ({ ...s, reducedMotion }))
                        }
                      />
                    </View>
                    <Text style={styles.muted}>
                      Las plataformas mantienen su movimiento porque forma parte
                      del desafío. Se reducen los destellos y las animaciones
                      ambientales.
                    </Text>
                  </>
                )}
                {panel === "credits" && (
                  <>
                    <Text style={styles.heading}>
                      El camino de una Precursora
                    </Text>
                    <Text style={styles.body}>
                      Una aventura de fe, aprendizaje y perseverancia.{"\n\n"}
                      Arte original generado para este proyecto y animado con
                      atlas registrados. Música y efectos sintetizados
                      originales. Expo · React Native · Skia.{"\n\n"}Las
                      referencias bíblicas acompañan reflexiones adaptadas. No
                      se presentan como citas literales. Sin anuncios, compras
                      ni cuentas.
                    </Text>
                  </>
                )}
                {panel === "pause" && (
                  <>
                    <Text style={styles.heading}>Un respiro en el camino</Text>
                    <Text style={styles.body}>
                      Checkpoint: {world.checkpoint.replace("ch1_", "")} ·{" "}
                      {health}/3 corazones
                    </Text>
                    <Button
                      gold
                      label="Continuar aventura"
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
                        setScreen("menu");
                        setMessage(
                          lastSaveError.current
                            ? "Tu progreso sigue en esta sesión, pero no se guardó en el dispositivo. Descarga una copia antes de cerrar."
                            : "Partida guardada. Puedes descargar una copia antes de cerrar.",
                        );
                      }}
                    />
                  </>
                )}
                {panel === "reward" && (
                  <>
                    <Text style={styles.overline}>HERRAMIENTA OBTENIDA</Text>
                    <Text style={styles.heading}>Una luz para tu camino</Text>
                    <View style={{ alignItems: "center" }}>
                      <ItemArt index={2} size={100} />
                    </View>
                    <Text style={styles.body}>
                      ¡Has obtenido la Fe! Recuerda que incluso cuando no puedes
                      ver todo el camino, puedes seguir adelante con confianza.
                    </Text>
                    <Text style={styles.body}>
                      El cofre guardaba suministros, pero tu viaje dio sentido a
                      esta pequeña linterna. La puerta del refugio está un poco
                      más adelante.
                    </Text>
                    <Button
                      gold
                      label="Guardar la linterna y continuar"
                      onPress={() => setPanel(null)}
                    />
                  </>
                )}
                {panel === "complete" && (
                  <>
                    <Text style={styles.overline}>CAPÍTULO I · COMPLETADO</Text>
                    <Text style={styles.heading}>El viaje continúa</Text>
                    <Text style={styles.body}>
                      La biblioteca del aprendizaje está desbloqueada. Su
                      aventura llegará en una próxima fase.
                    </Text>
                    <Text style={styles.body}>
                      Tu cuaderno conserva {progress.evidence.length}{" "}
                      evidencias, {progress.reflections.length} reflexiones y{" "}
                      {progress.lights.length}/7 luces opcionales.
                    </Text>
                    <Text style={styles.body}>
                      Tus decisiones:{"\n"}
                      {progress.reflections.join("\n")}
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
                {!["complete", "pause", "reward"].includes(panel) && (
                  <Button
                    label={
                      panel === "challenge" ? "Volver al bosque" : "Volver"
                    }
                    small
                    onPress={() => {
                      if (panel === "settings" && saveRef.current) {
                        const s = { ...saveRef.current, settings };
                        saveRef.current = s;
                        setSave(s);
                        void storeSave(s).catch((e) =>
                          setStorageNotice(
                            "No se pudieron guardar los ajustes: " +
                              (e as Error).message,
                          ),
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapZone: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#c7c5ad",
    borderRadius: 8,
    gap: 6,
    backgroundColor: "#f2ead7",
  },
  dialogueShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#132d3680",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  dialoguePaper: {
    backgroundColor: "#fff2de",
    borderWidth: 2,
    borderColor: "#b6a585",
    borderRadius: 12,
  },
  root: {
    flex: 1,
    backgroundColor: "#19282d",
    alignItems: "center",
    justifyContent: "center",
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
});
