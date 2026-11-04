import { GROUND, WIDTH, platforms, objects } from "../levels/forest.ts";
import { freshProgress, type Progress } from "../missions/progress.ts";
export class World {
  x = 65;
  y = GROUND;
  vy = 0;
  camera = 0;
  grounded = true;
  facing = 1;
  moving = false;
  time = 0;
  input = { left: false, right: false, jump: false };
  progress: Progress = freshProgress();
  step(dt: number) {
    dt = Math.min(dt, 1 / 30);
    this.time += dt;
    const dx = (Number(this.input.right) - Number(this.input.left)) * 85 * dt;
    this.moving = dx !== 0;
    if (dx) this.facing = dx > 0 ? 1 : -1;
    if (this.input.jump && this.grounded) {
      this.vy = -215;
      this.grounded = false;
    }
    this.input.jump = false;
    const solids = [...platforms];
    if (this.progress.lamps.length < 2)
      solids.push({ x: 1430, y: 70, w: 16, h: 156 });
    if (!this.progress.riddle) solids.push({ x: 2550, y: 70, w: 16, h: 156 });
    let nx = Math.max(12, Math.min(WIDTH - 12, this.x + dx));
    for (const r of solids)
      if (
        this.y > r.y + 1 &&
        this.y - 39 < r.y + r.h &&
        nx + 10 > r.x &&
        nx - 10 < r.x + r.w
      )
        nx = dx > 0 ? r.x - 10 : r.x + r.w + 10;
    this.x = nx;
    const oldY = this.y;
    this.vy += 570 * dt;
    let ny = this.y + this.vy * dt;
    this.grounded = false;
    for (const r of solids) {
      if (this.x + 9 > r.x && this.x - 9 < r.x + r.w) {
        if (this.vy >= 0 && oldY <= r.y + 0.1 && ny >= r.y) {
          ny = r.y;
          this.vy = 0;
          this.grounded = true;
        } else if (
          this.vy < 0 &&
          oldY - 39 >= r.y + r.h &&
          ny - 39 < r.y + r.h
        ) {
          ny = r.y + r.h + 39;
          this.vy = 0;
        }
      }
    }
    if (ny >= GROUND) {
      ny = GROUND;
      this.vy = 0;
      this.grounded = true;
    }
    this.y = ny;
    const target = Math.max(0, Math.min(WIDTH - 480, this.x - 180));
    this.camera += (target - this.camera) * (1 - Math.exp(-7 * dt));
  }
  restore(checkpoint: number) {
    this.x = checkpoint;
    this.y = Math.min(
      GROUND,
      ...platforms
        .filter((r) => checkpoint + 9 > r.x && checkpoint - 9 < r.x + r.w)
        .map((r) => r.y),
    );
    this.vy = 0;
    this.grounded = true;
    this.camera = Math.max(0, Math.min(WIDTH - 480, this.x - 180));
    this.release();
  }
  nearby() {
    return objects.find(
      (o) => Math.abs(o.x - this.x) < 35 && Math.abs(o.y - this.y) < 48,
    );
  }
  release() {
    this.input = { left: false, right: false, jump: false };
    this.moving = false;
  }
}
