import {
  Circle,
  Group,
  Path,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";
export type PickupVisual = { x: number; y: number; at: number };
export function SoftGlow({
  x,
  y,
  r = 15,
  color = "#ffe3a8",
  opacity = 0.5,
}: {
  x: number;
  y: number;
  r?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <Circle cx={x} cy={y} r={r} opacity={opacity}>
      <RadialGradient
        c={vec(x, y)}
        r={r}
        colors={[`${color}99`, `${color}22`, `${color}00`]}
      />
    </Circle>
  );
}
function Spark({
  i,
  time,
  origin,
  reduced,
}: {
  i: number;
  time: SharedValue<number>;
  origin: SharedValue<PickupVisual>;
  reduced: boolean;
}) {
  const alpha = useDerivedValue(() => {
    const age = time.value - origin.value.at;
    return age >= 0 && age < 0.95 ? (1 - age / 0.95) * 0.9 : 0;
  });
  const transform = useDerivedValue(() => {
    const age = Math.min(1, Math.max(0, time.value - origin.value.at));
    const a = i * 2.399;
    const r = reduced ? 5 : age * 28;
    return [
      { translateX: origin.value.x + Math.cos(a) * r },
      { translateY: origin.value.y + Math.sin(a) * r - age * 14 },
      { scale: Math.max(0.2, 1 - age * 0.8) },
    ];
  });
  return (
    <Group opacity={alpha} transform={transform}>
      <Path
        path="M 0 -3 L .8 -.8 L 3 0 L .8 .8 L 0 3 L -.8 .8 L -3 0 L -.8 -.8 Z"
        color={i % 2 ? "#fff2be" : "#e5c6ed"}
      />
    </Group>
  );
}
export function PickupBurst({
  time,
  origin,
  reduced,
}: {
  time: SharedValue<number>;
  origin: SharedValue<PickupVisual>;
  reduced: boolean;
}) {
  return (
    <>
      {Array.from({ length: reduced ? 4 : 11 }, (_, i) => (
        <Spark key={i} i={i} time={time} origin={origin} reduced={reduced} />
      ))}
    </>
  );
}
