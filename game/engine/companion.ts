import { hasMission, type Progress } from "../missions/progress.ts";
export type TrailPoint = { x: number; y: number; grounded: boolean; support?: string | null };
/** The traveler joins at the bridge and stays on that shared route, not in earlier zones. */
export function companionPresent(progress: Progress, x: number) {
  return hasMission(progress, 7) && x >= 3000;
}
/** Follow the actual traversed route. Never snap to an unrelated overhead platform. */
export class CompanionTrail {
  x = 3100;
  y = 226;
  grounded = true;
  support: string | null = null;
  moving = false;
  falling = false;
  facing = 1;
  landing = 0;
  private points: TrailPoint[] = [];
  private length = 0;
  reset(point: TrailPoint) {
    this.x = point.x; this.y = point.y; this.grounded = point.grounded; this.support = point.support ?? null;
    this.points = []; this.length = 0;
    this.moving = false; this.falling = false; this.landing = 0;
  }
  /** Carry both the waiting actor and recorded landings with their actual support. */
  carryPlatform(id: string, dx: number, dy: number) {
    if (this.grounded && this.support === id) { this.x += dx; this.y += dy; }
    for (const point of this.points) {
      if (point.grounded && point.support === id) { point.x += dx; point.y += dy; }
    }
    let previous: TrailPoint = this;
    this.length = 0;
    for (const point of this.points) {
      this.length += Math.hypot(point.x - previous.x, point.y - previous.y);
      previous = point;
    }
  }
  step(dt: number, hero: TrailPoint) {
    const last = this.points.at(-1) ?? this;
    const distance = Math.hypot(hero.x - last.x, hero.y - last.y);
    if (distance > .001 || hero.grounded !== last.grounded || (hero.support ?? null) !== (last.support ?? null)) {
      this.points.push({ ...hero }); this.length += distance;
    }
    this.landing = Math.max(0, this.landing - dt);
    const oldX = this.x, oldY = this.y;
    let budget = Math.min(380, 155 + Math.max(0, this.length - 90) * 2) * dt;
    // Grounded followers keep a personal space. Once airborne, finish the jump.
    while (this.points.length && budget > 0) {
      if (this.grounded && hero.grounded && this.length <= 36) break;
      const next = this.points[0];
      const distance = Math.hypot(next.x - this.x, next.y - this.y);
      const travel = Math.min(budget, distance);
      if (distance > .0001) {
        this.x += (next.x - this.x) * travel / distance;
        this.y += (next.y - this.y) * travel / distance;
        this.length = Math.max(0, this.length - travel);
        budget -= travel;
      }
      if (distance <= travel + .0001) {
        const landed = !this.grounded && next.grounded;
        this.grounded = next.grounded;
        this.support = next.support ?? null;
        if (landed) this.landing = .14;
        this.points.shift();
      } else this.grounded = this.grounded && next.grounded && Math.abs(this.y - next.y) < .01;
    }
    this.moving = Math.abs(this.x - oldX) > dt * 3;
    this.falling = this.y > oldY + .001;
    if (this.moving) this.facing = this.x > oldX ? 1 : -1;
  }
}
