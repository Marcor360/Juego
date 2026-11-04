import React from "react";
import { Asset } from "expo-asset";
import manifest from "../manifest.json";
import {
  Canvas,
  Rect,
  Group,
  Path,
  Skia,
  Circle,
  Image,
  useImage,
  LinearGradient,
  vec,
  Picture,
  createPicture,
  type SkPicture,
} from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
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
const polygon = (points: number[][]) => {
  const p = Skia.Path.Make();
  points.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  p.close();
  return p;
};
const treePictures = new Map<boolean, SkPicture>();
function Tree({
  x,
  y = 226,
  scale = 1,
  back = false,
}: {
  x: number;
  y?: number;
  scale?: number;
  back?: boolean;
}) {
  let picture = treePictures.get(back);
  if (!picture) {
    picture = createPicture(
      (canvas) => {
        const c = back
          ? ["#3d7776", "#407f75", "#599a7e"]
          : ["#214d4a", "#2d6553", "#478159"];
        const paint = Skia.Paint();
        paint.setAntiAlias(false);
        const rect = (
          x: number,
          y: number,
          w: number,
          h: number,
          color: string,
          alpha = 1,
        ) => {
          paint.setColor(Skia.Color(color));
          paint.setAlphaf(alpha);
          canvas.drawRect(Skia.XYWHRect(x, y, w, h), paint);
        };
        rect(-8, -185, 19, 190, back ? "#3c6864" : "#514b45");
        rect(-5, -172, 5, 172, back ? "#547a70" : "#80674f");
        paint.setColor(Skia.Color(back ? "#3c6864" : "#514b45"));
        canvas.drawPath(
          polygon([
            [-5, -115],
            [-50, -151],
            [-52, -161],
            [4, -135],
            [48, -179],
            [54, -171],
            [10, -110],
          ]),
          paint,
        );
        for (const j of [-1, 0, 1]) {
          rect(-67 + j * 26, -205 - Math.abs(j) * 9, 98, 37, c[0]);
          rect(-80 + j * 36, -181 - Math.abs(j) * 10, 90, 31, c[1]);
          rect(-62 + j * 36, -183 - Math.abs(j) * 10, 48, 8, c[2]);
        }
        for (let i = 0; i < 55; i++)
          rect(
            -88 + ((i * 37) % 163),
            -214 + ((i * 19) % 65),
            4 + (i % 4) * 3,
            3 + (i % 3) * 2,
            c[i % 3],
            0.8,
          );
        rect(-14, -3, 34, 6, c[1]);
        paint.dispose();
      },
      Skia.XYWHRect(-125, -230, 250, 240),
    );
    treePictures.set(back, picture);
  }
  return (
    <Group transform={[{ translateX: x }, { translateY: y }, { scale }]}>
      <Picture picture={picture} />
    </Group>
  );
}
function Flowers({ length = 480 }: { length?: number }) {
  return (
    <>
      {Array.from({ length: Math.floor(length / 19) }, (_, i) => {
        const x = i * 19 + ((i * 7) % 13),
          y = 231 + ((i * 13) % 31);
        return (
          <Group key={i}>
            <Rect x={x} y={y} width={2} height={9} color="#49724f" />
            <Rect
              x={x - 2}
              y={y}
              width={6}
              height={4}
              color={["#edb6ce", "#f5ddae", "#bca8d6"][i % 3]}
            />
            <Rect x={x} y={y + 1} width={2} height={2} color="#fff0bc" />
          </Group>
        );
      })}
    </>
  );
}
export default function Scene(p: SceneProps) {
  const cell = manifest.animations.idle_right;
  const idle = useImage(
    Asset.fromModule(require("../assets/sheets/idle_right.png")).uri,
  );
  const walk = useImage(
    Asset.fromModule(require("../assets/sheets/walk_right.png")).uri,
  );
  const left = useImage(
    Asset.fromModule(require("../assets/sheets/walk_left.png")).uri,
  );
  const jump = useImage(
    Asset.fromModule(require("../assets/sheets/jump_right.png")).uri,
  );
  const celebrate = useImage(
    Asset.fromModule(require("../assets/sheets/celebrate.png")).uri,
  );
  const talk = useImage(
    Asset.fromModule(require("../assets/sheets/talk.png")).uri,
  );
  const open = useImage(
    Asset.fromModule(require("../assets/sheets/open_chest.png")).uri,
  );
  const receive = useImage(
    Asset.fromModule(require("../assets/sheets/receive_fe.png")).uri,
  );
  const meta = [
    cell,
    manifest.animations.walk_right,
    manifest.animations.jump_right,
    manifest.animations.talk,
    manifest.animations.open_chest,
    manifest.animations.receive_fe,
    manifest.animations.celebrate,
  ].map((a) => ({ count: a.framesCount, fps: a.fps, width: a.frameWidth / 4 }));
  const index = useDerivedValue(
    () =>
      p.action.value ||
      (Math.abs(p.motion.value) === 2
        ? 2
        : Math.abs(p.motion.value) === 1
          ? 1
          : 0),
  );
  const sprite = useDerivedValue(
    () =>
      p.action.value === 3
        ? talk
        : p.action.value === 4
          ? open
          : p.action.value === 5
            ? receive
            : p.action.value === 6
              ? celebrate
              : Math.abs(p.motion.value) === 2
                ? jump
                : p.motion.value < 0
                  ? left
                  : p.motion.value > 0
                    ? walk
                    : idle,
    [idle, walk, left, jump, talk, open, receive, celebrate],
  );
  const frameX = useDerivedValue(
    () =>
      (-Math.floor(p.time.value * meta[index.value].fps) %
        meta[index.value].count) *
      meta[index.value].width,
  );
  const sheetWidth = useDerivedValue(
    () => meta[index.value].count * meta[index.value].width,
  );
  const spriteClip = useDerivedValue(() => ({
    x: 0,
    y: 0,
    width: meta[index.value].width,
    height: 40,
  }));
  const world = useDerivedValue(() => [{ translateX: -p.camera.value }]);
  const mid = useDerivedValue(() => [{ translateX: -p.camera.value * 0.45 }]);
  const far = useDerivedValue(() => [{ translateX: -p.camera.value * 0.16 }]);
  const hero = useDerivedValue(() => [
    { translateX: p.menu ? 75 : p.x.value - meta[index.value].width / 2 },
    { translateY: p.menu ? 100 : p.y.value - 38 },
  ]);
  const leaf = useDerivedValue(() => [
    { translateX: p.reducedMotion ? 0 : Math.sin(p.time.value * 0.7) * 3 },
    { translateY: p.reducedMotion ? 0 : Math.sin(p.time.value) * 2 },
  ]);
  const glow = useDerivedValue(() =>
    p.reducedMotion ? 0.7 : 0.55 + Math.sin(p.time.value * 2) * 0.2,
  );
  return (
    <Canvas style={{ width: p.width, height: p.height }}>
      <Group transform={[{ scale: p.width / 480 }]}>
        <Rect x={0} y={0} width={480} height={270}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 270)}
            colors={
              p.menu
                ? ["#a39ad1", "#f3bdc5", "#fff0bc"]
                : ["#294d65", "#72a99b", "#bdd39d"]
            }
          />
        </Rect>
        <Circle
          cx={p.menu ? 365 : 290}
          cy={82}
          r={28}
          color={p.menu ? "#ffe7ac" : "#dcdfad"}
          opacity={0.8}
        />
        <Group transform={far}>
          {Array.from({ length: p.menu ? 5 : 15 }, (_, i) => (
            <Path
              key={i}
              path={polygon([
                [i * 160 - 70, 180],
                [i * 160 + 70, 69 + (i % 3) * 16],
                [i * 160 + 220, 180],
              ])}
              color={i % 2 ? "#8d91b1" : "#7e90a3"}
            />
          ))}
        </Group>
        <Group opacity={0.08}>
          <Path
            path={polygon([
              [250, 0],
              [275, 0],
              [145, 226],
              [80, 226],
            ])}
            color="#ffedb1"
          />
          <Path
            path={polygon([
              [290, 0],
              [302, 0],
              [250, 226],
              [200, 226],
            ])}
            color="#ffedb1"
          />
        </Group>
        <Group transform={mid}>
          {Array.from({ length: p.menu ? 3 : 32 }, (_, i) => (
            <Tree
              key={i}
              x={p.menu ? i * 100 - 90 : i * 100}
              y={219}
              scale={0.6 + (i % 3) * 0.17}
              back
            />
          ))}
        </Group>
        {p.menu ? (
          <>
            <Path
              path={polygon([
                [0, 211],
                [102, 163],
                [207, 181],
                [298, 157],
                [480, 172],
                [480, 270],
                [0, 270],
              ])}
              color="#758d68"
            />
            <Path
              path={polygon([
                [145, 270],
                [226, 220],
                [342, 188],
                [322, 182],
                [378, 164],
                [370, 168],
                [347, 183],
                [363, 190],
                [252, 225],
                [209, 270],
              ])}
              color="#e8c596"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <Group key={i}>
                <Rect
                  x={275 + i * 26}
                  y={176 - (i % 2) * 8}
                  width={19}
                  height={18}
                  color="#efc6a0"
                />
                <Path
                  path={polygon([
                    [271 + i * 26, 176 - (i % 2) * 8],
                    [285 + i * 26, 165 - (i % 2) * 8],
                    [298 + i * 26, 176 - (i % 2) * 8],
                  ])}
                  color="#ab7185"
                />
                <Rect
                  x={281 + i * 26}
                  y={182 - (i % 2) * 8}
                  width={4}
                  height={6}
                  color="#ffe2a0"
                />
              </Group>
            ))}
            <Group transform={leaf}>
              <Tree x={-5} y={270} scale={1.65} />
            </Group>
            <Flowers />
            <Group
              transform={[
                { translateX: 25 },
                { translateY: 95 },
                { scale: 4.4 },
              ]}
              clip={{ x: 0, y: 0, width: 32, height: 40 }}
            >
              <Image
                image={idle}
                x={0}
                y={0}
                width={cell.framesCount * 32}
                height={(cell.frameHeight / cell.frameWidth) * 32}
                fit="fill"
                sampling={{ filter: 0, mipmap: 0 }}
              />
            </Group>
          </>
        ) : (
          <>
            <Group transform={world}>
              {Array.from({ length: 29 }, (_, i) => (
                <Tree key={i} x={i * 135 + 20} scale={0.85 + (i % 3) * 0.13} />
              ))}
              {[780, 1930].map((x) => (
                <Group key={x}>
                  <Rect
                    x={x}
                    y={100}
                    width={35}
                    height={126}
                    color="#a5dcd1"
                    opacity={0.7}
                  />
                  <Rect
                    x={x + 8}
                    y={100}
                    width={5}
                    height={126}
                    color="#e3f2d2"
                    opacity={0.7}
                  />
                  <Rect
                    x={x - 14}
                    y={219}
                    width={65}
                    height={7}
                    color="#73b8b5"
                  />
                </Group>
              ))}
              <Rect x={0} y={226} width={3300} height={44} color="#524e45" />
              <Rect x={0} y={226} width={3300} height={5} color="#a5b66e" />
              <Rect x={0} y={231} width={3300} height={4} color="#698452" />
              {Array.from({ length: 120 }, (_, i) => (
                <Rect
                  key={i}
                  x={i * 29}
                  y={239 + (i % 4) * 6}
                  width={14 + (i % 3) * 3}
                  height={3}
                  color={i % 2 ? "#6e6450" : "#797156"}
                />
              ))}
              <Flowers length={3300} />
              {platforms.map((r, i) => (
                <Group key={i}>
                  <Rect
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    color="#747968"
                  />
                  <Rect
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={4}
                    color="#b4c37a"
                  />
                  <Rect
                    x={r.x + 5}
                    y={r.y + 7}
                    width={r.w - 12}
                    height={3}
                    color="#969b7a"
                  />
                </Group>
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
                        <Group opacity={glow}>
                          <Circle
                            cx={0}
                            cy={-3}
                            r={12}
                            color="#ffdc8e"
                            opacity={0.2}
                          />
                          <Path
                            path={polygon([
                              [0, -10],
                              [5, -3],
                              [0, 5],
                              [-5, -3],
                            ])}
                            color="#ffe7a1"
                          />
                        </Group>
                      )
                    ) : o.kind === "lamp" ? (
                      <>
                        <Rect
                          x={-2}
                          y={-41}
                          width={4}
                          height={41}
                          color="#695f55"
                        />
                        <Rect
                          x={-7}
                          y={-46}
                          width={14}
                          height={14}
                          color={active ? "#ffda88" : "#555b5e"}
                        />
                        {active && (
                          <Circle
                            cx={0}
                            cy={-39}
                            r={25}
                            color="#ffe29a"
                            opacity={0.17}
                          />
                        )}
                      </>
                    ) : o.kind === "chest" ? (
                      <>
                        <Rect
                          x={-14}
                          y={-19}
                          width={28}
                          height={19}
                          color="#976744"
                        />
                        <Rect
                          x={-14}
                          y={-19}
                          width={28}
                          height={5}
                          color="#d2aa67"
                        />
                        <Rect
                          x={-2}
                          y={-13}
                          width={4}
                          height={7}
                          color="#f9d98d"
                        />
                      </>
                    ) : o.kind === "riddle" ? (
                      <>
                        <Rect
                          x={-17}
                          y={-39}
                          width={34}
                          height={39}
                          color="#789084"
                        />
                        <Rect
                          x={-12}
                          y={-33}
                          width={24}
                          height={3}
                          color="#d6d6ac"
                        />
                        <Rect
                          x={-10}
                          y={-26}
                          width={20}
                          height={3}
                          color="#a9bd9a"
                        />
                      </>
                    ) : (
                      <>
                        <Rect
                          x={-9}
                          y={-28}
                          width={18}
                          height={28}
                          color={o.kind === "guide" ? "#baabc9" : "#b99071"}
                        />
                        <Rect
                          x={-6}
                          y={-39}
                          width={12}
                          height={12}
                          color="#ebc6a2"
                        />
                        <Rect
                          x={-7}
                          y={-43}
                          width={14}
                          height={7}
                          color={o.kind === "guide" ? "#c6c5bc" : "#5d514c"}
                        />
                        <Rect
                          x={-2}
                          y={-53}
                          width={4}
                          height={5}
                          color="#ffe3a1"
                        />
                      </>
                    )}
                  </Group>
                );
              })}
              {p.progress.lamps.length < 2 && (
                <Rect
                  x={1430}
                  y={65}
                  width={22}
                  height={161}
                  color="#b5b4cf"
                  opacity={0.8}
                />
              )}
              {!p.progress.riddle && (
                <Rect
                  x={2550}
                  y={65}
                  width={22}
                  height={161}
                  color="#b5b4cf"
                  opacity={0.8}
                />
              )}
              <Group transform={hero}>
                <Group clip={spriteClip}>
                  <Image
                    image={sprite}
                    x={frameX}
                    y={0}
                    width={sheetWidth}
                    height={40}
                    fit="fill"
                    sampling={{ filter: 0, mipmap: 0 }}
                  />
                </Group>
              </Group>
            </Group>
            <Group opacity={glow}>
              {Array.from({ length: 22 }, (_, i) => (
                <Rect
                  key={i}
                  x={(i * 73) % 480}
                  y={60 + ((i * 37) % 155)}
                  width={1.5}
                  height={1.5}
                  color="#fbeab0"
                />
              ))}
            </Group>
          </>
        )}
      </Group>
    </Canvas>
  );
}
