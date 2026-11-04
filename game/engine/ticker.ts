export const FIXED_STEP = 1 / 120,
  MAX_FRAME_SECONDS = 0.2,
  MAX_STEPS = 24;
/** Preserve fractional time at 5–120 FPS and bound work after long interruptions. */
export class FixedStepClock {
  private remainder = 0;
  advance(elapsed: number, step: (dt: number) => void) {
    if (!Number.isFinite(elapsed) || elapsed <= 0) return 0;
    this.remainder += Math.min(elapsed, MAX_FRAME_SECONDS);
    let count = 0;
    while (this.remainder + 1e-10 >= FIXED_STEP && count < MAX_STEPS) {
      step(FIXED_STEP);
      this.remainder = Math.max(0, this.remainder - FIXED_STEP);
      count++;
    }
    return count;
  }
  reset() {
    this.remainder = 0;
  }
}
