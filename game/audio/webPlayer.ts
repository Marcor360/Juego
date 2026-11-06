/** HTML audio owns an async play promise. Cancellation is normal when a user
 * closes a panel or changes track while the browser is still buffering. */
export class WebAudioPlayer {
  private media: HTMLAudioElement;
  private wantsPlay = false;
  private disposed = false;
  private create: (source: string | null) => HTMLAudioElement;
  constructor(source: string | null, create: (source: string | null) => HTMLAudioElement = source => {
    const media = new Audio();
    media.preload = "auto";
    if (source) media.src = source;
    return media;
  }) {
    this.create = create;
    this.media = create(source);
  }
  get volume() { return this.media.volume; }
  set volume(value: number) { this.media.volume = Math.max(0, Math.min(1, value)); }
  get loop() { return this.media.loop; }
  set loop(value: boolean) { this.media.loop = value; }
  get playing() { return !this.media.paused; }
  get isLoaded() { return this.media.readyState >= 2; }
  play() {
    if (this.disposed) return;
    this.wantsPlay = true;
    if (!this.media.paused) return;
    const media = this.media;
    void media.play().then(() => {
      if (this.disposed || media !== this.media || !this.wantsPlay) media.pause();
    }).catch((error: unknown) => {
      const name = (error as { name?: string })?.name;
      if (name === "AbortError" || name === "NotAllowedError") return;
      console.warn("No se pudo reproducir un recurso de audio.", error);
    });
  }
  pause() { this.wantsPlay = false; this.media.pause(); }
  async seekTo(seconds: number) { this.media.currentTime = seconds; }
  replace(source: string | null) {
    const volume = this.volume, loop = this.loop;
    this.pause();
    this.media.removeAttribute("src");
    this.media.load();
    this.media = this.create(source);
    this.volume = volume;
    this.loop = loop;
  }
  remove() {
    if (this.disposed) return;
    this.pause();
    this.disposed = true;
    this.media.removeAttribute("src");
    this.media.load();
  }
}
