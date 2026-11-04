import art from "../game/rendering/art.json";
import { Asset } from "expo-asset";
import {
  Canvas,
  Atlas,
  Skia,
  Group,
  Rect,
  Image,
  Oval,
  Path,
  Circle,
  useImage,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  useAnimatedReaction,
  type SharedValue,
} from "react-native-reanimated";
import { objects, platforms, WIDTH } from "../game/levels/forest";
import type { Progress } from "../game/missions/progress";
import type { Speaker } from "../game/dialogues/presentation";
import {
  tileTransform,
  BACKDROP,
  backdropTiles,
} from "../game/rendering/tiles";
import { AnimatedCharacter } from "./AnimatedCharacter";
import { ForestProp, MossPlatform } from "./ForestProps";
import {
  SoftGlow,
  PickupBurst,
  FogGate,
  AmbientMotes,
  type PickupVisual,
} from "./WorldEffects";
export type SceneProps = {
  width: number;
  height: number;
  menu?: boolean;
  x: SharedValue<number>;
  y: SharedValue<number>;
  camera: SharedValue<number>;
  time: SharedValue<number>;
  motion: SharedValue<number>;
  action: SharedValue<number>;
  falling: SharedValue<number>;
  progress: Progress;
  reducedMotion: boolean;
  pickup: SharedValue<PickupVisual>;
  talking: Speaker | null;
};
const nearest = { filter: 0, mipmap: 0 } as const;
function NPCActor({
  guide,
  helped,
  talking,
  time,
  reduced,
  playerX,
  x,
}: {
  guide: boolean;
  helped: boolean;
  talking: boolean;
  time: SharedValue<number>;
  reduced: boolean;
  playerX: SharedValue<number>;
  x: number;
}) {
  const frame = useDerivedValue(() =>
    guide
      ? talking
        ? 2 + (reduced ? 0 : Math.floor(time.value * 4) % 2)
        : !reduced && time.value % 5 > 4.7
          ? 1
          : 0
      : helped
        ? 6 + (reduced ? 0 : Math.floor(time.value * 2.5) % 2)
        : 4 + (!reduced && time.value % 4.3 > 3.95 ? 1 : 0),
  );
  const direction = useDerivedValue<number>(() => (playerX.value < x ? -1 : 1));
  const breathe = useDerivedValue(() => [
    { translateX: x },
    { translateY: 226 + (reduced ? 0 : Math.sin(time.value * 1.8) * 0.25) },
  ]);
  return (
    <Group transform={breathe}>
      <AnimatedCharacter
        kind="npcs"
        frame={frame}
        direction={direction}
        height={45}
      />
    </Group>
  );
}
function HopeLight({
  x,
  y,
  time,
  reduced,
}: {
  x: number;
  y: number;
  time: SharedValue<number>;
  reduced: boolean;
}) {
  const float = useDerivedValue(() => [
    { translateX: x },
    { translateY: y + (reduced ? 0 : Math.sin(time.value * 2 + x) * 2) },
  ]);
  const alpha = useDerivedValue(() =>
    reduced ? 0.8 : 0.7 + Math.sin(time.value * 3 + x) * 0.17,
  );
  const orbit = useDerivedValue(() => [
    { rotate: reduced ? 0 : time.value * 0.5 },
  ]);
  return (
    <Group transform={float}>
      <Group opacity={alpha}>
        <SoftGlow x={0} y={0} r={23} opacity={0.7} />
        <Path
          path="M 0 -9 L 3 -2 L 6 0 L 2 3 L 0 9 L -2 3 L -6 0 L -3 -2 Z"
          color="#ffe5a5"
        />
        <Path path="M 0 -5 L 1 0 L 0 5 L -1 0 Z" color="#fffbea" />
        <Group transform={orbit}>
          {[0, 1, 2].map((i) => (
            <Circle
              key={i}
              cx={Math.cos(i * 2.094) * 11}
              cy={Math.sin(i * 2.094) * 11}
              r={0.8}
              color="#fff0c4"
            />
          ))}
        </Group>
      </Group>
    </Group>
  );
}
export default function Scene(p: SceneProps) {
  const dawn = useImage(
    Asset.fromModule(require("../assets/backgrounds/dawn.png")).uri,
  );
  const forest = useImage(
    Asset.fromModule(require("../assets/backgrounds/forest.png")).uri,
  );
  const props = useImage(
    Asset.fromModule(require("../assets/props/v2/forest-props.png")).uri,
  );
  const treasures = useImage(
    Asset.fromModule(require("../assets/props/v2/treasures.png")).uri,
  );
  const world = useDerivedValue(() => [{ translateX: -p.camera.value }]);
  const far = useDerivedValue(() => [{ translateX: -p.camera.value * 0.12 }]);
  const direction = useSharedValue(1);
  useAnimatedReaction(
    () => p.motion.value,
    (m) => {
      if (Math.abs(m) === 1) direction.value = m < 0 ? -1 : 1;
    },
  );
  const frame = useDerivedValue(() => {
    const t = p.time.value;
    if (p.action.value === 6)
      return 10 + (p.reducedMotion ? 0 : Math.floor(t * 6) % 2);
    if (p.action.value === 5) return 9;
    if (p.action.value === 4) return 8;
    if (p.action.value === 3)
      return p.reducedMotion || Math.floor(t * 5) % 2 === 0 ? 8 : 0;
    if (Math.abs(p.motion.value) === 2) return p.falling.value ? 7 : 6;
    if (Math.abs(p.motion.value) === 1) return 2 + (Math.floor(t * 8) % 4);
    return !p.reducedMotion && t % 4.8 > 4.5 ? 1 : 0;
  });
  const hero = useDerivedValue(() => [
    { translateX: p.menu ? 122 : p.x.value },
    {
      translateY:
        (p.menu ? 247 : p.y.value) +
        (p.reducedMotion
          ? 0
          : Math.abs(p.motion.value) < 1
            ? Math.sin(p.time.value * 1.8) * 0.2
            : 0),
    },
    { scale: p.menu ? 3.65 : 1 },
  ]);
  return (
    <Canvas style={{ width: p.width, height: p.height }}>
      <Group transform={[{ scale: p.width / 480 }]}>
        <Rect
          x={0}
          y={0}
          width={480}
          height={270}
          color={p.menu ? "#bda1b7" : "#183e41"}
        />
        {p.menu ? (
          <>
            {dawn && (
              <Image
                image={dawn}
                x={0}
                y={0}
                width={480}
                height={270}
                fit="cover"
                sampling={nearest}
              />
            )}
            <Rect x={225} y={0} width={255} height={270}>
              <LinearGradient
                start={vec(225, 100)}
                end={vec(480, 100)}
                colors={["#fff0de00", "#fff0de44", "#fff0de00"]}
              />
            </Rect>
            <Oval x={101} y={245} width={44} height={4} color="#302b3722" />
          </>
        ) : (
          <>
            <Group transform={far}>
              {backdropTiles(WIDTH).map((i) => (
                <Group key={i} transform={[{ translateX: i * BACKDROP.step }]}>
                  <Group layer>
                    {forest && (
                      <Image
                        image={forest}
                        x={0}
                        y={BACKDROP.y}
                        width={BACKDROP.width}
                        height={BACKDROP.height}
                        fit="fill"
                        sampling={nearest}
                      />
                    )}
                    {i > 0 && (
                      <Rect
                        x={0}
                        y={BACKDROP.y}
                        width={BACKDROP.width}
                        height={BACKDROP.height}
                        blendMode="dstIn"
                      >
                        <LinearGradient
                          start={vec(0, 0)}
                          end={vec(BACKDROP.fade, 0)}
                          colors={["#ffffff00", "#ffffffff"]}
                        />
                      </Rect>
                    )}
                  </Group>
                </Group>
              ))}
            </Group>
            <Rect x={0} y={0} width={480} height={226} color="#0c303314" />
            <Group transform={world}>
              <Group clip={{ x: 0, y: 223, width: 3300, height: 47 }}>
                {Array.from({ length: 7 }, (_, i) => (
                  <Group key={i} transform={tileTransform(i, 516)}>
                    {forest && (
                      <Image
                        image={forest}
                        x={0}
                        y={0}
                        width={516}
                        height={290}
                        fit="fill"
                        sampling={nearest}
                      />
                    )}
                  </Group>
                ))}
              </Group>
              {platforms.map((r, i) => (
                <MossPlatform key={i} image={props} {...r} />
              ))}
              {objects.map((o) => {
                if (o.kind === "guide" || o.kind === "traveler")
                  return (
                    <NPCActor
                      key={o.id}
                      guide={o.kind === "guide"}
                      helped={p.progress.traveler}
                      talking={
                        o.kind === "guide"
                          ? p.talking === "guide"
                          : p.talking === "traveler" ||
                            p.talking === "travelerHappy"
                      }
                      time={p.time}
                      reduced={p.reducedMotion}
                      playerX={p.x}
                      x={o.x + 24}
                    />
                  );
                if (o.kind === "light")
                  return (
                    !p.progress.lights.includes(o.id) && (
                      <HopeLight
                        key={o.id}
                        x={o.x}
                        y={o.y}
                        time={p.time}
                        reduced={p.reducedMotion}
                      />
                    )
                  );
                if (o.kind === "lamp")
                  return (
                    <Group
                      key={o.id}
                      transform={[{ translateX: o.x }, { translateY: o.y }]}
                    >
                      <ForestProp
                        image={props}
                        index={p.progress.lamps.includes(o.id) ? 2 : 1}
                        height={48}
                      />
                      {p.progress.lamps.includes(o.id) && (
                        <SoftGlow x={0} y={-34} r={35} opacity={0.4} />
                      )}
                    </Group>
                  );
                if (o.kind === "riddle")
                  return (
                    <Group
                      key={o.id}
                      transform={[{ translateX: o.x }, { translateY: o.y }]}
                    >
                      <SoftGlow
                        x={0}
                        y={-20}
                        r={24}
                        color="#d5bce9"
                        opacity={p.progress.riddle ? 0.45 : 0.2}
                      />
                      <ForestProp image={props} index={3} height={39} />
                    </Group>
                  );
                return (
                  <Group
                    key={o.id}
                    transform={[{ translateX: o.x }, { translateY: o.y }]}
                  >
                    <SoftGlow x={0} y={-14} r={29} opacity={0.6} />
                    {/* treasure atlas has its own registration */}
                    <Treasure image={treasures} opened={p.progress.complete} />
                  </Group>
                );
              })}
              <FogGate
                x={1430}
                locked={p.progress.lamps.length < 2}
                time={p.time}
                reduced={p.reducedMotion}
              />
              <FogGate
                x={2550}
                locked={!p.progress.riddle}
                time={p.time}
                reduced={p.reducedMotion}
              />
              <PickupBurst
                time={p.time}
                origin={p.pickup}
                reduced={p.reducedMotion}
              />
            </Group>
          </>
        )}
        <Group transform={p.menu ? undefined : world}>
          <Group transform={hero}>
            <AnimatedCharacter
              kind="hero"
              frame={frame}
              direction={direction}
              height={44}
            />
          </Group>
        </Group>
        <AmbientMotes time={p.time} reduced={p.reducedMotion} />
      </Group>
    </Canvas>
  );
}

function Treasure({
  image,
  opened,
}: {
  image: ReturnType<typeof useImage>;
  opened: boolean;
}) {
  const f = art.treasures.frames[opened ? 1 : 0],
    scale = 35 / art.treasures.frames[0].width;
  return image ? (
    <Atlas
      image={image}
      sprites={[{ x: f.x, y: f.y, width: f.width, height: f.height }]}
      transforms={[
        Skia.RSXform(scale, 0, (-f.width * scale) / 2, -f.height * scale),
      ]}
      sampling={nearest}
    />
  ) : null;
}
