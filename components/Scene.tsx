import art from "../game/rendering/art.json";
import { tileTransform } from "../game/rendering/tiles";
import { Asset } from "expo-asset";
import {
  Canvas,
  Atlas,
  Group,
  Rect,
  Image,
  Circle,
  Path,
  useImage,
  useRSXformBuffer,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  useAnimatedReaction,
  type SharedValue,
} from "react-native-reanimated";
import {
  objects,
  platforms,
  platformAt,
  gaps,
  zones,
  hazards,
  objectVisible,
  activePlatforms,
  WIDTH,
  rightLimit,
  type Platform,
} from "../game/levels/forest";
import { hasMission, type Progress } from "../game/missions/progress";
import type { Speaker } from "../game/dialogues/presentation";
import { AnimatedCharacter } from "./AnimatedCharacter";
import { ForestProp } from "./ForestProps";
import {
  SoftGlow,
  PickupBurst,
  AmbientMotes,
  type PickupVisual,
} from "./WorldEffects";
export type SceneProps = {
  width: number;
  height: number;
  menu?: boolean;
  cameraSector: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
  camera: SharedValue<number>;
  time: SharedValue<number>;
  simulation: SharedValue<number>;
  motion: SharedValue<number>;
  action: SharedValue<number>;
  falling: SharedValue<number>;
  companionX: SharedValue<number>;
  companionY: SharedValue<number>;
  chestFrame: SharedValue<number>;
  progress: Progress;
  reducedMotion: boolean;
  pickup: SharedValue<PickupVisual>;
  talking: Speaker | null;
};
const nearest = { filter: 0, mipmap: 0 } as const;
function Background({
  image,
  index,
  camera,
}: {
  image: ReturnType<typeof useImage>;
  index: number;
  camera: SharedValue<number>;
}) {
  const zone = zones[index];
  const opacity = useDerivedValue(() => {
    const x = camera.value + 240;
    if (index < 5 && x > zone.end + 100) return 0;
    return index === 0
      ? 1
      : Math.max(0, Math.min(1, (x - zone.start + 100) / 200));
  });
  const transform = useDerivedValue(() => [
    {
      translateX: -Math.max(
        0,
        Math.min(120, (camera.value - zone.start) * 0.08),
      ),
    },
  ]);
  return image ? (
    <Group opacity={opacity}>
      <Group transform={transform}>
        <Image
          image={image}
          x={0}
          y={-7}
          width={600}
          height={283}
          fit="fill"
          sampling={nearest}
        />
      </Group>
    </Group>
  ) : null;
}
function Prop({
  image,
  pack,
  index,
  width,
  height,
}: {
  image: ReturnType<typeof useImage>;
  pack: "terrain" | "chest";
  index: number;
  width?: number;
  height?: number;
}) {
  const f = art[pack].frames[index],
    sx = width ? width / f.width : (height ?? 30) / f.height,
    sy = height ? height / f.height : sx;
  return image ? (
    <Group
      transform={[{ scaleX: sx }, { scaleY: sy }]}
      clip={{ x: -f.width / 2, y: -f.height, width: f.width, height: f.height }}
    >
      <Image
        image={image}
        x={-f.x - f.width / 2}
        y={-f.y - f.height}
        width={art[pack].width}
        height={art[pack].height}
        fit="fill"
        sampling={nearest}
      />
    </Group>
  ) : null;
}
function Ledge({
  r,
  time,
  image,
}: {
  r: Platform;
  time: SharedValue<number>;
  image: ReturnType<typeof useImage>;
}) {
  const transform = useDerivedValue(() => {
    const p = platformAt(r, time.value);
    return [{ translateX: p.x + p.w / 2 }, { translateY: p.y + r.h }];
  });
  const wood = ["wood", "moving", "rope", "fragile"].includes(r.kind ?? "");
  return (
    <Group transform={transform}>
      <Prop
        image={image}
        pack="terrain"
        index={wood ? 1 : 0}
        width={r.w}
        height={r.h + 3}
      />
      {r.kind === "wet" && (
        <Rect
          x={-r.w / 2 + 3}
          y={-r.h}
          width={r.w - 6}
          height={2}
          color="#90c9bcaa"
        />
      )}
      {r.kind === "moving" && (
        <>
          <Path
            path={`M ${-r.w / 2 + 4} -${r.h} L ${-r.w / 2 + 4} -65 M ${r.w / 2 - 4} -${r.h} L ${r.w / 2 - 4} -65`}
            color="#7c7359"
            style="stroke"
            strokeWidth={1}
          />
          <Circle cx={0} cy={-r.h / 2} r={1} color="#ecd08b" />
        </>
      )}
    </Group>
  );
}
function Actor({
  kind,
  index,
  x,
  y,
  time,
  reduced,
  talking,
  player,
}: {
  kind: "npcs" | "others";
  index: number;
  x: number | SharedValue<number>;
  y?: SharedValue<number>;
  time: SharedValue<number>;
  reduced: boolean;
  talking: boolean;
  player: SharedValue<number>;
}) {
  const frame = useDerivedValue(() =>
    kind === "others"
      ? index + (talking && !reduced && Math.floor(time.value * 3) % 2 ? 3 : 0)
      : index === 0
        ? talking
          ? 2 + (reduced ? 0 : Math.floor(time.value * 3) % 2)
          : !reduced && time.value % 5 > 4.7
            ? 1
            : 0
        : index +
          (reduced ? 0 : Math.floor(time.value * (talking ? 4 : 1.5)) % 2),
  );
  const transform = useDerivedValue(() => [
    { translateX: typeof x === "number" ? x : x.value },
    {
      translateY:
        (y?.value ?? 226) + (reduced ? 0 : Math.sin(time.value * 1.7) * 0.2),
    },
  ]);
  const direction = useDerivedValue<number>(() =>
    player.value < (typeof x === "number" ? x : x.value) ? -1 : 1,
  );
  return (
    <Group transform={transform}>
      <AnimatedCharacter
        kind={kind}
        frame={frame}
        direction={direction}
        height={44}
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
  const transform = useDerivedValue(() => [
    { translateX: x },
    { translateY: y + (reduced ? 0 : Math.sin(time.value * 2 + x) * 2) },
  ]);
  return (
    <Group transform={transform}>
      <SoftGlow x={0} y={0} r={18} opacity={0.55} />
      <Path path="M 0 -6 L 3 0 L 0 6 L -3 0 Z" color="#fff1bb" />
      <Circle cx={0} cy={0} r={1} color="#fffef2" />
    </Group>
  );
}
function Chest({
  image,
  frame,
}: {
  image: ReturnType<typeof useImage>;
  frame: SharedValue<number>;
}) {
  const data = art.chest,
    scale = 34 / data.frames[0].width;
  const sprites = useDerivedValue(() => {
    const f = data.frames[Math.max(0, Math.min(3, Math.floor(frame.value)))];
    return [{ x: f.x, y: f.y, width: f.width, height: f.height }];
  });
  const transforms = useRSXformBuffer(1, (t) => {
    "worklet";
    const f = data.frames[Math.max(0, Math.min(3, Math.floor(frame.value)))];
    t.set(scale, 0, (f.x - f.anchorX) * scale, (f.y - f.anchorY) * scale);
  });
  return image ? (
    <Atlas
      image={image}
      sprites={sprites}
      transforms={transforms}
      sampling={nearest}
    />
  ) : null;
}
export default function Scene(p: SceneProps) {
  const dawn = useImage(
    Asset.fromModule(require("../assets/backgrounds/dawn.png")).uri,
  );
  const entrance = useImage(
      Asset.fromModule(require("../assets/backgrounds/v3/entrance.png")).uri,
    ),
    stream = useImage(
      Asset.fromModule(require("../assets/backgrounds/v3/stream.png")).uri,
    ),
    bridge = useImage(
      Asset.fromModule(require("../assets/backgrounds/v3/bridge.png")).uri,
    ),
    clearing = useImage(
      Asset.fromModule(require("../assets/backgrounds/v3/clearing.png")).uri,
    ),
    mist = useImage(
      Asset.fromModule(require("../assets/backgrounds/v3/mist.png")).uri,
    ),
    refuge = useImage(
      Asset.fromModule(require("../assets/backgrounds/v3/refuge.png")).uri,
    );
  const terrain = useImage(
      Asset.fromModule(require("../assets/props/v3/terrain.png")).uri,
    ),
    props = useImage(
      Asset.fromModule(require("../assets/props/v2/forest-props.png")).uri,
    ),
    chest = useImage(
      Asset.fromModule(require("../assets/props/v3/chest.png")).uri,
    );
  const ground = useImage(
    Asset.fromModule(require("../assets/props/v3/ground.png")).uri,
  );
  const world = useDerivedValue(() => [{ translateX: -p.camera.value }]);
  const direction = useSharedValue(1);
  useAnimatedReaction(
    () => p.motion.value,
    (m) => {
      if (m) direction.value = m < 0 ? -1 : 1;
    },
  );
  const frame = useDerivedValue(() => {
    const t = p.time.value;
    if (p.action.value === 6)
      return 10 + (p.reducedMotion ? 0 : Math.floor(t * 6) % 2);
    if (p.action.value === 5) return 9;
    if (p.action.value === 3)
      return p.reducedMotion ? 8 : Math.floor(t * 5) % 2 ? 8 : 0;
    if (Math.abs(p.motion.value) === 2) return p.falling.value ? 7 : 6;
    if (Math.abs(p.motion.value) === 1) return 2 + (Math.floor(t * 8) % 4);
    return !p.reducedMotion && t % 4.8 > 4.5 ? 1 : 0;
  });
  const hero = useDerivedValue(() => [
    { translateX: p.menu ? 122 : p.x.value },
    { translateY: p.menu ? 247 : p.y.value },
    { scale: p.menu ? 3.65 : 1 },
  ]);
  // Render only geometry and objects close to the visible camera window.
  // Keep a 240px prefetch margin to avoid pop-in as the camera moves.
  const viewStart = Math.max(0, p.cameraSector * 240 - 240);
  const viewEnd = Math.min(WIDTH, p.cameraSector * 240 + 960);
  const inView = (at: number, width = 0) =>
    at + width >= viewStart && at <= viewEnd;
  const groundSegments = [];
  let from = 0;
  for (const gap of gaps) {
    groundSegments.push({ x: from, w: gap.x - from });
    from = gap.x + gap.w;
  }
  groundSegments.push({ x: from, w: WIDTH - from });
  const fog = useDerivedValue(
    () =>
      Math.max(0, Math.min(0.28, (p.camera.value - 4800) / 1300)) *
      (hasMission(p.progress, 13) ? 0.3 : 1),
  );
  return (
    <Canvas style={{ width: p.width, height: p.height }}>
      <Group transform={[{ scale: p.width / 480 }]}>
        <Rect x={0} y={0} width={480} height={270} color="#233d40" />
        {p.menu ? (
          dawn && (
            <Image
              image={dawn}
              x={0}
              y={0}
              width={480}
              height={270}
              fit="cover"
              sampling={nearest}
            />
          )
        ) : (
          <>
            {[entrance, stream, bridge, clearing, mist, refuge].map(
              (image, i) =>
                zones[i].end >= viewStart && zones[i].start <= viewEnd ? (
                  <Background key={i} image={image} index={i} camera={p.camera} />
                ) : null,
            )}
            <Group transform={world}>
              {gaps.filter((g) => inView(g.x, g.w)).map((g) => (
                <Group key={g.x}>
                  <Rect
                    x={g.x}
                    y={226}
                    width={g.w}
                    height={44}
                    color="#16474a"
                  />
                  <Rect x={g.x} y={245} width={g.w} height={25}>
                    <LinearGradient
                      start={vec(0, 245)}
                      end={vec(0, 270)}
                      colors={["#578d85", "#162f3a"]}
                    />
                  </Rect>
                  {[0, 1, 2].map((i) => (
                    <Rect
                      key={i}
                      x={g.x + 4}
                      y={247 + i * 6}
                      width={g.w - 8}
                      height={0.6}
                      color="#a7d2bf66"
                    />
                  ))}
                </Group>
              ))}
              {groundSegments.filter((g) => inView(g.x, g.w)).map((g) => (
                <Group
                  key={g.x}
                  clip={{ x: g.x, y: 226, width: g.w, height: 44 }}
                >
                  <Rect
                    x={g.x}
                    y={226}
                    width={g.w}
                    height={44}
                    color="#554530"
                  />
                  {Array.from(
                    {
                      length:
                        Math.ceil((g.x + g.w) / 240) - Math.floor(g.x / 240),
                    },
                    (_, offset) => (
                      <Group
                        key={offset}
                        transform={tileTransform(
                          Math.floor(g.x / 240) + offset,
                          240,
                        )}
                      >
                        {ground && (
                          <Image
                            image={ground}
                            x={0}
                            y={218}
                            width={240}
                            height={80}
                            fit="fill"
                            sampling={nearest}
                          />
                        )}
                      </Group>
                    ),
                  )}
                </Group>
              ))}
              {rightLimit(p.progress) < 7988 && inView(rightLimit(p.progress), 52) && (
                <Group
                  transform={[
                    { translateX: rightLimit(p.progress) + 28 },
                    { translateY: 226 },
                  ]}
                >
                  <Prop
                    image={terrain}
                    pack="terrain"
                    index={3}
                    width={52}
                    height={65}
                  />
                </Group>
              )}
              {activePlatforms(p.progress).filter((r) => inView(r.x - (r.move?.amplitude ?? 0), r.w + 2 * (r.move?.amplitude ?? 0))).map((r) => (
                <Ledge key={r.id} r={r} time={p.simulation} image={terrain} />
              ))}
              {hazards.filter((h) => inView(h.x, h.w)).map((h) => (
                <Path
                  key={h.id}
                  path={`M ${h.x} ${h.y} Q ${h.x + 3} ${h.y - 12} ${h.x + 7} ${h.y - 5} Q ${h.x + 10} ${h.y - 11} ${h.x + h.w} ${h.y} Z`}
                  color="#77553e"
                />
              ))}
              {objects
                .filter((o) => objectVisible(o, p.progress) && inView(o.x, 48))
                .map((o) => {
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
                  if (o.kind === "evidence" || o.kind === "item") {
                    if (
                      (o.kind === "item"
                        ? p.progress.items
                        : p.progress.evidence
                      ).includes(o.id)
                    )
                      return null;
                    return (
                      <Group
                        key={o.id}
                        transform={[
                          { translateX: o.x },
                          { translateY: o.y - 7 },
                        ]}
                      >
                        <SoftGlow x={0} y={0} r={10} opacity={0.2} />
                        <Path
                          path={
                            o.kind === "evidence"
                              ? "M -4 -5 L 3 -5 L 5 -3 L 5 5 L -4 5 Z"
                              : "M -5 -2 L 4 -5 L 6 -2 L -3 5 L -6 3 Z"
                          }
                          color={o.kind === "evidence" ? "#e5cf9f" : "#b88a58"}
                        />
                        <Path
                          path="M -2 -2 L 2 -2 M -2 1 L 2 1"
                          color="#725c47"
                          style="stroke"
                          strokeWidth={0.7}
                        />
                      </Group>
                    );
                  }
                  if (
                    [
                      "guide",
                      "guide_clear",
                      "traveler",
                      "walker",
                      "helper",
                      "lamp2",
                      "keeper",
                    ].includes(o.id)
                  ) {
                    if (o.id === "traveler" && hasMission(p.progress, 7))
                      return null;
                    if (o.id === "helper" && hasMission(p.progress, 5))
                      return null;
                    const speaker: Speaker = o.id.startsWith("guide")
                      ? "guide"
                      : o.id === "traveler"
                        ? "traveler"
                        : o.id === "lamp2"
                          ? "secondary"
                          : o.id === "keeper"
                            ? "keeper"
                            : "walker";
                    return (
                      <Actor
                        key={o.id}
                        kind={
                          ["walker", "helper", "lamp2", "keeper"].includes(o.id)
                            ? "others"
                            : "npcs"
                        }
                        index={
                          speaker === "guide"
                            ? 0
                            : speaker === "traveler"
                              ? 4
                              : speaker === "secondary"
                                ? 1
                                : speaker === "keeper"
                                  ? 2
                                  : 0
                        }
                        x={o.x + 24}
                        time={p.time}
                        reduced={p.reducedMotion}
                        talking={p.talking === speaker}
                        player={p.x}
                      />
                    );
                  }
                  if (o.id === "chest")
                    return (
                      <Group
                        key={o.id}
                        transform={[{ translateX: o.x }, { translateY: o.y }]}
                      >
                        <SoftGlow
                          x={0}
                          y={-10}
                          r={26}
                          opacity={hasMission(p.progress, 15) ? 0.1 : 0.25}
                        />
                        <Chest image={chest} frame={p.chestFrame} />
                      </Group>
                    );
                  if (o.id === "branch")
                    return (
                      !hasMission(p.progress, 5) && (
                        <Group
                          key={o.id}
                          transform={[
                            { translateX: 2398 },
                            { translateY: 226 },
                          ]}
                        >
                          <Prop
                            image={terrain}
                            pack="terrain"
                            index={3}
                            width={50}
                            height={71}
                          />
                        </Group>
                      )
                    );
                  if (["lamp1", "mist_beacon"].includes(o.id))
                    return (
                      <Group
                        key={o.id}
                        transform={[{ translateX: o.x }, { translateY: o.y }]}
                      >
                        <ForestProp
                          image={props}
                          index={
                            hasMission(p.progress, o.id === "lamp1" ? 9 : 12)
                              ? 2
                              : 1
                          }
                          height={45}
                        />
                      </Group>
                    );
                  if (
                    ["sign1", "bridge", "no_return", "library"].includes(o.id)
                  )
                    return (
                      <Group
                        key={o.id}
                        transform={[{ translateX: o.x }, { translateY: o.y }]}
                      >
                        <Prop
                          image={terrain}
                          pack="terrain"
                          index={2}
                          height={32}
                        />
                      </Group>
                    );
                  if (o.id === "riddle")
                    return (
                      <Group
                        key={o.id}
                        transform={[{ translateX: o.x }, { translateY: o.y }]}
                      >
                        <ForestProp image={props} index={3} height={35} />
                      </Group>
                    );
                  if (["notebook", "scripture"].includes(o.id))
                    return (
                      <Group
                        key={o.id}
                        transform={[
                          { translateX: o.x },
                          { translateY: o.y - 6 },
                        ]}
                      >
                        <Path
                          path="M -7 -5 L 0 -3 L 7 -5 L 7 3 L 0 5 L -7 3 Z"
                          color="#e3cf9f"
                        />
                        <Path
                          path="M 0 -3 L 0 5"
                          color="#7e6455"
                          style="stroke"
                          strokeWidth={1}
                        />
                      </Group>
                    );
                  return null;
                })}
              {/* Both farols remain visible when their speakers move on. */}
              {inView(4905, 45) && (
                <Group transform={[{ translateX: 4905 }, { translateY: 226 }]}>
                  <ForestProp
                    image={props}
                    index={hasMission(p.progress, 11) ? 2 : 1}
                    height={45}
                  />
                </Group>
              )}
              {hasMission(p.progress, 7) && (
                <Actor
                  kind="npcs"
                  index={hasMission(p.progress, 8) ? 6 : 4}
                  x={p.companionX}
                  y={p.companionY}
                  time={p.time}
                  reduced={p.reducedMotion}
                  talking={
                    p.talking === "traveler" || p.talking === "travelerHappy"
                  }
                  player={p.x}
                />
              )}
              <Group transform={hero}>
                <AnimatedCharacter
                  kind="hero"
                  frame={frame}
                  direction={direction}
                  height={44}
                />
              </Group>
              <PickupBurst
                time={p.time}
                origin={p.pickup}
                reduced={p.reducedMotion}
              />
            </Group>
            <Rect
              x={0}
              y={0}
              width={480}
              height={226}
              color="#b7c9c7"
              opacity={fog}
            />
          </>
        )}
        {p.menu && (
          <Group transform={hero}>
            <AnimatedCharacter
              kind="hero"
              frame={frame}
              direction={direction}
              height={44}
            />
          </Group>
        )}
        <AmbientMotes time={p.time} reduced={p.reducedMotion} />
      </Group>
    </Canvas>
  );
}
