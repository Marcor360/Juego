/** Calm speech: closed-mouth pauses separate short articulations and a held smile. */
export function conversationPose(seconds: number, reduced = false) {
  "worklet";
  if (reduced) return 2;
  const durations = [.48,.18,.22,.18,.4,.6,.34];
  const poses = [2,3,4,3,2,5,2];
  let t = ((seconds % 2.4) + 2.4) % 2.4;
  for (let i=0;i<durations.length;i++) { if(t<durations[i])return poses[i];t-=durations[i]; }
  return 2;
}
export function idlePose(seconds:number,reduced=false) {
  "worklet";
  return !reduced && seconds%5.2>5 ? 1 : 0;
}
export const BRANCH_CLEAR_SECONDS = 2.4;
