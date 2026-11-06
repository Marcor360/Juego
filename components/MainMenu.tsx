import Illustration from "./Illustration";
import MenuMotes from "./MenuMotes";
import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { menuThemeForSave, menuThemes } from "../game/menu/themes";
import { menuJourney } from "../game/menu/journey";
import type { Save } from "../game/save/schema";
import UIIcon, { type UIIconName } from "./UIIcon";
import figures from "../game/rendering/menu-figures.json";

const backgrounds = {
  beginning: require("../assets/runtime/menu-beginning.webp"),
  middle: require("../assets/runtime/menu-middle.webp"),
  ending: require("../assets/runtime/menu-ending.webp"),
};
const figureSources={beginning:require("../assets/runtime/menu-figure-beginning.png"),middle:require("../assets/runtime/menu-figure-middle.png"),ending:require("../assets/runtime/menu-figure-ending.png")};

function MenuAction({ label, text, icon, onPress, disabled = false, primary = false, ink, accent, compact = false, hint }: {
  label: string; text: string; icon?: UIIconName; onPress: () => void;
  disabled?: boolean; primary?: boolean; ink: string; accent: string;
  compact?: boolean; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed, hovered }: any) => [
        s.button,
        { borderColor: accent + "88", backgroundColor: primary ? "#ead09d" : "#fffdf4b8" },
        primary && s.primary,
        disabled && { opacity: .5 },
        (hovered || pressed) && !disabled && { backgroundColor: primary ? "#f7dfb5" : "#fffdf5", transform: [{ translateY: pressed ? 1 : 0 }] },
        focused && { borderColor: ink, boxShadow: `0 0 0 3px ${accent}88` },
      ]}
    >
      <View pointerEvents="none" style={s.buttonContent}>
        {icon && <UIIcon name={icon} size={compact ? 15 : 18} color={ink} />}
        <Text style={{ color: ink, fontSize: compact ? 13 : 15, fontWeight: primary ? "700" : "500", textAlign: "center", flexShrink: 1 }}>{text}</Text>
      </View>
    </Pressable>
  );
}

