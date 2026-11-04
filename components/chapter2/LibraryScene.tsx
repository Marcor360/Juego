import React from "react";
import { Asset } from "expo-asset";
import {
  Canvas,
  Atlas,
  Group,
  Rect,
  Circle,
  Image,
  useImage,
  useRSXformBuffer,
  LinearGradient,
  vec,
  Skia,
  FillType,
  Path,
  type SkImage,
} from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import manifest from "../../game/chapter2/art/manifest.json";
import type { LibraryWorld } from "../../game/chapter2/engine/world";
import { rooms, type RoomId } from "../../game/chapter2/maps/library";
export type SceneFrame = {
  x: number;
  y: number;
  cx: number;
  cy: number;
  time: number;
  direction: number;
  moving: boolean;
  actors: {
    id: string;
    x: number;
    y: number;
    moving: boolean;
    left: boolean;
  }[];
};
export type LibrarySceneProps = {
  width: number;
  height: number;
  room: RoomId;
  frame: SharedValue<SceneFrame>;
  order: string[];
  flags: string[];
  completed: number;
  reducedMotion: boolean;
  action: number;
};
const sources = {
  hero: require("../../assets/chapter2/characters/hero.png"),
  actions: require("../../assets/chapter2/characters/actions.png"),
  npcs: require("../../assets/chapter2/characters/npcs.png"),
  citizens: require("../../assets/chapter2/characters/citizens.png"),
  furniture: require("../../assets/chapter2/props/furniture.png"),
  objects: require("../../assets/chapter2/props/objects.png"),
  tiles: require("../../assets/chapter2/tilesets/library.png"),
};
type AtlasName = keyof typeof sources;
type Images = Record<AtlasName, SkImage | null>;
function useLibraryImages(): Images {
  const hero = useImage(Asset.fromModule(sources.hero).uri),
    actions = useImage(Asset.fromModule(sources.actions).uri),
    npcs = useImage(Asset.fromModule(sources.npcs).uri),
    citizens = useImage(Asset.fromModule(sources.citizens).uri),
    furniture = useImage(Asset.fromModule(sources.furniture).uri),
    objects = useImage(Asset.fromModule(sources.objects).uri),
    tiles = useImage(Asset.fromModule(sources.tiles).uri);
  return { hero, actions, npcs, citizens, furniture, objects, tiles };
}
const sampling = { filter: 0, mipmap: 0 } as const;
function Prop({
  images,
  atlas,
  index,
  x,
  y,
  w,
  h,
  frame,
}: {
  images: Images;
  atlas: AtlasName;
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  frame?: SharedValue<SceneFrame>;
}) {
  const img = images[atlas],
    f = manifest[atlas].frames[index],
    scale = Math.min(w / f.width, h / f.height);
  const transforms = useRSXformBuffer(1, (v) => {
    "worklet";
    v.set(scale, 0, x - (f.width * scale) / 2, y - f.height * scale);
  });
  const opacity = useDerivedValue(() => {
    if (!frame) return 1;
    const hero = frame.value;
    return hero.y < y && hero.y > y - h && Math.abs(hero.x - x) < w / 2
      ? 0.45
      : 1;
  });
  return img ? (
    <Group opacity={opacity}>
      <Atlas
        image={img}
        sprites={[f]}
        transforms={transforms}
        sampling={sampling}
      />
    </Group>
  ) : null;
}
function Character({
  images,
  id,
  room,
  frame,
  action,
  reducedMotion,
}: {
  images: Images;
  id: string;
  room: RoomId;
  frame: SharedValue<SceneFrame>;
  action: number;
  reducedMotion: boolean;
}) {
  const actor = rooms[room].actors.find((a) => a.id === id),
    hero = id === "hero",
    atlas: AtlasName = hero
      ? action >= 0
        ? "actions"
        : "hero"
      : actor?.ambient
        ? "citizens"
        : "npcs",
    image = images[atlas],
    frames = manifest[atlas].frames;
  const sprite = useDerivedValue(() => {
    const t = frame.value,
      entity = t.actors.find((a) => a.id === id);
    let idx = 0;
    if (hero)
      idx =
        action >= 0
          ? action
          : t.direction * 6 + (t.moving ? Math.floor(t.time * 8) % 6 : 0);
    else {
      const cols = actor?.ambient ? 4 : 6,
        row = entity?.moving
          ? (Math.floor(t.time * 5) % 2) + 1
          : actor?.activity === "read" || actor?.activity === "talk"
            ? reducedMotion ||
              Math.floor(t.time / 4 + (actor?.column ?? 0)) % 4 !== 0
              ? 3
              : 0
            : !reducedMotion &&
                Math.floor(t.time / 5 + (actor?.column ?? 0)) % 5 === 0
              ? 3
              : 0;
      idx = row * cols + (actor?.column ?? 0);
    }
    return [frames[idx]];
  }, [atlas, actor, action, reducedMotion]);
  const trans = useRSXformBuffer(1, (v) => {
    "worklet";
    const t = frame.value,
      entity = t.actors.find((a) => a.id === id),
      f = sprite.value[0],
      scale = 38 / f.height,
      left = !hero && entity?.left,
      x = hero ? t.x : (entity?.x ?? actor?.x ?? 0),
      y = hero ? t.y : (entity?.y ?? actor?.y ?? 0),
      bob =
        !reducedMotion && !(hero ? t.moving : entity?.moving)
          ? Math.sin(t.time * 1.6 + (actor?.column ?? 0)) * 0.35
          : 0;
    v.set(
      left ? -scale : scale,
      0,
      x + ((left ? 1 : -1) * f.width * scale) / 2,
      y - f.height * scale + bob,
    );
  });
  const shadowX = useDerivedValue(() =>
    id === "hero"
      ? frame.value.x
      : (frame.value.actors.find((a) => a.id === id)?.x ?? 0),
  );
  const shadowY = useDerivedValue(() =>
    id === "hero"
      ? frame.value.y - 1
      : (frame.value.actors.find((a) => a.id === id)?.y ?? 0) - 1,
  );
  return (
    <>
      <Circle cx={shadowX} cy={shadowY} r={8} color="#211b3329" />
      {image && (
        <Atlas
          image={image}
          sprites={sprite}
          transforms={trans}
          sampling={sampling}
        />
      )}
    </>
  );
}
function Floor({ room, image }: { room: RoomId; image: SkImage | null }) {
  const r = rooms[room],
    size = 48,
    tiles = Array.from(
      { length: Math.ceil(r.w / size) * Math.ceil(r.h / size) },
      (_, i) => ({
        x: (i % Math.ceil(r.w / size)) * size,
        y: Math.floor(i / Math.ceil(r.w / size)) * size,
      }),
    ),
    source = manifest.tiles.frames[r.tile],
    sprites = tiles.map(() => source),
    trans = useRSXformBuffer(tiles.length, (v, i) => {
      "worklet";
      v.set(size / source.width, 0, tiles[i].x, tiles[i].y);
    });
  return image ? (
    <Atlas
      image={image}
      sprites={sprites}
      transforms={trans}
      sampling={sampling}
    />
  ) : null;
}
function BalconyView() {
  const image = useImage(
    Asset.fromModule(require("../../assets/chapter2/props/balcony-view.png"))
      .uri,
  );
  return image ? (
    <Image
      image={image}
      x={0}
      y={0}
      width={640}
      height={180}
      fit="cover"
      sampling={sampling}
    />
  ) : null;
}
function Facade() {
  const image = useImage(
    Asset.fromModule(require("../../assets/chapter2/props/facade.png")).uri,
  );
  return image ? (
    <Image
      image={image}
      x={50}
      y={0}
      width={540}
      height={180}
      fit="contain"
      sampling={sampling}
    />
  ) : null;
}
export default function LibraryScene({
  width,
  height,
  room,
  frame,
  order,
  flags,
  completed,
  reducedMotion,
  action,
}: LibrarySceneProps) {
  const images = useLibraryImages();
  const r = rooms[room],
    scale = width / 480,
    transform = useDerivedValue(() => [
      { translateX: -frame.value.cx },
      { translateY: -frame.value.cy },
    ]);
  const walls = Array.from({ length: Math.ceil(r.w / 64) }, (_, i) => i * 64);
  const shade = useDerivedValue(() =>
    room === "dark" && !flags.includes("lights_on") ? 0.77 : 0,
  );
  const darkness = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.addRect({ x: 0, y: 0, width: r.w, height: r.h });
    if (flags.includes("lantern_equipped"))
      p.addCircle(frame.value.x, frame.value.y - 12, 65);
    p.setFillType(FillType.EvenOdd);
    return p;
  });
  const lightX = useDerivedValue(() => frame.value.x),
    lightY = useDerivedValue(() => frame.value.y - 12);
  return (
    <Canvas style={{ width, height, position: "absolute" }}>
      <Group transform={[{ scale }]}>
        <Group transform={transform}>
          <Floor room={room} image={images.tiles} />
          {[
            "vestibule",
            "catalogue",
            "research",
            "visitors",
            "quiet",
            "landing",
          ].includes(room) && (
            <Prop
              images={images}
              atlas="tiles"
              index={2}
              x={r.w / 2}
              y={r.h * 0.76}
              w={130}
              h={130}
            />
          )}
          {room === "balcony" && (
            <>
              <BalconyView />
              {walls.map((x) => (
                <Prop
                  images={images}
                  key={x}
                  atlas="tiles"
                  index={5}
                  x={x + 32}
                  y={183}
                  w={64}
                  h={64}
                />
              ))}
            </>
          )}
          {room !== "courtyard" &&
            room !== "balcony" &&
            walls.map((x) => (
              <Prop
                images={images}
                key={x}
                atlas="tiles"
                index={3}
                x={x + 32}
                y={80}
                w={64}
                h={80}
              />
            ))}
          {room === "courtyard" && <Facade />}
          {r.doors
            .filter((d) => !(room === "courtyard" && d.id === "front"))
            .map((d) => (
              <Prop
                images={images}
                key={d.id}
                atlas={d.floor ? "furniture" : "objects"}
                index={
                  d.floor ? 4 : !d.required || completed >= d.required ? 1 : 0
                }
                x={d.x}
                y={d.y + 5}
                w={d.floor ? 38 : 30}
                h={d.floor ? 38 : 48}
              />
            ))}
          {r.interactions
            .filter((o) => !o.scene)
            .map((o) => (
              <Prop
                images={images}
                key={o.id}
                atlas="objects"
                index={
                  flags.includes(o.flag ?? o.id)
                    ? 5
                    : o.kind === "mechanism"
                      ? 6
                      : 4
                }
                x={o.x}
                y={o.y}
                w={o.kind === "mechanism" ? 14 : 15}
                h={16}
              />
            ))}
          {order.map((id) => {
            const p = r.furniture.find((p) => p.id === id);
            return p ? (
              p.kind === "facade" ? null : (
                <Prop
                  images={images}
                  key={id}
                  atlas={p.kind === "object" ? "objects" : "furniture"}
                  index={
                    p.kind === "object" && completed === 16
                      ? 3
                      : (p.frame ?? p.art)
                  }
                  x={p.x}
                  y={p.y}
                  w={p.w}
                  h={p.h}
                  frame={frame}
                />
              )
            ) : (
              <Character
                images={images}
                key={id}
                id={id}
                room={room}
                frame={frame}
                action={action}
                reducedMotion={reducedMotion}
              />
            );
          })}
          {(r.hazards ?? []).map((h) => (
            <MovingCart images={images} key={h.id} hazard={h} frame={frame} />
          ))}
          <Group opacity={shade}>
            <Path path={darkness} color="#16182e" />
          </Group>
          {room === "dark" &&
            flags.includes("lantern_equipped") &&
            !flags.includes("lights_on") && (
              <Circle cx={lightX} cy={lightY} r={50} color="#ffdc8b36" />
            )}
        </Group>
      </Group>
    </Canvas>
  );
}
function MovingCart({
  images,
  hazard: h,
  frame,
}: {
  images: Images;
  hazard: { x: number; y: number; amplitude: number; period: number };
  frame: SharedValue<SceneFrame>;
}) {
  const image = images.furniture,
    f = manifest.furniture.frames[6],
    s = 30 / f.height,
    trans = useRSXformBuffer(1, (v) => {
      "worklet";
      v.set(
        s,
        0,
        h.x +
          Math.sin((frame.value.time * Math.PI * 2) / h.period) * h.amplitude -
          (f.width * s) / 2,
        h.y - f.height * s,
      );
    });
  return image ? (
    <Atlas image={image} sprites={[f]} transforms={trans} sampling={sampling} />
  ) : null;
}
