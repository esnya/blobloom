export interface Vector {
  x: number;
  y: number;
}

interface EngineRunner {
  frame: number;
  last: number;
  running: boolean;
}

export class Body {
  position: Vector;
  velocity: Vector;
  angle: number;
  angularVelocity: number;
  restitution: number;
  radius?: number;
  onUpdate?: (body: Body) => void;

  constructor(opts: {
    position: Vector;
    velocity?: Vector;
    restitution?: number;
    radius?: number;
    onUpdate?: (body: Body) => void;
  }) {
    this.position = { ...opts.position };
    this.velocity = opts.velocity ?? { x: 0, y: 0 };
    this.angle = 0;
    this.angularVelocity = 0;
    this.restitution = opts.restitution ?? 1;
    if (opts.radius !== undefined) this.radius = opts.radius;
    if (opts.onUpdate) this.onUpdate = opts.onUpdate;
  }

  setVelocity(vel: Vector) {
    this.velocity = { ...vel };
  }

  setPosition(pos: Vector) {
    this.position = { ...pos };
  }

  setAngularVelocity(val: number) {
    this.angularVelocity = val;
  }

  scale(sx: number, sy: number) {
    if (this.radius !== undefined) {
      const f = (sx + sy) / 2;
      this.radius *= f;
    }
  }
}

export class Engine {
  world: { bodies: Body[] };
  gravity = { y: 1, scale: 0.008 };
  bounds: { width: number; height: number; top: number };
  maxDelta = 50;
  private runner?: EngineRunner;

  constructor(width = 0, height = 0) {
    this.world = { bodies: [] };
    this.bounds = { width, height, top: -height };
  }

  static create(width = 0, height = 0): Engine {
    return new Engine(width, height);
  }

  circle(
    x: number,
    y: number,
    r: number,
    opts: Partial<
      Pick<Body, 'onUpdate'> & {
        restitution: number;
        frictionAir: number;
        friction: number;
        mass: number;
      }
    > = {},
  ): Body {
    const params: ConstructorParameters<typeof Body>[0] = {
      position: { x, y },
      radius: r,
    };
    if (opts.restitution !== undefined) params.restitution = opts.restitution;
    if (opts.onUpdate) params.onUpdate = opts.onUpdate;
    return new Body(params);
  }



  add(body: Body | Body[]) {
    if (Array.isArray(body)) this.world.bodies.push(...body);
    else this.world.bodies.push(body);
  }

  remove(body: Body | Body[]) {
    if (Array.isArray(body)) {
      for (const b of body) {
        const i = this.world.bodies.indexOf(b);
        if (i >= 0) this.world.bodies.splice(i, 1);
      }
    } else {
      const i = this.world.bodies.indexOf(body);
      if (i >= 0) this.world.bodies.splice(i, 1);
    }
  }

  update(delta: number) {
    const dt = Math.min(delta, this.maxDelta);
    const g = this.gravity.y * this.gravity.scale;
    const { width, height, top } = this.bounds;
    const bodies = this.world.bodies;

    for (const body of bodies) {
      body.velocity.y += g * dt;
      body.position.x += body.velocity.x;
      body.position.y += body.velocity.y;
      body.angle += body.angularVelocity;

      if (body.radius !== undefined) {
        if (body.position.x - body.radius < 0) {
          body.position.x = body.radius;
          body.velocity.x *= -body.restitution;
        } else if (body.position.x + body.radius > width) {
          body.position.x = width - body.radius;
          body.velocity.x *= -body.restitution;
        }
        if (body.position.y - body.radius < top) {
          body.position.y = top + body.radius;
          body.velocity.y *= -body.restitution;
        } else if (body.position.y + body.radius > height) {
          body.position.y = height - body.radius;
          body.velocity.y *= -body.restitution;
        }
      }

      body.onUpdate?.(body);
    }
  }

  start() {
    if (this.runner?.running) return;
    const runner: EngineRunner = {
      frame: 0,
      last: performance.now(),
      running: true,
    };
    const step = (time: number): void => {
      if (!runner.running) return;
      this.update(time - runner.last);
      runner.last = time;
      runner.frame = requestAnimationFrame(step);
    };
    runner.frame = requestAnimationFrame(step);
    this.runner = runner;
  }

  stop() {
    const runner = this.runner;
    if (!runner || !runner.running) return;
    runner.running = false;
    cancelAnimationFrame(runner.frame);
  }
}
