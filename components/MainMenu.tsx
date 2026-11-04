import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { menuThemeForSave, menuThemes } from "../game/menu/themes";
import type { Save } from "../game/save/schema";
import UIIcon, { type UIIconName } from "./UIIcon";
import originalArt from "../game/rendering/menu-art.json";
import formalArt from "../game/rendering/menu-formal-art.json";
const backgrounds = {
  beginning: require("../assets/menu/beginning.png"),
  middle: require("../assets/menu/middle.png"),
  ending: require("../assets/menu/ending.png"),
};
const originalHeroSource = require("../assets/menu/hero.png");
const formalHeroSource = require("../assets/menu/hero-formal.png");
function MenuAction({
  label,
  text,
  icon,
  onPress,
  disabled = false,
  gold = false,
  ink,
  accent,
  small = false,
}: {
  label: string;
  text: string;
  icon: UIIconName;
  onPress: () => void;
  disabled?: boolean;
  gold?: boolean;
  ink: string;
  accent: string;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={3}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        s.button,
        {
          borderColor: gold ? accent : accent + "77",
          backgroundColor: gold ? "#ebd0a0" : "#fffaf0b8",
          opacity: disabled ? 0.42 : 1,
        },
        small && s.small,
        gold && s.primary,
        (pressed || hovered) &&
          !disabled && {
            backgroundColor: gold ? "#f5dfb7" : "#fffaf2",
            transform: [{ translateY: pressed ? 1 : 0 }],
            borderColor: accent,
          },
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
        }}
      >
        <UIIcon name={icon} size={small ? 8 : 10} color={ink} />
        <Text
          style={{
            color: ink,
            fontSize: small ? 8.5 : 10,
            fontWeight: gold ? "600" : "500",
            letterSpacing: 0.1,
          }}
        >
          {text}
        </Text>
      </View>
      {gold && (
        <View
          pointerEvents="none"
          style={[s.buttonShine, { borderColor: "#fff4d4a0" }]}
        />
      )}
    </Pressable>
  );
}
function OliveSprig({
  color,
  mirrored = false,
}: {
  color: string;
  mirrored?: boolean;
}) {
  return (
    <View
      style={{
        width: 19,
        height: 14,
        transform: [{ scaleX: mirrored ? -1 : 1 }],
      }}
    >
      <View
        style={{
          position: "absolute",
          left: 1,
          top: 8,
          width: 18,
          height: 0.5,
          backgroundColor: color,
          transform: [{ rotate: "-22deg" }],
        }}
      />
      {[0, 1, 2].map((i) => (
        <View key={i}>
          <View
            style={{
              position: "absolute",
              left: 3 + i * 4,
              top: 3 - i * 0.9,
              width: 5,
              height: 2.5,
              borderRadius: 5,
              backgroundColor: color,
              transform: [{ rotate: "42deg" }],
            }}
          />
          <View
            style={{
              position: "absolute",
              left: 6 + i * 4,
              top: 8 - i * 1.2,
              width: 4.5,
              height: 2.3,
              borderRadius: 5,
              backgroundColor: color,
              transform: [{ rotate: "-48deg" }],
            }}
          />
        </View>
      ))}
    </View>
  );
}
export default function MainMenu({
  width,
  height,
  save,
  ready,
  time,
  reducedMotion,
  onStart,
  onContinue,
  onImport,
  onSettings,
  onCredits,
  onExport,
}: {
  width: number;
  height: number;
  save: Save | null;
  ready: boolean;
  time: SharedValue<number>;
  reducedMotion: boolean;
  onStart: () => void;
  onContinue: () => void;
  onImport: () => void;
  onSettings: () => void;
  onCredits: () => void;
  onExport: () => void;
}) {
  const themeId = menuThemeForSave(save),
    theme = menuThemes[themeId],
    column = themeId === "beginning" ? 0 : themeId === "middle" ? 1 : 2;
  const art = themeId === "middle" ? formalArt : originalArt;
  const heroSource =
    themeId === "middle" ? formalHeroSource : originalHeroSource;
  const portrait = height > width,
    logicalHeight = height / (width / 480),
    paperScale = portrait
      ? Math.min(432 / 210, (logicalHeight - 140) / 246)
      : 1,
    paperTop = portrait ? logicalHeight - 246 * paperScale - 24 : 12;
  const heroScale = portrait
    ? Math.min(1.8, Math.max(0.35, (paperTop - 80) / 207))
    : 1;
  const compactPortrait = portrait && logicalHeight < 860;
  const heroHeight = 194,
    scale = heroHeight / art.referenceHeight;
  const heroStyle = useAnimatedStyle(() => {
    const blink = !reducedMotion && time.value % 5.2 > 5.02;
    const f = art.frames[column + (blink ? 3 : 0)];
    return {
      left: (compactPortrait ? 50 : 76) - f.anchorX * scale,
      top: 207 - f.anchorY * scale,
      transform: [
        { translateY: reducedMotion ? 0 : Math.sin(time.value * 1.8) * 0.4 },
      ],
    };
  });
  const moteStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: reducedMotion ? 0 : Math.sin(time.value * 0.8) * 2 },
    ],
    opacity: reducedMotion ? 0.3 : 0.3 + Math.sin(time.value * 0.7) * 0.12,
  }));
  return (
    <View style={{ width, height }} accessibilityLabel={`Menú · ${theme.name}`}>
      <View
        style={[
          s.stage,
          {
            height: portrait ? logicalHeight : 270,
            transform: [{ scale: width / 480 }],
          },
        ]}
      >
        <Image
          source={backgrounds[themeId]}
          style={[s.backdrop, portrait && { height: logicalHeight }]}
          resizeMode="cover"
          accessibilityLabel={theme.description}
        />
        <View pointerEvents="none" style={s.vignetteLeft} />
        <View pointerEvents="none" style={s.vignetteBottom} />
        <View
          pointerEvents="none"
          style={[
            s.caption,
            portrait && {
              left: 26,
              top: 28,
              display: logicalHeight < 860 ? "none" : "flex",
              transform: [{ scale: 1.5 }],
              transformOrigin: "top left",
            },
          ]}
        >
          <View
            style={{
              width: 15,
              height: 1,
              backgroundColor: "#efcc91",
              marginBottom: 5,
            }}
          />
          <Text style={s.captionEyebrow}>{theme.eyebrow}</Text>
          <Text style={s.captionTitle}>{theme.caption}</Text>
        </View>
        <View
          pointerEvents="none"
          style={[s.groundShadow, portrait && { display: "none" }]}
        />
        <View
          style={[
            s.heroClip,
            portrait &&
              (compactPortrait
                ? {
                    left: 190,
                    top: Math.max(8, (paperTop - 98) / 2),
                    width: 100,
                    height: 90,
                    borderRadius: 50,
                    backgroundColor: theme.paper,
                    borderWidth: 0.5,
                    borderColor: theme.gold,
                  }
                : {
                    left: (480 - 152 * heroScale) / 2,
                    top: paperTop - 207 * heroScale + 2,
                    transform: [{ scale: heroScale }],
                    transformOrigin: "top left",
                  }),
          ]}
          pointerEvents="none"
          accessibilityRole="image"
          accessibilityLabel={`La precursora · ${theme.outfit}`}
        >
          <Animated.Image
            source={heroSource}
            resizeMode="stretch"
            style={[
              {
                position: "absolute",
                width: art.width * scale,
                height: art.height * scale,
              },
              Platform.OS === "web"
                ? ({ imageRendering: "pixelated" } as any)
                : {},
              heroStyle,
            ]}
          />
        </View>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, moteStyle]}
        >
          {[
            { x: 44, y: 139 },
            { x: 196, y: 183 },
            { x: 205, y: 68 },
            { x: 59, y: 216 },
            { x: 217, y: 225 },
            { x: 173, y: 102 },
          ].map((p, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: i % 2 ? 1 : 1.5,
                height: i % 2 ? 1 : 1.5,
                backgroundColor: "#fff3ce",
                borderRadius: 2,
              }}
            />
          ))}
        </Animated.View>
        <View
          style={[
            s.paper,
            portrait && {
              left: (480 - 210 * paperScale) / 2,
              top: paperTop,
              transform: [{ scale: paperScale }],
              transformOrigin: "top left",
            },
            { backgroundColor: theme.paper, borderColor: theme.gold },
          ]}
        >
          <View
            pointerEvents="none"
            style={[s.innerBorder, { borderColor: theme.gold + "55" }]}
          />
          <View pointerEvents="none" style={s.emblem}>
            <OliveSprig color={theme.accent} />
            <UIIcon name="book" size={19} color={theme.ink} />
            <OliveSprig color={theme.accent} mirrored />
          </View>
          <Text style={[s.prefix, { color: theme.ink }]}>El camino de una</Text>
          <Text style={[s.title, { color: theme.ink }]}>Precursora</Text>
          <Text style={[s.subtitle, { color: theme.muted }]}>
            Una aventura de fe, aprendizaje{"\n"}y perseverancia
          </Text>
          <View pointerEvents="none" style={s.divider}>
            <View style={[s.line, { backgroundColor: theme.gold + "66" }]} />
            <View style={[s.diamond, { backgroundColor: theme.gold }]} />
            <View style={[s.line, { backgroundColor: theme.gold + "66" }]} />
          </View>
          <View style={s.actions}>
            <MenuAction
              label="▶ Comenzar aventura"
              text="Comenzar aventura"
              icon="play"
              gold
              disabled={!ready}
              onPress={onStart}
              ink={theme.ink}
              accent={theme.gold}
            />
            <MenuAction
              label="▤ Continuar"
              text="Continuar"
              icon="book"
              disabled={!save}
              onPress={onContinue}
              ink={theme.ink}
              accent={theme.gold}
            />
            {Platform.OS === "web" && (
              <MenuAction
                label="↥ Cargar partida"
                text="Cargar partida"
                icon="upload"
                small
                onPress={onImport}
                ink={theme.ink}
                accent={theme.gold}
              />
            )}
            <View style={s.utilityRow}>
              <View style={{ flex: 1 }}>
                <MenuAction
                  label="⚙ Ajustes"
                  text="Ajustes"
                  icon="settings"
                  small
                  onPress={onSettings}
                  ink={theme.ink}
                  accent={theme.gold}
                />
              </View>
              <View style={{ flex: 1 }}>
                <MenuAction
                  label="ⓘ Créditos"
                  text="Créditos"
                  icon="info"
                  small
                  onPress={onCredits}
                  ink={theme.ink}
                  accent={theme.gold}
                />
              </View>
            </View>
          </View>
          <View style={s.progress}>
            <View style={s.progressDots}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={{
                    height: 2,
                    width: i === column ? 16 : 7,
                    backgroundColor:
                      i <= column ? theme.gold : theme.gold + "40",
                    borderRadius: 2,
                  }}
                />
              ))}
            </View>
            <Text style={[s.progressText, { color: theme.muted }]}>
              {save
                ? `CAPÍTULO I · ${save.missions.completedMissions.length}/16 ESCENAS`
                : "EL BOSQUE DE LAS DUDAS"}
            </Text>
          </View>
        </View>
        {save && Platform.OS === "web" && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Descargar partida"
            onPress={onExport}
            hitSlop={4}
            style={({ hovered, pressed }: any) => [
              s.export,
              portrait && {
                left: 26,
                top: logicalHeight >= 860 ? 100 : Math.max(8, paperTop - 40),
                bottom: undefined,
                transform: [{ scale: 2 }],
                transformOrigin: "top left",
              },
              {
                backgroundColor: hovered || pressed ? "#253b3aee" : "#253b3ab8",
              },
            ]}
          >
            <UIIcon name="download" size={7} color="#efdfbd" />
            <Text style={s.exportText}>Descargar partida</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  stage: {
    width: 480,
    height: 270,
    position: "absolute",
    top: 0,
    left: 0,
    transformOrigin: "top left",
    overflow: "hidden",
    backgroundColor: "#343440",
  },
  backdrop: { ...StyleSheet.absoluteFillObject, width: 480, height: 270 },
  vignetteLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 7,
    backgroundColor: "#28313312",
  },
  vignetteBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#26313224",
  },
  caption: { position: "absolute", left: 19, top: 20, width: 209 },
  captionEyebrow: {
    fontFamily: "Pixelify",
    fontSize: 5.8,
    letterSpacing: 1.1,
    color: "#ffe6b9",
    textShadowColor: "#1f3535",
    textShadowRadius: 4,
  },
  captionTitle: {
    fontFamily: "Cormorant",
    fontSize: 14,
    color: "#fff4dd",
    lineHeight: 17,
    textShadowColor: "#233b37",
    textShadowRadius: 5,
  },
  groundShadow: {
    position: "absolute",
    left: 76,
    top: 243,
    width: 94,
    height: 5,
    backgroundColor: "#263a3b24",
    borderRadius: 60,
  },
  heroClip: {
    position: "absolute",
    left: 47,
    top: 38,
    width: 152,
    height: 207,
    overflow: "hidden",
  },
  paper: {
    position: "absolute",
    left: 253,
    top: 12,
    width: 210,
    height: 246,
    borderWidth: 0.6,
    borderRadius: 3,
    boxShadow: "0 5px 18px #18262830",
  },
  innerBorder: {
    position: "absolute",
    left: 3,
    right: 3,
    top: 3,
    bottom: 3,
    borderWidth: 0.4,
    borderRadius: 1,
  },
  emblem: {
    position: "absolute",
    top: 8,
    left: 62,
    width: 86,
    height: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
  },
  prefix: {
    position: "absolute",
    top: 28,
    left: 8,
    right: 8,
    textAlign: "center",
    fontFamily: "Cormorant",
    fontSize: 18,
    lineHeight: 22,
  },
  title: {
    position: "absolute",
    top: 45,
    left: 4,
    right: 4,
    fontFamily: "Cormorant",
    fontWeight: "600",
    fontSize: 38,
    lineHeight: 43,
    textAlign: "center",
    letterSpacing: -1.5,
  },
  subtitle: {
    position: "absolute",
    top: 88,
    left: 12,
    right: 12,
    textAlign: "center",
    fontSize: 7.4,
    lineHeight: 10.4,
    letterSpacing: 0.1,
  },
  divider: {
    position: "absolute",
    top: 114,
    left: 30,
    right: 30,
    height: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  line: { flex: 1, height: 0.4 },
  diamond: { width: 2.5, height: 2.5, transform: [{ rotate: "45deg" }] },
  actions: { position: "absolute", top: 120, left: 16, right: 16, gap: 5 },
  button: {
    height: 25,
    borderWidth: 0.5,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    height: 28,
    borderBottomWidth: 1.5,
    boxShadow: "0 2px 4px #78604415",
  },
  small: { height: 20 },
  buttonShine: {
    position: "absolute",
    left: 1.5,
    right: 1.5,
    top: 1.5,
    bottom: 1.5,
    borderWidth: 0.4,
    borderRadius: 1,
  },
  utilityRow: { flexDirection: "row", gap: 6 },
  progress: {
    position: "absolute",
    bottom: 4,
    left: 10,
    right: 10,
    alignItems: "center",
    gap: 2,
  },
  progressDots: { flexDirection: "row", gap: 3 },
  progressText: {
    fontFamily: "Pixelify",
    fontSize: 4.5,
    lineHeight: 6.5,
    letterSpacing: 0.7,
  },
  export: {
    position: "absolute",
    left: 19,
    bottom: 9,
    paddingHorizontal: 7,
    height: 14,
    borderRadius: 2,
    borderWidth: 0.4,
    borderColor: "#e0ca9466",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  exportText: { color: "#f3e4c5", fontSize: 6.2, letterSpacing: 0.2 },
});
