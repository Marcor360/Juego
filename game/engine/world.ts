import { BRANCH_CLEAR_SECONDS } from "../rendering/conversation.ts";
import { CompanionTrail, companionPresent } from "./companion.ts";
import {
  GROUND,
  WIDTH,
  platforms,
  activePlatforms,
  platformAt,
  objects,
  floorAt,
  rightLimit,
  hazards,
  checkpoints,
  objectVisible,
  type CheckpointId,
  type Platform,
} from "../levels/forest.ts";
import {
  freshProgress,
  hasMission,
  currentScene,
  finishMission,
  addUnique,
  type Progress,
} from "../missions/progress.ts";
import type { SoundKind } from "../audio/context.ts";
export type WorldEvent = {
  type: "pickup" | "progress" | "damage" | "checkpoint" | "warning" | "sound";
  sound?: SoundKind;
  id?: string;
  x?: number;
  y?: number;
  message?: string;
};
const supplyChest = { id: "supply_chest", x: 7603, y: 201, w: 34, h: 25 };
export class World {
  x = 120;
  y = GROUND;
  vy = 0;
  vx = 0;
  camera = 0;
  grounded = true;
  facing = 1;
  moving = false;
  time = 0;
  branchClearing = 0;
  branchApproach = false;
  health = 3;
  invulnerable = 0;
  checkpoint: CheckpointId = "ch1_entrada";
  lastSafe = { x: 120, y: GROUND };
  readonly companion = new CompanionTrail();
  private companionJoined = false;
  get companionX() { return this.companion.x; }
  get companionY() { return this.companion.y; }
  progress: Progress = freshProgress();
  input = { left: false, right: false, jump: false, jumpHeld: undefined as boolean | undefined };
  private events: WorldEvent[] = [];
  private coyote = 0.1;
  private jumpBuffer = 0;
  private support: string | null = null;
  private walked = 0;
  private gateHint = 0;
  private fallingSound = false;
  get footstepSound(): SoundKind {
    const kind = activePlatforms(this.progress).find(p => p.id === this.support)?.kind;
    return kind && ["wood", "moving", "rope", "fragile"].includes(kind)
      ? "step-wood" : this.support ? "step-stone" : "step-grass";
  }
  step(dt: number) {
    dt = Math.max(0, Math.min(dt, 1 / 30));
    const wasGrounded = this.grounded;
    const previousTime = this.time;
    this.time += dt;
    if (this.branchClearing > 0 && !this.branchApproach) {
      const before = this.branchClearing;
      this.branchClearing = Math.max(0, before - dt);
      if (before > .8 && this.branchClearing <= .8) this.events.push({type:"sound",sound:"wood-land"});
      if (this.branchClearing === 0) { this.release(); this.events.push({type:"progress",message:"La rama quedó a la orilla. El sendero está libre."}); }
    }
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    const list = activePlatforms(this.progress),
      oldSupport = list.find((p) => p.id === this.support);
    for (const platform of list) {
      if (!platform.move) continue;
      const before = platformAt(platform, previousTime), after = platformAt(platform, this.time);
      this.companion.carryPlatform(platform.id, after.x - before.x, after.y - before.y);
    }
    if (oldSupport && this.grounded) {
      const a = platformAt(oldSupport, previousTime),
        b = platformAt(oldSupport, this.time);
      this.x += b.x - a.x;
      this.y += b.y - a.y;
    }
    if (this.input.jump && this.branchClearing <= 0) this.jumpBuffer = 0.12;
    else this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    this.input.jump = false;
    this.coyote = this.grounded ? 0.1 : Math.max(0, this.coyote - dt);
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.events.push({ type: "sound", sound: "jump" });
      this.vy = -300;
      this.grounded = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.markTutorial("jump");
    }
    const direction = this.branchApproach ? 1 : this.branchClearing > 0 ? 0 : Number(this.input.right) - Number(this.input.left);
    if (direction) this.facing = direction;
    if (this.input.jumpHeld === false && this.vy < -220) this.vy = -220;
    const target = direction * 115;
    const slippery = oldSupport?.kind === "wet";
    this.vx = slippery
      ? this.vx + (target - this.vx) * (1 - Math.exp(-dt * 5))
      : this.vx + Math.sign(target - this.vx) * Math.min(
          Math.abs(target - this.vx),
          dt * (this.grounded ? (direction ? 1400 : 2200) : 900),
        );
    const dx = this.vx * dt;
    const solids = list.map((p) => platformAt(p, this.time));
    solids.push(supplyChest);
    if (!hasMission(this.progress, 5) || this.branchClearing > 0)
      solids.push({ id: "branch_wall", x: 2390, y: 155, w: 22, h: 71 });
    const limit = rightLimit(this.progress);
    if (
      direction > 0 &&
      this.x >= limit - 1 &&
      this.gateHint !== currentScene(this.progress)
    ) {
      this.gateHint = currentScene(this.progress);
      this.events.push({
        type: "warning",
        message:
          "El sendero sigue cerrado. Consulta tu objetivo actual en el cuaderno antes de avanzar.",
      });
    }
    const minX = this.progress.worldFlags.noReturn ? 5112 : 12;
    let nx = Math.max(minX, Math.min(rightLimit(this.progress), this.x + dx));
    for (const r of solids)
      if (
        dx !== 0 &&
        this.y > r.y + 1 &&
        this.y - 37 < r.y + r.h &&
        nx + 9 > r.x &&
        nx - 9 < r.x + r.w
      )
        nx = dx > 0 ? r.x - 9 : r.x + r.w + 9;
    if (this.branchApproach && nx >= 2350) {
      nx = 2350; this.branchApproach = false; this.vx = 0;
      this.events.push({type:"sound",sound:"wood-shift"});
      this.events.push({type:"progress",message:"La rama rueda hacia la orilla. Espera un momento."});
    }
    const previousX = this.x;
    this.x = Math.max(minX, Math.min(rightLimit(this.progress), nx));
    const travelled = Math.abs(this.x - previousX);
    this.moving = travelled > dt * 3;
    this.walked += travelled;
    if (this.walked > 60) this.markTutorial("walk");
    if (Math.abs(this.x - previousX - dx) > .001) this.vx = 0;
    const oldY = this.y;
    this.vy += 900 * dt;
    const impactVelocity = this.vy;
    let ny = this.y + this.vy * dt;
    this.grounded = false;
    this.support = null;
    for (const r of solids)
      if (this.x + 8 > r.x && this.x - 8 < r.x + r.w) {
        if (this.vy >= 0 && oldY <= r.y + 0.2 && ny >= r.y) {
          ny = r.y;
          this.vy = 0;
          this.grounded = true;
          this.support = r.id;
        } else if (
          this.vy < 0 &&
          oldY - 37 >= r.y + r.h &&
          ny - 37 < r.y + r.h
        ) {
          ny = r.y + r.h + 37;
          this.vy = 0;
        }
      }
    if (
      floorAt(this.x) &&
      oldY <= GROUND + 0.2 &&
      ny >= GROUND &&
      this.vy >= 0
    ) {
      ny = GROUND;
      this.vy = 0;
      this.grounded = true;
      this.support = null;
    }
    this.y = ny;
    if (this.grounded) {
      this.fallingSound = false;
      if (!wasGrounded && impactVelocity > 80) this.events.push({ type: "sound", sound: "land" });
    } else if (this.y > GROUND + 18 && this.vy > 120 && !this.fallingSound) {
      this.fallingSound = true;
      this.events.push({ type: "sound", sound: "fall" });
    }
    if (
      !this.progress.worldFlags.bridgeWarning &&
      this.x > 2615 &&
      this.x < 2675 &&
      this.y > 205 &&
      hasMission(this.progress, 5)
    ) {
      this.progress.worldFlags.bridgeWarning = true;
      this.x = 2610;
      this.vx = 0;
      this.events.push({
        type: "warning",
        message:
          "Una tabla cede. Retrocedes a tiempo: busca las marcas del desvío.",
      });
    }
    if (
      this.grounded &&
      this.invulnerable <= 0 &&
      !hazards.some((h) => Math.abs(this.x - h.x) < 35)
    ) {
      const safe = this.support
        ? list.find(
            (p) =>
              p.id === this.support &&
              p.kind !== "moving" &&
              p.kind !== "wet" &&
              p.kind !== "fragile",
          )
        : null;
      if (safe)
        this.lastSafe = {
          x: Math.max(safe.x + 13, Math.min(safe.x + safe.w - 13, this.x)),
          y: safe.y,
        };
      else if (!this.support && floorAt(this.x - 18) && floorAt(this.x + 18))
        this.lastSafe = { x: this.x, y: GROUND };
    }
    if (this.y > 316)
      this.damage("Has caído. Regresas al último apoyo seguro.");
    if (
      hazards.some(
        (h) =>
          this.y > h.y - 7 &&
          this.y < h.y + 8 &&
          this.x + 8 > h.x &&
          this.x - 8 < h.x + h.w,
      )
    )
      this.damage("Tropezaste con una rama. Salta para pasarla con cuidado.");
    for (const o of objects) {
      if (Math.abs(o.x - this.x) > 18 || Math.abs(o.y - (this.y - 18)) > 25)
        continue;
      if (
        o.kind === "light" &&
        !this.progress.lights.includes(o.id) &&
        hasMission(this.progress, 2)
      ) {
        addUnique(this.progress.lights, o.id);
        this.events.push({
          type: "pickup",
          id: o.id,
          x: o.x,
          y: o.y,
          message: "Una pequeña luz de esperanza se guarda en tu cuaderno.",
        });
      }
      if (o.kind === "item" && !this.progress.items.includes(o.id)) {
        addUnique(this.progress.items, o.id);
        this.events.push({
          type: "pickup",
          id: o.id,
          x: o.x,
          y: o.y,
          message: o.label + " guardada en la mochila.",
        });
      }
      if (o.kind === "evidence" && !this.progress.evidence.includes(o.id)) {
        addUnique(this.progress.evidence, o.id);
        this.events.push({
          type: "pickup",
          id: o.id,
          x: o.x,
          y: o.y,
          message: "Nueva evidencia: " + o.label + ". Consulta el cuaderno.",
        });
      }
    }
    if (companionPresent(this.progress, this.x)) {
      if (!this.companionJoined) {
        this.resetCompanion();
        this.companionJoined = true;
      }
      this.companion.step(dt, { x: this.x, y: this.y, grounded: this.grounded, support: this.support });
    } else this.companionJoined = false;
    const look = this.facing * 45;
    const targetCamera = Math.max(
      0,
      Math.min(WIDTH - 480, this.x - 240 + look),
    );
    this.camera += (targetCamera - this.camera) * (1 - Math.exp(-dt * 6));
  }
  markTutorial(key: keyof Progress["tutorial"]) {
    if (!this.progress.tutorial[key]) {
      this.progress.tutorial[key] = true;
      this.events.push({ type: "progress" });
    }
  }
  complete(scene: number, decision = "") {
    finishMission(this.progress, scene, decision);
    if (scene === 5) {
      this.branchClearing = BRANCH_CLEAR_SECONDS;
      this.branchApproach = true;
      this.release();
      this.setCheckpoint("ch1_arroyo");
      this.events.push({type:"progress",message:"Te acercas para apartar la rama con cuidado."});
    }
    if (scene === 9 || scene === 11) this.events.push({type:"sound",sound:"ignite"});
    if (scene === 9) this.setCheckpoint("ch1_puente");
    if (scene === 10) {
      this.health = 3;
      this.setCheckpoint("ch1_claro");
    }
    if (scene === 14) this.setCheckpoint("ch1_refugio");
    this.events.push({ type: "progress" });
  }
  setCheckpoint(id: CheckpointId) {
    this.checkpoint = id;
    this.lastSafe = { x: checkpoints[id].x, y: GROUND };
    this.events.push({
      type: "checkpoint",
      message: "Checkpoint guardado: " + id.replace("ch1_", "") + ".",
    });
  }
  enterMist() {
    if (!hasMission(this.progress, 11))
      throw Error("Todavía quedan tareas antes de la niebla.");
    this.progress.worldFlags.noReturn = true;
    this.setCheckpoint("ch1_niebla");
    this.restore(5200);
    this.events.push({ type: "progress", message: "Entraste en la niebla · checkpoint guardado. Sigue los apoyos iluminados hasta el farol." });
  }
  rest() {
    this.health = 3;
    this.events.push({
      type: "progress",
      message: "Recuperaste tus tres corazones.",
    });
  }
  damage(message: string) {
    if (this.invulnerable > 0) return;
    this.events.push({ type: "sound", sound: "damage" });
    this.health--;
    this.invulnerable = 0.8;
    this.vy = 0;
    this.vx = 0;
    if (this.health <= 0) {
      this.health = 3;
      this.restore(checkpoints[this.checkpoint].x);
      message =
        "Recuperas fuerzas en el checkpoint. Tu historia y tus objetos se conservan.";
    } else {
      this.x = this.lastSafe.x;
      this.y = this.lastSafe.y;
      this.grounded = true;
      this.support = null;
      this.resetCompanion();
    }
    this.events.push({ type: "damage", message });
  }
  restore(x: number) {
    this.branchClearing = 0;
    this.branchApproach = false;
    // Older saves can place the player inside the chest body.
    const left = supplyChest.x - 9, right = supplyChest.x + supplyChest.w + 9;
    if (x > left && x < right)
      x = x <= (left + right) / 2 ? left : right;
    this.x = x;
    const support = platforms
      .filter(
        (p) =>
          p.kind !== "moving" &&
          p.kind !== "rope" &&
          x > p.x + 4 &&
          x < p.x + p.w - 4,
      )
      .sort((a, b) => a.y - b.y)[0];
    this.y = support?.y ?? GROUND;
    this.vy = 0;
    this.vx = 0;
    this.grounded = true;
    this.support = support?.id ?? null;
    this.lastSafe = { x, y: this.y };
    this.camera = Math.max(0, Math.min(WIDTH - 480, x - 195));
    this.resetCompanion();
    this.companionJoined = companionPresent(this.progress, x);
    this.fallingSound = false;
    this.release();
  }
  private resetCompanion() {
    const behind = this.x - 36;
    const clearGround = this.y === GROUND && [0, 9, 18, 27, 36].every(offset => floorAt(this.x - offset))
      && !activePlatforms(this.progress).some(p => p.x < this.x && p.x + p.w > behind && p.y > GROUND - 37)
      && !(behind < supplyChest.x + supplyChest.w + 9 && this.x > supplyChest.x - 9);
    this.companion.reset({ x: clearGround ? behind : this.x, y: this.y, grounded: this.grounded, support: clearGround ? null : this.support });
  }
  safePosition() {
    return this.grounded && this.support === null && floorAt(this.x)
      ? Math.round(this.x)
      : Math.round(this.lastSafe.x);
  }
  nearby() {
    return objects
      .filter(
        (o) =>
          objectVisible(o, this.progress) &&
          ["story", "helper", "boundary", "rest"].includes(o.kind) &&
          Math.abs(o.x - this.x) < 34 &&
          Math.abs(o.y - this.y) < 47,
      )
      .sort(
        (a, b) =>
          Number(b.scene === currentScene(this.progress)) -
            Number(a.scene === currentScene(this.progress)) ||
          Math.abs(a.x - this.x) - Math.abs(b.x - this.x),
      )[0];
  }
  drainEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }
  release() {
    this.input = { left: false, right: false, jump: false, jumpHeld: undefined };
    this.moving = false;
    this.vx = 0;
  }
}
