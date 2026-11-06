import { BranchClearance, RepairLamp, SpeechMarker } from "./InteractionEffects";
import { conversationPose, idlePose } from "../game/rendering/conversation";
import WaterfallOverlay from "./WaterfallOverlay";
import WorldDecor from "./WorldDecor";
import RegisteredSprite from "./RegisteredSprite";
import { pickupFrames } from "../game/rendering/pickups";
import { chapterGuidance } from "../game/chapter1/guidance";
import art from "../game/rendering/art-runtime.json";
import PlaceAtmosphere, { WaterSurface } from "./PlaceAtmosphere";
import { MistBackdrop, MistForeground } from "./MistVeil";
import { propPlacement } from "../game/rendering/props";
import { tileTransform } from "../game/rendering/tiles";
import { viewWindow, intersects, groundTiles } from "../game/rendering/view";
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
  type PickupVisual,
} from "./WorldEffects";
export type SceneProps = {
  width: number;
  height: number;
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
  companionMotion: SharedValue<number>;
  companionDirection: SharedValue<number>;
  chestFrame: SharedValue<number>;
  branchProgress: SharedValue<number>;
  repair: SharedValue<{x:number;at:number}>;
  speechAt: SharedValue<number>;
  partner: Speaker | null;
  progress: Progress;
  reducedMotion: boolean;
  pickup: SharedValue<PickupVisual>;
  talking: Speaker | null;
};
const nearest = { filter: 0, mipmap: 0 } as const;
const zoneSources = [
  require("../assets/runtime/entrance.webp"),
  require("../assets/runtime/stream.webp"),
  require("../assets/runtime/bridge.webp"),
  require("../assets/runtime/clearing.webp"),
  require("../assets/runtime/mist.webp"),
  require("../assets/runtime/refuge.webp"),
];
function Background({
  index,
  camera, time, reduced,
}: {
  index: number;
  camera: SharedValue<number>;
  time: SharedValue<number>;
  reduced: boolean;
}) {
  const image = useImage(Asset.fromModule(zoneSources[index]).uri);
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
        {(index===1 || index===2) && <WaterfallOverlay index={index} time={time} reduced={reduced} />}
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
  surface = false,
}: {
  image: ReturnType<typeof useImage>;
  pack: "terrain" | "chest";
  index: number;
  width?: number;
  height?: number;
  surface?: boolean;
}) {
  const f = art[pack].frames[index];
  const { sx, sy, left, top } = propPlacement(f, width, height, surface);
  return image ? (
    <Group
      transform={[{ scaleX: sx }, { scaleY: sy }]}
      clip={{ x: left, y: top, width: f.width, height: f.height }}
    >
      <Image
        image={image}
        x={left - f.x}
        y={top - f.y}
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
    return [{ translateX: p.x + p.w / 2 }, { translateY: p.y }];
  });
  const wood = ["wood", "moving", "rope", "fragile"].includes(r.kind ?? "");
  return (
    <Group transform={transform}>
      <Prop
        image={image}
        pack="terrain"
        index={wood ? 1 : 0}
        width={r.w}
        height={r.h}
        surface
      />
      {r.x >= 5120 && r.x < 7040 && <Rect x={-r.w/2+2} y={0} width={r.w-4} height={1.3} color="#d8eee4" opacity={.8} />}
      {r.kind === "wet" && (
        <Rect
          x={-r.w / 2 + 3}
          y={0}
          width={r.w - 6}
          height={2}
          color="#90c9bcaa"
        />
      )}
      {r.kind === "moving" && (
        <>
          <Path
            path={`M ${-r.w / 2 + 4} 0 L ${-r.w / 2 + 4} -65 M ${r.w / 2 - 4} 0 L ${r.w / 2 - 4} -65`}
            color="#7c7359"
            style="stroke"
            strokeWidth={1}
          />
          <Circle cx={0} cy={r.h / 2} r={1} color="#ecd08b" />
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
  speechAt,
  work,
  player,
}: {
  kind: "npcs" | "cast" | "locals";
  index: number;
  x: number | SharedValue<number>;
  y?: SharedValue<number>;
  time: SharedValue<number>;
  reduced: boolean;
  talking: boolean;
  speechAt: SharedValue<number>;
  work: SharedValue<number>;
  player: SharedValue<number>;
}) {
  const frame = useDerivedValue(() =>
    kind === "locals" && work.value>=0 && work.value<1 ? 2 :
    kind === "cast" || kind === "locals"
      ? index + (talking ? conversationPose(time.value-speechAt.value,reduced) : idlePose(time.value,reduced))
      : index === 0
        ? talking
          ? 2 + (reduced ? 0 : Math.floor((time.value-speechAt.value) * 1.4) % 2)
          : !reduced && time.value % 5 > 4.7
            ? 1
            : 0
        : index + (talking ? 0 : idlePose(time.value,reduced)),
  );
  const transform = useDerivedValue(() => [
    { translateX: typeof x === "number" ? x : x.value },
    {
      translateY:
        (y?.value ?? 226),
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
      {talking && <SpeechMarker time={time} reduced={reduced} />}
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
function Companion(p: SceneProps) {
  const transform = useDerivedValue(() => [{ translateX: p.companionX.value }, { translateY: p.companionY.value }]);
  const opacity = useDerivedValue(() => p.progress.completedMissions.includes("CH1_07") && p.x.value >= 3000 ? 1 : 0);
  const frame = useDerivedValue(() => {
    if(p.talking==="traveler"||p.talking==="travelerHappy") return conversationPose(p.time.value-p.speechAt.value,p.reducedMotion);
    const state = p.companionMotion.value;
    if (state === 4) return 11;
    if (state === 3) return 10;
    if (state === 2) return 9;
    if (state === 1) return 4 + Math.floor(p.simulation.value * 9) % 4;
    return p.reducedMotion ? 0 : Math.floor(p.simulation.value * 2) % 4;
  });
  const facing=useDerivedValue<number>(()=>p.talking?(p.x.value<p.companionX.value?-1:1):p.companionDirection.value);
  const speaking=p.talking==="traveler"||p.talking==="travelerHappy";
  return <Group transform={transform} opacity={opacity}>
    <AnimatedCharacter kind={speaking?"travelerTalk":"traveler"} frame={frame} direction={facing} height={44} />
    {speaking && <SpeechMarker time={p.time} reduced={p.reducedMotion} />}
  </Group>;
}
export default function Scene(p: SceneProps) {
  const decorArt=useImage(Asset.fromModule(require("../assets/runtime/decor.png")).uri);
  const pickupArt=useImage(Asset.fromModule(require("../assets/runtime/pickups.png")).uri);
  const terrain = useImage(
      Asset.fromModule(require("../assets/runtime/terrain.png")).uri,
    ),
    props = useImage(
      Asset.fromModule(require("../assets/runtime/props.png")).uri,
    ),
    chest = useImage(
      Asset.fromModule(require("../assets/runtime/chest.png")).uri,
    );
  const ground = useImage(
    Asset.fromModule(require("../assets/runtime/ground.webp")).uri,
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
    if (p.action.value === 7) return 8;
    if (p.action.value === 3) return 0;
    if (Math.abs(p.motion.value) === 2) return p.falling.value ? 7 : 6;
    if (Math.abs(p.motion.value) === 1) return 2 + (Math.floor(t * 8) % 4);
    return !p.reducedMotion && t % 4.8 > 4.5 ? 1 : 0;
  });
  const leverOpacity=useDerivedValue(()=>p.branchProgress.value>=0&&p.branchProgress.value<1?1:0);
  const heroSpeech=useDerivedValue(()=>p.talking==="hero"?conversationPose(p.time.value-p.speechAt.value,p.reducedMotion):idlePose(p.time.value,p.reducedMotion));
  const heroFacing=useDerivedValue<number>(()=>{
    const partner=p.partner;
    if(!partner)return direction.value;
    const target=partner==="guide"?(hasMission(p.progress,9)?4424:624):partner==="walker"?1824:partner==="ranger"?2374:partner==="secondary"?4874:partner==="keeper"?7364:(partner==="traveler"||partner==="travelerHappy")?(hasMission(p.progress,7)?p.companionX.value:3124):p.x.value+direction.value;
    return target<p.x.value?-1:1;
  });
  const hero = useDerivedValue(() => [
    { translateX: p.x.value },
    { translateY: p.y.value },
  ]);
  const destination = chapterGuidance(p.progress).target;
  const viewport = viewWindow(p.cameraSector, WIDTH);
  const { start: viewStart, end: viewEnd } = viewport;
  const nearMist = viewEnd >= 4960 && viewStart <= 7140;
  const inView = (at: number, width = 0) => intersects(viewport, at, width);
  const groundSegments = [];
  let from = 0;
  for (const gap of gaps) {
    groundSegments.push({ x: from, w: gap.x - from });
    from = gap.x + gap.w;
  }
  groundSegments.push({ x: from, w: WIDTH - from });
  return (
    <Canvas style={{ width: p.width, height: p.height }}>
      <Group transform={[{ scale: p.width / 480 }]}>
        <Rect x={0} y={0} width={480} height={270} color="#233d40" />
        <>
            {zoneSources.map(
              (_, i) =>
                zones[i].end >= viewStart && zones[i].start <= viewEnd ? (
                  <Background
                    key={i}
                    index={i}
                    camera={p.camera}
                    time={p.time}
                    reduced={p.reducedMotion}
                  />
                ) : null,
            )}
            {nearMist && <MistBackdrop position={p.x} time={p.time} reduced={p.reducedMotion} oriented={hasMission(p.progress,13)} />}
            <Group transform={world}>
              {gaps
                .filter((g) => inView(g.x, g.w))
                .map((g) => (
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
                    <WaterSurface x={g.x} width={g.w} time={p.time} reduced={p.reducedMotion} />
                  </Group>
                ))}
              {groundSegments
                .filter((g) => inView(g.x, g.w))
                .map((g) => (
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
                    {groundTiles(g, viewport).map((i) => (
                      <Group key={i} transform={tileTransform(i, 240)}>
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
                    ))}
                  </Group>
                ))}
              {rightLimit(p.progress) < 7988 &&
                inView(rightLimit(p.progress), 52) && (
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
              {activePlatforms(p.progress)
                .filter((r) =>
                  inView(
                    r.x - (r.move?.amplitude ?? 0),
                    r.w + 2 * (r.move?.amplitude ?? 0),
                  ),
                )
                .map((r) => (
                  <Ledge key={r.id} r={r} time={p.simulation} image={terrain} />
                ))}
              <WorldDecor viewport={viewport} />
              {hazards
                .filter((h) => inView(h.x, h.w))
                .map((h) => (
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
                        <RegisteredSprite image={pickupArt} data={art.pickups} frame={pickupFrames[o.id] ?? 9} size={o.id==="lever"?24:21} center />
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
                    const speaker: Speaker = o.id.startsWith("guide")
                      ? "guide"
                      : o.id === "helper" ? "ranger"
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
                          o.id==="helper" ? "locals" : ["walker", "lamp2", "keeper"].includes(o.id)
                            ? "cast"
                            : "npcs"
                        }
                        index={
                          speaker === "guide"
                            ? 0
                            : speaker === "traveler"
                              ? 4
                              : speaker === "secondary"
                                ? 6
                                : speaker === "keeper"
                                  ? 12
                                  : 0
                        }
                        x={o.x + 24}
                        time={p.time}
                        reduced={p.reducedMotion}
                        talking={p.talking === speaker}
                        speechAt={p.speechAt}
                        work={p.branchProgress}
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
                  if (o.id === "branch") return <BranchClearance key={o.id} progress={p.branchProgress} reduced={p.reducedMotion} />;
                  if (["lamp1", "mist_beacon"].includes(o.id)) return <RepairLamp key={o.id} image={props} x={o.x} y={o.y} lit={hasMission(p.progress,o.id==="lamp1"?9:12)} repair={p.repair} clock={p.simulation} reduced={p.reducedMotion} />;
                  if (
                    ["sign1", "bridge", "no_return"].includes(o.id)
                  )
                    return (
                      <Group
                        key={o.id}
                        transform={[{ translateX: o.x }, { translateY: o.y }]}
                      >
                        <RegisteredSprite image={decorArt} data={art.decor} frame={6} height={32} />
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
              {inView(destination.x, 20) && <Group transform={[{translateX:destination.x},{translateY:Math.min(173,destination.y-18)}]}>
                <Path path="M 0 0 L -4 -7 L 4 -7 Z" color="#ffe5a0" />
                <Circle cx={0} cy={-10} r={2} color="#fff2d0" />
              </Group>}
              {inView(7890, 35) && <Group transform={[{translateX:7890},{translateY:226}]}><ForestProp image={props} index={0} height={28} /></Group>}
              {/* Both farols remain visible when their speakers move on. */}
              {inView(4905,45) && <RepairLamp image={props} x={4905} lit={hasMission(p.progress,11)} repair={p.repair} clock={p.simulation} reduced={p.reducedMotion} />}
              <Companion {...p} />
              <Group transform={hero}>
                <AnimatedCharacter
                  kind={p.talking?"heroTalk":"hero"}
                  frame={p.talking?heroSpeech:frame}
                  direction={heroFacing}
                  height={44}
                />
                {p.talking==="hero" && <SpeechMarker time={p.time} reduced={p.reducedMotion} />}
                {p.progress.decisions.CH1_05==="lever" && <Group opacity={leverOpacity} transform={[{translateX:12},{translateY:-18},{rotate:.4}]}><RegisteredSprite image={pickupArt} data={art.pickups} frame={4} size={20} center /></Group>}
              </Group>
              <PickupBurst
                time={p.time}
                origin={p.pickup}
                reduced={p.reducedMotion}
              />
            </Group>
            {nearMist && <MistForeground position={p.x} time={p.time} reduced={p.reducedMotion} oriented={hasMission(p.progress,13)} />}
        </>
        <PlaceAtmosphere camera={p.camera} time={p.time} reduced={p.reducedMotion} />
      </Group>
    </Canvas>
  );
}
