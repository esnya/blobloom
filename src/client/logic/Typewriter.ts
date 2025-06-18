export class Typewriter {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private index = 0;

  constructor(private delay: number, private onUpdate: (text: string) => void) {}

  start(value: string) {
    this.stop();
    this.index = 0;
    const tick = () => {
      this.index += 1;
      this.onUpdate(value.slice(0, this.index));
      if (this.index < value.length) {
        this.timer = setTimeout(tick, this.delay);
      }
    };
    this.timer = setTimeout(tick, this.delay);
  }

  stop() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
