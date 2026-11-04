import React from "react";
import { Asset } from "expo-asset";
import {
  Canvas,
  Rect,
  Group,
  Path,
  Circle,
  Oval,
  Image,
  useImage,
  LinearGradient,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useAnimatedReaction,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import manifest from "../manifest.json";
import { platforms, objects } from "../game/levels/forest";
import type { Progress } from "../game/missions/progress";
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
  progress: Progress;
  reducedMotion: boolean;
};
const nearest = { filter: 0, mipmap: 0 } as const;
const spriteSources = [
  require("../assets/sheets/idle_right.png"),
  require("../assets/sheets/walk_right.png"),
  require("../assets/sheets/jump_right.png"),
  require("../assets/sheets/talk.png"),
  require("../assets/sheets/open_chest.png"),
  require("../assets/sheets/receive_fe.png"),
  require("../assets/sheets/celebrate.png"),
  require("../assets/sheets/walk_left.png"),
  require("../assets/sheets/idle_left.png"),
  require("../assets/sheets/jump_left.png"),
];
const animationKeys = [
  "idle_right",
  "walk_right",
  "jump_right",
  "talk",
  "open_chest",
  "receive_fe",
  "celebrate",
  "walk_left",
  "idle_left",
  "jump_left",
] as const;
function SpriteLayer({
  pose,
  active,
  time,
}: {
  pose: number;
  active: SharedValue<number>;
  time: SharedValue<number>;
}) {
  const image = useImage(Asset.fromModule(spriteSources[pose]).uri);
  const a = manifest.animations[animationKeys[pose]],
    w = a.frameWidth / 4,
    h = a.frameHeight / 4;
  const opacity = useDerivedValue(() => (active.value === pose ? 1 : 0));
  const frame = useDerivedValue(
    () => -(Math.floor(time.value * a.fps) % a.framesCount) * w,
  );
  // Each layer owns a fixed image and clip. Only numeric offsets change per frame.
  // Never transfer a CanvasKit image or manually disposed paint through a mapper.
  return (
    <Group
      opacity={opacity}
      transform={[{ translateX: -w / 2 }, { translateY: -h * 0.94 }]}
      clip={{ x: 0.5, y: 0, width: pose === 0 ? 24 : w - 1, height: h }}
    >
      {image && (
        <Image
          image={image}
          x={frame}
          y={0}
          width={w * a.framesCount}
          height={h}
          fit="fill"
          sampling={nearest}
        />
      )}
    </Group>
  );
}
function Stone({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <Group>
      <Rect x={x} y={y + 3} width={w} height={h} color="#414e48" />
      {Array.from({ length: Math.ceil(w / 15) }, (_, i) => (
        <Group key={i}>
          <Rect
            x={x + i * 15 + 1}
            y={y + 6}
            width={Math.min(13, w - i * 15 - 1)}
            height={Math.max(3, Math.min(h - 5, 10))}
            color={["#777d68", "#8f9171", "#687663"][i % 3]}
          />
          <Rect
            x={x + i * 15 + 2}
            y={y + 7}
            width={Math.min(9, w - i * 15 - 2)}
            height={2}
            color="#aaac83"
          />
        </Group>
      ))}
      <Rect x={x - 1} y={y} width={w + 2} height={4} color="#6d8a44" />
      <Rect x={x + 2} y={y} width={w - 4} height={1.5} color="#b4c878" />
      {[0.15, 0.53, 0.81].map((v, i) => (
        <Rect
          key={i}
          x={x + w * v}
          y={y + 3}
          width={3}
          height={7 + i * 3}
          color="#527746"
        />
      ))}
    </Group>
  );
}
function Glow({
  x,
  y,
  r = 18,
  opacity = 0.7,
}: {
  x: number;
  y: number;
  r?: number;
  opacity?: number;
}) {
  return (
    <Circle cx={x} cy={y} r={r} opacity={opacity}>
      <RadialGradient
        c={vec(x, y)}
        r={r}
        colors={["#ffe9ad99", "#f8c87b22", "#f8c87b00"]}
      />
    </Circle>
  );
}
export default function Scene(p: SceneProps) {
  const dawn = useImage(
    Asset.fromModule(require("../assets/backgrounds/dawn.png")).uri,
  );
  const forest = useImage(
    Asset.fromModule(require("../assets/backgrounds/forest.png")).uri,
  );
  const npcs = useImage(
    Asset.fromModule(require("../assets/characters/forest-npcs.png")).uri,
  );
  const chestClosed = useImage(
    Asset.fromModule(require("../assets/props/cofre_cerrado.png")).uri,
  );
  const chestOpen = useImage(
    Asset.fromModule(require("../assets/props/cofre_abierto.png")).uri,
  );
  const world = useDerivedValue(() => [{ translateX: -p.camera.value }]);
  const far = useDerivedValue(() => [{ translateX: -p.camera.value * 0.12 }]);
  const hero = useDerivedValue(() => [
    { translateX: p.menu ? 123 : p.x.value },
    { translateY: p.menu ? 247 : p.y.value },
    { scale: p.menu ? 4 : 1.16 },
  ]);
  const facing = useSharedValue(1);
  useAnimatedReaction(
    () => p.motion.value,
    (movement) => {
      if (Math.abs(movement) === 1) facing.value = movement < 0 ? -1 : 1;
    },
  );
  const pose = useDerivedValue(() => {
    const action = Math.round(p.action.value);
    if (action >= 3 && action <= 6) return action;
    if (Math.abs(p.motion.value) === 2) return facing.value < 0 ? 9 : 2;
    return p.motion.value < 0
      ? 7
      : p.motion.value > 0
        ? 1
        : facing.value < 0
          ? 8
          : 0;
  });
  const flicker = useDerivedValue(() =>
    p.reducedMotion ? 0.85 : 0.72 + Math.sin(p.time.value * 2) * 0.14,
  );
  const float = useDerivedValue(() => [
    { translateY: p.reducedMotion ? 0 : Math.sin(p.time.value * 2) * 2 },
  ]);
  const fogOpacity = useDerivedValue(() =>
    p.reducedMotion ? 0.28 : 0.24 + Math.sin(p.time.value * 0.3) * 0.04,
  );
  return (
    <Canvas style={{ width: p.width, height: p.height }}>
      <Group transform={[{ scale: p.width / 480 }]}>
        <Rect
          x={0}
          y={0}
          width={480}
          height={270}
          color={p.menu ? "#bd9ab4" : "#173d40"}
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
                colors={["#fff0de00", "#fff0de66", "#fff0de11"]}
              />
            </Rect>
            <Oval x={95} y={244} width={61} height={6} color="#342b3933" />
          </>
        ) : (
          <>
            <Group transform={far}>
              {[-1, 0, 1, 2].map(
                (i) =>
                  forest && (
                    <Image
                      key={i}
                      image={forest}
                      x={i * 516}
                      y={0}
                      width={516}
                      height={290}
                      fit="fill"
                      sampling={nearest}
                    />
                  ),
              )}
            </Group>
            <Group transform={world}>
              <Group clip={{ x: 0, y: 226, width: 3300, height: 44 }}>
                {Array.from(
                  { length: 7 },
                  (_, i) =>
                    forest && (
                      <Image
                        key={i}
                        image={forest}
                        x={i * 516}
                        y={0}
                        width={516}
                        height={290}
                        fit="fill"
                        sampling={nearest}
                      />
                    ),
                )}
              </Group>
              {platforms.map((r, i) => (
                <Stone key={i} {...r} />
              ))}
              {objects.map((o) => {
                const active =
                  p.progress.lights.includes(o.id) ||
                  p.progress.lamps.includes(o.id);
                return (
                  <Group
                    key={o.id}
                    transform={[{ translateX: o.x }, { translateY: o.y }]}
                  >
                    {o.kind === "light" ? (
                      !active && (
                        <Group transform={float}>
                          <Group opacity={flicker}>
                            <Glow x={0} y={-7} r={20} />
                            <Path
                              path="M 0 -15 L 4 -8 L 0 0 L -4 -8 Z"
                              color="#ffe5a2"
                            />
                            <Path
                              path="M 0 -12 L 1 -7 L 0 -3 L -1 -7 Z"
                              color="#fff9dc"
                            />
                          </Group>
                        </Group>
                      )
                    ) : o.kind === "lamp" ? (
                      <>
                        <Rect
                          x={-2}
                          y={-38}
                          width={4}
                          height={38}
                          color="#554f48"
                        />
                        <Rect
                          x={-4}
                          y={-39}
                          width={2}
                          height={39}
                          color="#a88b65"
                        />
                        <Path
                          path="M -9 -42 L 0 -48 L 9 -42 Z"
                          color="#837353"
                        />
                        <Rect
                          x={-7}
                          y={-42}
                          width={14}
                          height={16}
                          color="#4c5d58"
                        />
                        <Rect
                          x={-4}
                          y={-39}
                          width={8}
                          height={10}
                          color={active ? "#ffe4a0" : "#7c9987"}
                        />
                        <Rect
                          x={-8}
                          y={-27}
                          width={16}
                          height={3}
                          color="#8c7655"
                        />
                        {active && (
                          <Group opacity={flicker}>
                            <Glow x={0} y={-34} r={40} />
                          </Group>
                        )}
                      </>
                    ) : o.kind === "chest" ? (
                      <>
                        <Glow x={0} y={-13} r={32} />
                        <Image
                          image={p.progress.complete ? chestOpen : chestClosed}
                          x={-18}
                          y={-29}
                          width={36}
                          height={30}
                          fit="contain"
                          sampling={nearest}
                        />
                      </>
                    ) : o.kind === "riddle" ? (
                      <>
                        <Stone x={-17} y={-35} w={34} h={35} />
                        <Rect
                          x={-10}
                          y={-28}
                          width={20}
                          height={19}
                          color="#293f3c"
                        />
                        <Path
                          path="M -7 -22 L -1 -23 L 0 -12 L 1 -23 L 7 -22 L 7 -13 L 1 -14 L 0 -12 L -1 -14 L -7 -13 Z"
                          color="#d1c99a"
                        />
                      </>
                    ) : (
                      <Group clip={{ x: -21, y: -50, width: 42, height: 51 }}>
                        <Image
                          image={npcs}
                          x={o.kind === "guide" ? -21 : -63}
                          y={-48}
                          width={84}
                          height={53}
                          fit="fill"
                          sampling={nearest}
                        />
                      </Group>
                    )}
                  </Group>
                );
              })}
              {[
                { x: 1430, locked: p.progress.lamps.length < 2 },
                { x: 2550, locked: !p.progress.riddle },
              ].map(
                (g) =>
                  g.locked && (
                    <Group key={g.x} opacity={fogOpacity}>
                      <Rect x={g.x - 8} y={40} width={34} height={186}>
                        <LinearGradient
                          start={vec(g.x, 40)}
                          end={vec(g.x, 226)}
                          colors={["#d5d5e900", "#d5d5e9", "#b3c8d4"]}
                        />
                      </Rect>
                      {[0, 1, 2].map((i) => (
                        <Oval
                          key={i}
                          x={g.x - 23}
                          y={85 + i * 47}
                          width={65}
                          height={32}
                          color="#d5d5e9"
                        />
                      ))}
                    </Group>
                  ),
              )}
            </Group>
          </>
        )}
        <Group transform={p.menu ? undefined : world}>
          <Group transform={hero}>
            {animationKeys.map((_, i) => (
              <SpriteLayer key={i} pose={i} active={pose} time={p.time} />
            ))}
          </Group>
        </Group>
        {!p.menu && (
          <Group opacity={flicker}>
            {Array.from({ length: 15 }, (_, i) => (
              <Group key={i} transform={float}>
                <Circle
                  cx={(i * 79) % 480}
                  cy={90 + ((i * 37) % 120)}
                  r={0.65}
                  color="#ffedb5"
                />
                {i % 3 === 0 && (
                  <Glow
                    x={(i * 79) % 480}
                    y={90 + ((i * 37) % 120)}
                    r={5}
                    opacity={0.4}
                  />
                )}
              </Group>
            ))}
          </Group>
        )}
      </Group>
    </Canvas>
  );
}
