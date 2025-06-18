export interface AnimatedNumberOptions {
  duration?: number;
  round?: boolean;
}

export class AnimatedNumber {
  private from: number;
  private target: number;
  private start = 0;
  private frame: number | null = null;
  private value: number;

  constructor(initial: number, private opts: Required<AnimatedNumberOptions>, private onChange: (n: number) => void) {
    this.from = initial;
    this.target = initial;
    this.value = initial;
  }

  updateOptions(opts: AnimatedNumberOptions) {
    this.opts = { ...this.opts, ...opts };
  }

  animateTo(n: number) {
    this.cancel();
    this.from = this.value;
    this.target = n;
    this.start = performance.now();
    this.frame = requestAnimationFrame(this.step);
  }

  private step = (time: number) => {
    const { duration, round } = this.opts;
    const linear = Math.min(1, (time - this.start) / duration);
    const progress = 1 - (1 - linear) ** 2;
    const next = this.from + (this.target - this.from) * progress;
    this.value = round ? Math.round(next) : next;
    this.onChange(this.value);
    if (linear < 1) {
      this.frame = requestAnimationFrame(this.step);
    } else {
      this.from = this.target;
      this.frame = null;
    }
  };

  cancel() {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }
}
