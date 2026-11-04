import { useEffect } from "react";
import {
  Circle,
  Group,
  Path,
  Rect,
  LinearGradient,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
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
      <Circle cx={0} cy={0} r={1.5} color={i % 2 ? "#fff2be" : "#e5c6ed"} />
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
function Wisp({
  i,
  x,
  time,
  reduced,
}: {
  i: number;
  x: number;
  time: SharedValue<number>;
  reduced: boolean;
}) {
  const transform = useDerivedValue(() => [
    { translateX: reduced ? 0 : Math.sin(time.value * 0.35 + i * 1.7) * 9 },
    { translateY: reduced ? 0 : Math.sin(time.value * 0.21 + i) * 7 },
  ]);
  const cy = 45 + i * 16,
    r = 23 + (i % 3) * 6,
    cx = x + Math.sin(i * 2.1) * 13;
  return (
    <Group transform={transform}>
      <Circle cx={cx} cy={cy} r={r} opacity={0.26}>
        <RadialGradient
          c={vec(cx, cy)}
          r={r}
          colors={["#d9e5efbb", "#b9c8df44", "#b9c8df00"]}
        />
      </Circle>
    </Group>
  );
}
export function FogGate({
  x,
  locked,
  time,
  reduced,
}: {
  x: number;
  locked: boolean;
  time: SharedValue<number>;
  reduced: boolean;
}) {
  const opacity = useSharedValue(locked ? 1 : 0);
  useEffect(() => {
    opacity.value = withTiming(locked ? 1 : 0, {
      duration: reduced ? 0 : 1600,
    });
  }, [locked, reduced]);
  return (
    <Group opacity={opacity}>
      <Rect x={x - 25} y={0} width={66} height={226}>
        <LinearGradient
          start={vec(x - 25, 110)}
          end={vec(x + 41, 110)}
          colors={[
            "#b9cadb00",
            "#b9cadb55",
            "#d4e4ef88",
            "#b9cadb44",
            "#b9cadb00",
          ]}
        />
      </Rect>
      {Array.from({ length: 11 }, (_, i) => (
        <Wisp key={i} i={i} x={x + 8} time={time} reduced={reduced} />
      ))}
      <Path
        path={`M ${x + 4} 205 Q ${x - 18} 178 ${x + 7} 152 Q ${x + 30} 128 ${x + 8} 101 Q ${x - 12} 74 ${x + 7} 56`}
        color="#d3c8ef"
        style="stroke"
        strokeWidth={0.6}
        opacity={0.3}
      />
    </Group>
  );
}
function Mote({
  i,
  time,
  reduced,
}: {
  i: number;
  time: SharedValue<number>;
  reduced: boolean;
}) {
  const transform = useDerivedValue(() => [
    { translateX: reduced ? 0 : Math.sin(time.value * 0.22 + i) * 6 },
    { translateY: reduced ? 0 : Math.sin(time.value * 0.31 + i * 1.9) * 5 },
  ]);
  const alpha = useDerivedValue(() =>
    reduced ? 0.5 : 0.25 + (Math.sin(time.value * 1.4 + i) + 1) * 0.22,
  );
  const x = (i * 79) % 480,
    y = 65 + ((i * 37) % 145);
  return (
    <Group transform={transform} opacity={alpha}>
      <Circle cx={x} cy={y} r={i % 3 === 0 ? 0.9 : 0.5} color="#ffe9b3" />
      {i % 4 === 0 && <SoftGlow x={x} y={y} r={5} opacity={0.4} />}
    </Group>
  );
}
export function AmbientMotes({
  time,
  reduced,
}: {
  time: SharedValue<number>;
  reduced: boolean;
}) {
  return (
    <>
      {Array.from({ length: reduced ? 8 : 22 }, (_, i) => (
        <Mote key={i} i={i} time={time} reduced={reduced} />
      ))}
    </>
  );
}
