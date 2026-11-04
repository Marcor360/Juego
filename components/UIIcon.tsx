import { View, Text } from "react-native";
export type UIIconName =
  | "play"
  | "left"
  | "book"
  | "upload"
  | "download"
  | "settings"
  | "info"
  | "bag"
  | "pause";
export default function UIIcon({
  name,
  size = 18,
  color = "#654957",
}: {
  name: UIIconName;
  size?: number;
  color?: string;
}) {
  const unit = size / 20;
  return (
    <View
      accessible={false}
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: unit }],
        }}
      >
        {(name === "play" || name === "left") && (
          <View
            style={{
              width: 0,
              height: 0,
              borderTopWidth: 7,
              borderBottomWidth: 7,
              borderTopColor: "transparent",
              borderBottomColor: "transparent",
              ...(name === "play"
                ? { borderLeftWidth: 11, borderLeftColor: color, marginLeft: 3 }
                : {
                    borderRightWidth: 11,
                    borderRightColor: color,
                    marginRight: 3,
                  }),
            }}
          />
        )}
        {name === "book" && (
          <View style={{ flexDirection: "row", gap: 1 }}>
            {[0, 1].map((i) => (
              <View
                key={i}
                style={{
                  width: 8,
                  height: 13,
                  borderWidth: 1.5,
                  borderColor: color,
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                  transform: [{ rotate: i ? "4deg" : "-4deg" }],
                }}
              />
            ))}
          </View>
        )}
        {name === "settings" && (
          <>
            <View
              style={{
                width: 14,
                height: 14,
                borderWidth: 2,
                borderColor: color,
                borderRadius: 7,
              }}
            />
            {Array.from({ length: 8 }, (_, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  width: 4,
                  height: 5,
                  backgroundColor: color,
                  left: 8,
                  top: 0,
                  transformOrigin: "2px 10px",
                  transform: [{ rotate: `${i * 45}deg` }],
                }}
              />
            ))}
            <View
              style={{
                position: "absolute",
                width: 4,
                height: 4,
                backgroundColor: color,
                borderRadius: 2,
              }}
            />
          </>
        )}
        {name === "info" && (
          <View
            style={{
              width: 17,
              height: 17,
              borderWidth: 1.5,
              borderColor: color,
              borderRadius: 9,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ fontSize: 12, lineHeight: 14, fontWeight: "700", color }}
            >
              i
            </Text>
          </View>
        )}
        {(name === "upload" || name === "download") && (
          <>
            <View
              style={{
                position: "absolute",
                bottom: 1,
                width: 16,
                height: 6,
                borderWidth: 1.5,
                borderTopWidth: 0,
                borderColor: color,
              }}
            />
            <View
              style={{
                width: 2,
                height: 12,
                backgroundColor: color,
                position: "absolute",
                top: 1,
              }}
            />
            <View
              style={{
                width: 7,
                height: 7,
                borderTopWidth: 2,
                borderLeftWidth: 2,
                borderColor: color,
                transform: [
                  { rotate: name === "download" ? "225deg" : "45deg" },
                ],
                position: "absolute",
                top: name === "download" ? 5 : 1,
              }}
            />
          </>
        )}
        {name === "bag" && (
          <>
            <View
              style={{
                position: "absolute",
                top: 2,
                width: 8,
                height: 6,
                borderWidth: 1.5,
                borderColor: color,
                borderRadius: 2,
              }}
            />
            <View
              style={{
                width: 16,
                height: 12,
                marginTop: 4,
                borderWidth: 1.5,
                borderColor: color,
                borderRadius: 2,
              }}
            />
          </>
        )}
        {name === "pause" && (
          <View style={{ flexDirection: "row", gap: 4 }}>
            {[0, 1].map((i) => (
              <View
                key={i}
                style={{ width: 4, height: 13, backgroundColor: color }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