export default function MainMenu({ width, height, save, ready, transferring = false, time, reducedMotion, onStart, onContinue, onImport, onSettings, onCredits, onExport, onHelp }: {
  width: number; height: number; save: Save | null; ready: boolean; transferring?: boolean;
  time: SharedValue<number>; reducedMotion: boolean;
  onStart: () => void; onContinue: () => void; onImport: () => void;
  onSettings: () => void; onCredits: () => void; onExport: () => void; onHelp: () => void;
}) {
  const themeId = menuThemeForSave(save);
  const theme = menuThemes[themeId];
  const journey = menuJourney(save);
  const column = themeId === "beginning" ? 0 : themeId === "middle" ? 1 : 2;
  const art = figures[themeId];
  const portrait = height > width;
  const compact = !portrait && height < 500;
  const padding = portrait ? 16 : compact ? 12 : 28;
  const cardWidth = portrait ? Math.min(width - padding * 2, 480) : Math.min(compact ? width * .54 : width * .45, 510);
  const sceneWidth = portrait ? width - padding * 2 : width - cardWidth - padding * 3;
  const sceneHeight = portrait ? Math.min(240, Math.max(150, height * .24)) : height - padding * 2;
  const heroHeight = portrait ? Math.min(sceneHeight * 1.85, 440) : Math.min(sceneHeight * .79, 580);
  const heroWidth = portrait ? Math.min(sceneWidth * .43, 160) : heroHeight * .7;
  const scale = heroHeight / art.referenceHeight;
  const heroCropStyle = useAnimatedStyle(() => {
    const blink=!reducedMotion && time.value%5.2>5.02;
    const frame=art.frames[blink?1:0];
    return {
      left:heroWidth/2+(frame.x-frame.anchorX)*scale,
      top:portrait?8:heroHeight+(frame.y-frame.anchorY)*scale,
      width:frame.width*scale,height:frame.height*scale,
      transform:[{translateY:reducedMotion?0:Math.sin(time.value*1.8)*.6}],
    };
  });
  const heroStyle = useAnimatedStyle(() => {
    const frame=art.frames[!reducedMotion && time.value%5.2>5.02?1:0];
    return {left:-frame.x*scale,top:-frame.y*scale};
  });
  const backdropStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1.025 }, { translateX: reducedMotion ? 0 : Math.sin(time.value * .07) * 3 }],
  }));
  const actionProps = { ink: theme.ink, accent: theme.gold, compact };

  return (
    <View style={{ width, height }} accessibilityLabel={`Menú · ${theme.name}`}>
      <Animated.Image source={backgrounds[themeId]} resizeMode="cover" style={[StyleSheet.absoluteFill, { width, height }, backdropStyle]} accessibilityLabel={theme.description} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#162c3029" }]} />
      <MenuMotes width={width} height={portrait?sceneHeight:height} time={time} reduced={reducedMotion} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding, flexDirection: portrait ? "column" : "row", alignItems: "center", justifyContent: "center", gap: padding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: sceneWidth, height: sceneHeight }}>
          {!portrait && <View pointerEvents="none" style={{position:"absolute",left:0,bottom:8,opacity:.9}}><Illustration pack="decor" frame={7} size={compact?40:60} /></View>}
          <View pointerEvents="none" style={{ position: "absolute", top: portrait ? 6 : 14, left: 0, width: portrait ? sceneWidth * .44 : sceneWidth }}>
            <Text style={s.eyebrow}>{theme.eyebrow}</Text>
            <Text style={[s.caption, { fontSize: compact ? 21 : portrait ? 23 : 31 }]}>{theme.caption}</Text>
          </View>
          <View
            pointerEvents="none"
            accessibilityRole="image"
            accessibilityLabel={`La precursora · ${theme.outfit}`}
            style={{ position: "absolute", bottom: portrait ? Math.max(8, (sceneHeight - heroWidth) / 2) : 8, left: portrait ? sceneWidth - heroWidth - 8 : (sceneWidth - heroWidth) / 2, width: heroWidth, height: portrait ? heroWidth : heroHeight + 10, overflow: "hidden", ...(portrait ? { borderRadius: heroWidth / 2, borderWidth: 1, borderColor: theme.gold, backgroundColor: theme.paper, boxShadow: "0 6px 22px #14272930" } : {}) }}
          >
            {!portrait && <View style={{ position: "absolute", bottom: 5, left: heroWidth * .26, width: heroWidth * .48, height: 7, borderRadius: 100, backgroundColor: "#25382b33" }} />}
            <Animated.View style={[{position:"absolute",overflow:"hidden"},heroCropStyle]}>
            <Animated.Image
              accessible={false}
              source={figureSources[themeId]}
              resizeMode="stretch"
              style={[{ position: "absolute", width: art.width * scale, height: art.height * scale }, Platform.OS === "web" ? ({ imageRendering: "pixelated" } as any) : {}, heroStyle]}
            />
            </Animated.View>
          </View>
        </View>
        <View style={[s.paper, { width: cardWidth, backgroundColor: theme.paper, borderColor: theme.gold, padding: compact ? 12 : portrait ? 18 : 24, gap: compact ? 10 : portrait ? 14 : 18 }]}>
          <View style={{ alignItems: "center" }}>
            {!compact && <View pointerEvents="none" style={s.emblem}><View style={[s.rule, { backgroundColor: theme.gold }]} /><Illustration pack="menuEmblems" frame={column} size={portrait?36:40} /><View style={[s.rule, { backgroundColor: theme.gold }]} /></View>}
            <Text style={{ fontFamily: "Cormorant", color: theme.ink, fontSize: compact ? 18 : portrait ? 23 : 25, lineHeight: compact ? 20 : portrait ? 26 : 29 }}>El camino de una</Text>
            <Text accessibilityRole="header" style={{ fontFamily: "Cormorant", color: theme.ink, fontWeight: "600", fontSize: compact ? 37 : portrait ? 46 : 54, lineHeight: compact ? 39 : portrait ? 50 : 58, letterSpacing: -1 }}>Precursora</Text>
            {!compact && <Text style={{ color: theme.muted, fontSize: 13, lineHeight: 18, textAlign: "center", marginTop: 5 }}>Una aventura de fe, aprendizaje y perseverancia</Text>}
          </View>
          {save ? (
            <View style={[s.journey, { borderColor: theme.gold + "55", padding: compact ? 8 : 12, gap: compact ? 4 : 7 }]}>
              <View style={s.between}>
                <Text style={{ color: theme.ink, fontSize: compact ? 12 : 13, fontWeight: "700" }}>{journey.location}</Text>
                <Text style={{ color: theme.muted, fontSize: 12 }}>{journey.completed}/{journey.total}</Text>
              </View>
              {!compact && <Text style={{ color: theme.muted, fontSize: 13, lineHeight: 18 }}>{save.challenge ? `Reto en curso · Paso ${save.challenge.history.length + 1}` : `${journey.complete ? "Capítulo completado" : "Próximo paso"} · ${journey.next}`}</Text>}
              <View accessibilityRole="progressbar" accessibilityLabel={`Progreso del capítulo ${journey.chapter}`} accessibilityValue={{ min: 0, max: journey.total, now: journey.completed, text: `${journey.percent}% completado` }} style={s.track}>
                <View style={{ height: 4, width: `${journey.percent}%`, backgroundColor: theme.accent, borderRadius: 4 }} />
              </View>
            </View>
          ) : !compact && <Text style={{ color: theme.muted, fontSize: 12, textAlign: "center" }}>CAPÍTULO I · EL BOSQUE DE LAS DUDAS</Text>}
          <View style={{ gap: compact ? 6 : 9 }}>
            <MenuAction {...actionProps} primary label={save ? journey.complete ? "Diario de capítulos" : "▤ Continuar" : "▶ Comenzar aventura"} text={!ready ? "Preparando tu viaje…" : save ? journey.complete ? "Ver mis capítulos" : "Continuar mi camino" : "Comenzar aventura"} icon={save ? "book" : "play"} disabled={!ready} onPress={save ? journey.complete ? onStart : onContinue : onStart} hint={save ? journey.complete ? "Explorar tus capítulos y la biblioteca" : `Retomar en ${journey.location}` : "Comenzar el primer capítulo"} />
            {save && <MenuAction {...actionProps} label={journey.complete ? "▤ Continuar" : "Diario de capítulos"} text={journey.complete ? journey.chapter === 2 ? "Volver a la biblioteca" : "Volver al bosque" : "Diario de capítulos"} icon="book" disabled={!ready} onPress={journey.complete ? onContinue : onStart} hint={journey.complete ? "Explorar de nuevo el bosque completado" : "Elegir un capítulo o visitar la biblioteca"} />}
            {<View style={s.row}>
              <View style={s.flex}><MenuAction {...actionProps} label="↥ Cargar partida" text="Cargar partida" icon="upload" disabled={!ready || transferring} onPress={onImport} /></View>
              {save && <View style={s.flex}><MenuAction {...actionProps} label={Platform.OS === "web" ? "Descargar partida" : "Compartir copia"} text={Platform.OS === "web" ? "Descargar" : "Guardar copia"} icon="download" disabled={!ready || transferring} onPress={onExport} /></View>}
            </View>}
            <View style={s.row}>
              <View style={s.flex}><MenuAction {...actionProps} label="⚙ Ajustes" text="Ajustes" icon={compact ? undefined : "settings"} disabled={!ready} onPress={onSettings} /></View>
              <View style={s.flex}><MenuAction {...actionProps} label="ⓘ Créditos" text="Créditos" icon={compact ? undefined : "info"} onPress={onCredits} /></View>
              {compact && <View style={s.flex}><MenuAction {...actionProps} label="Cómo jugar" text="Ayuda" onPress={onHelp} /></View>}
            </View>
            {!compact && <MenuAction {...actionProps} label="Cómo jugar" text="Cómo jugar" icon="info" onPress={onHelp} />}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  paper: { borderWidth: 1, borderRadius: 18, boxShadow: "0 12px 40px #14272945" },
  button: { minHeight: 44, borderWidth: 1, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 8, justifyContent: "center" },
  primary: { minHeight: 48, borderBottomWidth: 3, boxShadow: "0 3px 10px #71593622" },
  buttonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  row: { flexDirection: "row", gap: 8 },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  eyebrow: { fontFamily: "Pixelify", fontSize: 10, lineHeight: 16, letterSpacing: 1, color: "#ffe5b5", textShadowColor: "#17322e", textShadowRadius: 5 },
  caption: { fontFamily: "Cormorant", color: "#fff4dc", lineHeight: 33, marginTop: 7, textShadowColor: "#17322e", textShadowRadius: 6 },
  emblem: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 9 },
  rule: { width: 27, height: 1, opacity: .65 },
  journey: { borderWidth: 1, borderRadius: 10, backgroundColor: "#fffaf455" },
  track: { height: 4, backgroundColor: "#79765d24", borderRadius: 4, overflow: "hidden" },
});
