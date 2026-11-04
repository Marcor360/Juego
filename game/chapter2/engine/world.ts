import {
  rooms,
  isWalkable,
  type RoomId,
  type Direction,
  type Actor,
} from "../maps/library.ts";
import {
  freshLibrary,
  hasScene,
  addFlag,
  type LibraryState,
  activeScene,
} from "../state.ts";
export type LibraryEvent = {
  type: "progress" | "transition" | "damage" | "hint";
  text?: string;
};
export class LibraryWorld {
  state: LibraryState;
  input = { up: false, down: false, left: false, right: false };
  cameraX = 0;
  cameraY = 0;
  moving = false;
  invulnerable = 0;
  events: LibraryEvent[] = [];
  actors: Actor[] = [];
  private actorPaths: Record<string, { index: number; wait: number }> = {};
  constructor(state = freshLibrary()) {
    this.state = JSON.parse(JSON.stringify(state));
    this.restore(this.state.room, this.state.x, this.state.y);
    if (this.state.board?.status === "running")
      this.state.board.status = "paused";
  }
  get room() {
    return rooms[this.state.room];
  }
  flag(id: string) {
    if (!this.state.flags.includes(id)) {
      addFlag(this.state, id);
      this.events.push({ type: "progress" });
    }
  }
  private rememberActors() {
    for (const a of this.actors) {
      const r = this.actorPaths[a.id] ?? { index: 0, wait: 0 };
      this.state.actorMemory[`${this.state.room}:${a.id}`] = {
        x: a.x,
        y: a.y,
        index: r.index,
        wait: Math.max(0, r.wait),
        left:
          this.state.actorMemory[`${this.state.room}:${a.id}`]?.left ?? false,
      };
    }
  }
  restore(room: RoomId, x: number, y: number) {
    this.rememberActors();
    this.state.room = room;
    this.state.floor = rooms[room].floor;
    this.state.x = x;
    this.state.y = y;
    if (!this.state.discovered.includes(room)) this.state.discovered.push(room);
    this.cameraX = Math.max(0, Math.min(rooms[room].w - 480, x - 240));
    this.cameraY = Math.max(
      0,
      Math.min(
        rooms[room].h - 270,
        y - (room === "courtyard" || room === "balcony" ? 230 : 135),
      ),
    );
    this.actors = rooms[room].actors.map((a) => ({
      ...a,
      path: a.path?.map((p) => ({ ...p })),
    }));
    this.actorPaths = {};
    for (const a of this.actors) {
      const m = this.state.actorMemory[`${room}:${a.id}`];
      if (m) {
        a.x = m.x;
        a.y = m.y;
        this.actorPaths[a.id] = { index: m.index, wait: m.wait };
      }
    }
    this.release();
  }
  step(dt: number) {
    dt = Math.max(0, Math.min(dt, 1 / 30));
    this.state.worldTime += dt;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    let dx = Number(this.input.right) - Number(this.input.left),
      dy = Number(this.input.down) - Number(this.input.up);
    const length = Math.hypot(dx, dy);
    this.moving = length > 0;
    if (length) {
      dx = (dx / length) * 94 * dt;
      dy = (dy / length) * 94 * dt;
      const direction: Direction =
        Math.abs(dx) > Math.abs(dy)
          ? dx < 0
            ? "left"
            : "right"
          : dy < 0
            ? "up"
            : "down";
      this.state.direction = direction;
      this.flag("walk_" + direction);
      const x = this.state.x + dx,
        y = this.state.y + dy;
      const clear = (x: number, y: number) =>
        isWalkable(this.room, x, y) &&
        !this.actors.some(
          (a) =>
            Math.hypot(a.x - x, a.y - y) < 17 &&
            Math.hypot(a.x - x, a.y - y) <
              Math.hypot(a.x - this.state.x, a.y - this.state.y) + 0.0001,
        );
      if (clear(x, this.state.y)) this.state.x = x;
      if (clear(this.state.x, y)) this.state.y = y;
    }
    if (this.state.room === "vestibule") {
      if (this.state.x < 230 && this.state.y > 190 && this.state.y < 320)
        this.flag("table_west");
      if (this.state.x > 350 && this.state.y > 190 && this.state.y < 320)
        this.flag("table_east");
    }
    if (
      this.state.room === "dark" &&
      this.state.flags.includes("lantern_equipped")
    )
      for (const id of ["floor_mark_a", "floor_mark_b"]) {
        const mark = this.room.interactions.find((o) => o.id === id)!;
        if (Math.hypot(mark.x - this.state.x, mark.y - this.state.y) < 24)
          this.flag(id);
      }
    for (const actor of this.actors) {
      if (!actor.path?.length) continue;
      const runtime =
        this.actorPaths[actor.id] ??
        (this.actorPaths[actor.id] = { index: 0, wait: actor.column * 0.3 });
      runtime.wait -= dt;
      if (runtime.wait > 0) continue;
      const target = actor.path[runtime.index],
        vx = target.x - actor.x,
        vy = target.y - actor.y,
        d = Math.hypot(vx, vy);
      if (d < 3) {
        runtime.index = (runtime.index + 1) % actor.path.length;
        runtime.wait = 1.5 + actor.column * 0.25;
        continue;
      }
      const nx = actor.x + (vx / d) * 22 * dt,
        ny = actor.y + (vy / d) * 22 * dt;
      if (
        Math.hypot(nx - this.state.x, ny - this.state.y) < 28 ||
        !isWalkable(this.room, nx, ny, 7) ||
        this.actors.some(
          (other) =>
            other !== actor && Math.hypot(other.x - nx, other.y - ny) < 17,
        )
      ) {
        runtime.wait = 0.25;
        continue;
      }
      const key = `${this.state.room}:${actor.id}`,
        memory = this.state.actorMemory[key] ?? {
          x: actor.x,
          y: actor.y,
          index: runtime.index,
          wait: 0,
          left: false,
        };
      if (Math.abs(nx - actor.x) > 0.001) memory.left = nx < actor.x;
      this.state.actorMemory[key] = memory;
      actor.x = nx;
      actor.y = ny;
    }
    for (const h of this.room.hazards ?? []) {
      const hx =
        h.x +
        Math.sin((this.state.worldTime * Math.PI * 2) / h.period) * h.amplitude;
      if (Math.hypot(hx - this.state.x, h.y - this.state.y) < 22) this.damage();
    }
    if (this.state.room === "upper" && this.state.x > 600 && this.state.y < 230)
      this.flag("upper_route");
    this.cameraX +=
      (Math.max(0, Math.min(this.room.w - 480, this.state.x - 240)) -
        this.cameraX) *
      (1 - Math.exp(-dt * 7));
    this.cameraY +=
      (Math.max(
        0,
        Math.min(
          this.room.h - 270,
          this.state.y -
            (this.state.room === "courtyard" || this.state.room === "balcony"
              ? 230
              : 135),
        ),
      ) -
        this.cameraY) *
      (1 - Math.exp(-dt * 7));
  }
  nearby() {
    const candidates = [
      ...this.room.interactions.map((o) => ({ ...o, type: "object" as const })),
      ...this.room.doors.map((d) => ({
        ...d,
        type: "door" as const,
        label: d.label,
      })),
    ];
    return candidates
      .filter((o) => Math.hypot(o.x - this.state.x, o.y - this.state.y) < 41)
      .sort(
        (a, b) =>
          Math.hypot(a.x - this.state.x, a.y - this.state.y) -
          Math.hypot(b.x - this.state.x, b.y - this.state.y),
      )[0];
  }
  enter(id: string) {
    const d = this.room.doors.find((d) => d.id === id);
    if (!d) throw Error("Puerta desconocida.");
    if (
      (d.required && !hasScene(this.state, d.required)) ||
      (d.flag && !this.state.flags.includes(d.flag))
    )
      throw Error(
        "La puerta sigue cerrada. Consulta el objetivo de tu cuaderno.",
      );
    if (d.id === "to_landing") this.flag("upper_stairs");
    this.restore(d.to, d.spawn.x, d.spawn.y);
    this.events.push({
      type: "transition",
      text: "Entraste en " + this.room.name + ".",
    });
  }
  activate(id: string) {
    const object = this.room.interactions.find((o) => o.id === id);
    if (!object) throw Error("Objeto desconocido.");
    if (
      id === "book_lift" &&
      !["mechanism_a", "mechanism_b", "acts_card"].every((f) =>
        this.state.flags.includes(f),
      )
    )
      throw Error(
        "Activa ambos mecanismos y recupera la ficha antes de poner en marcha el elevador.",
      );
    if (
      id === "lights_on" &&
      !["lantern_equipped", "floor_mark_a", "floor_mark_b"].every((f) =>
        this.state.flags.includes(f),
      )
    )
      throw Error(
        "Equipa la linterna y observa las dos marcas del suelo antes de activar el interruptor.",
      );
    if (object.flag) this.flag(object.flag);
  }
  damage() {
    if (this.invulnerable > 0) return;
    this.invulnerable = 0.8;
    this.state.health--;
    const lost = this.state.health <= 0;
    if (lost) {
      this.state.health = 3;
      const cp = this.state.checkpoint;
      const sp: Partial<Record<RoomId, { x: number; y: number }>> = {
        vestibule: { x: 320, y: 405 },
        catalogue: { x: 630, y: 440 },
        research: { x: 85, y: 440 },
        quiet: { x: 80, y: 375 },
        great: { x: 100, y: 420 },
      };
      this.restore(cp, sp[cp]!.x, sp[cp]!.y);
    } else {
      const target = this.room.hazards?.[0];
      if (target) {
        const safeY = target.y + 55;
        if (isWalkable(this.room, this.state.x, safeY)) this.state.y = safeY;
        else {
          this.state.x = 80;
          this.state.y = this.room.h - 70;
        }
      }
    }
    this.release();
    this.events.push({
      type: "damage",
      text: lost
        ? "Regresas al checkpoint con tres corazones. Tu investigación se conserva."
        : "El carrito te hizo retroceder. Observa su recorrido antes de cruzar.",
    });
  }
  snapshot() {
    this.rememberActors();
    const copy = JSON.parse(JSON.stringify(this.state)) as LibraryState;
    const x = Math.round(copy.x * 100) / 100,
      y = Math.round(copy.y * 100) / 100;
    if (isWalkable(this.room, x, y)) {
      copy.x = x;
      copy.y = y;
    }
    return copy;
  }
  release() {
    this.input = { up: false, down: false, left: false, right: false };
    this.moving = false;
  }
  drain() {
    return this.events.splice(0);
  }
}
