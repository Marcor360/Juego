import React from "react";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import manifest from "../../game/chapter2/art/manifest.json";
export const theme = {
  ink: "#44364e",
  muted: "#76677d",
  paper: "#fbf4e7",
  gold: "#bb8d4e",
  plum: "#74516f",
  green: "#36575a",
};
export const s = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#15192b99",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },
  paper: {
    backgroundColor: theme.paper,
    borderWidth: 2,
    borderColor: "#c8a66f",
    borderRadius: 16,
    padding: 20,
    width: "94%",
    maxWidth: 920,
    maxHeight: "94%",
    shadowColor: "#20162a",
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  title: { fontSize: 23, fontWeight: "700", color: theme.ink },
  body: { fontSize: 17, lineHeight: 26, color: theme.ink },
  muted: { fontSize: 13, lineHeight: 20, color: theme.muted },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  button: {
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b99b73",
    backgroundColor: "#fffaf1",
    minHeight: 44,
    justifyContent: "center",
  },
  buttonText: { fontSize: 15, fontWeight: "600", color: theme.ink },
  selected: { backgroundColor: "#d9d1e7", borderColor: theme.plum },
  primary: { backgroundColor: "#ecd19b", borderColor: "#a98147" },
  gap: { gap: 14 },
});
export function Button({
  label,
  onPress,
  selected = false,
  primary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        selected && s.selected,
        primary && s.primary,
        { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={s.buttonText}>{label}</Text>
    </Pressable>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <View style={s.overlay}>
      <View style={s.paper}>
        <ScrollView
          contentContainerStyle={s.gap}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <Text style={s.title}>{title}</Text>
            <Button label="Cerrar ×" onPress={onClose} />
          </View>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
const portraits: Record<string, number> = {
  hero: 0,
  happy: 1,
  thinking: 2,
  librarian: 3,
  assistant: 4,
  visitor: 5,
  student: 6,
  researcher: 7,
  traveler: 8,
};
export const names: Record<string, string> = {
  hero: "La precursora",
  librarian: "La bibliotecaria",
  assistant: "El auxiliar",
  visitor: "La visitante",
  student: "La estudiante",
  researcher: "El investigador",
  traveler: "El viajero",
  narrator: "Un momento en el camino",
  citizen_0: "Una lectora",
  citizen_1: "Un visitante",
  citizen_2: "Una vecina",
  citizen_3: "Una investigadora",
};
export function Portrait({ role, size = 72 }: { role: string; size?: number }) {
  const ambient = role.startsWith("citizen_"),
    atlas = ambient ? manifest.citizens : manifest.portraits;
  const sourceFrame =
    atlas.frames[ambient ? Number(role.slice(8)) : (portraits[role] ?? 0)];
  const f = ambient
      ? { ...sourceFrame, height: sourceFrame.width }
      : sourceFrame,
    k = size / Math.max(f.width, f.height);
  const source = ambient
    ? require("../../assets/chapter2/characters/citizens.png")
    : require("../../assets/chapter2/portraits/portraits.png");
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#e9dfd2",
        borderColor: "#bda07a",
        borderWidth: 1,
      }}
    >
      <Image
        source={source}
        style={{
          position: "absolute",
          width: atlas.width * k,
          height: atlas.height * k,
          left: -f.x * k + (size - f.width * k) / 2,
          top: -f.y * k,
        }}
        resizeMode="stretch"
      />
    </View>
  );
}
