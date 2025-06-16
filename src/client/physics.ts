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
  mass: number;
  radius: number | undefined;
  width: number | undefined;
  height: number | undefined;
  isStatic: boolean | undefined;
  restitution: number;
  frictionAir: number;
  onUpdate?: (body: Body) => void;

  constructor(opts: {
    position: Vector;
    mass: number;
    velocity?: Vector;
    radius?: number;
    width?: number;
    height?: number;
    isStatic?: boolean;
    restitution?: number;
    frictionAir?: number;
    onUpdate?: (body: Body) => void;
  }) {
    this.position = { ...opts.position };
    this.velocity = opts.velocity ?? { x: 0, y: 0 };
    this.angle = 0;
    this.angularVelocity = 0;
    this.mass = opts.mass;
    this.radius = opts.radius;
    this.width = opts.width;
    this.height = opts.height;
    this.isStatic = opts.isStatic;
    this.restitution = opts.restitution ?? 0;
    this.frictionAir = opts.frictionAir ?? 0;
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
      this.mass *= f * f;
    } else {
      if (this.width !== undefined) this.width *= sx;
      if (this.height !== undefined) this.height *= sy;
      this.mass *= sx * sy;
    }
  }
}

export class Engine {
  world: { bodies: Body[] };
  gravity = { y: 1, scale: 0.002 };
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
      Pick<Body, 'restitution' | 'frictionAir' | 'mass' | 'onUpdate'>
    > = {},
  ): Body {
    const params: ConstructorParameters<typeof Body>[0] = {
      position: { x, y },
      mass: opts.mass ?? r * r,
      radius: r,
      restitution: opts.restitution ?? 0,
      frictionAir: opts.frictionAir ?? 0,
    };
    if (opts.onUpdate) params.onUpdate = opts.onUpdate;
    return new Body(params);
  }

  rectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    opts: Partial<Pick<Body, 'isStatic' | 'mass' | 'onUpdate'>> = {},
  ): Body {
    const params: ConstructorParameters<typeof Body>[0] = {
      position: { x, y },
      mass: opts.mass ?? width * height,
      width,
      height,
      isStatic: opts.isStatic ?? false,
      restitution: 0,
      frictionAir: 0,
    };
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
      if (body.isStatic) continue;
      body.velocity.y += g * dt;
      body.velocity.x *= 1 - body.frictionAir;
      body.velocity.y *= 1 - body.frictionAir;
      body.angularVelocity *= 1 - body.frictionAir;
      body.position.x += body.velocity.x;
      body.position.y += body.velocity.y;
      body.angle += body.angularVelocity;

      if (body.radius !== undefined) {
        if (body.position.x - body.radius < 0) {
          body.position.x = body.radius;
          body.velocity.x = -body.velocity.x * body.restitution;
          body.angularVelocity += (body.velocity.y * 0.01) / body.radius;
        } else if (body.position.x + body.radius > width) {
          body.position.x = width - body.radius;
          body.velocity.x = -body.velocity.x * body.restitution;
          body.angularVelocity += (body.velocity.y * 0.01) / body.radius;
        }
        if (body.position.y - body.radius < top) {
          body.position.y = top + body.radius;
          body.velocity.y = -body.velocity.y * body.restitution;
          body.angularVelocity += (body.velocity.x * 0.01) / body.radius;
        } else if (body.position.y + body.radius > height) {
          body.position.y = height - body.radius;
          body.velocity.y = -body.velocity.y * body.restitution;
          body.angularVelocity += (body.velocity.x * 0.01) / body.radius;
        }
      }
    }

    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i]!;
      if (a.isStatic || a.radius === undefined) continue;
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j]!;
        if (b.isStatic || b.radius === undefined) continue;
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const radiusSum = a.radius + b.radius;
        const distSq = dx * dx + dy * dy;
        if (distSq >= radiusSum * radiusSum) continue;
        const dist = Math.sqrt(distSq);
        const overlap = radiusSum - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        const total = a.mass + b.mass;
        if (!a.isStatic) {
          a.position.x -= nx * (overlap * (b.mass / total));
          a.position.y -= ny * (overlap * (b.mass / total));
        }
        if (!b.isStatic) {
          b.position.x += nx * (overlap * (a.mass / total));
          b.position.y += ny * (overlap * (a.mass / total));
        }

        const dvx = b.velocity.x - a.velocity.x;
        const dvy = b.velocity.y - a.velocity.y;
        const vn = dvx * nx + dvy * ny;
        if (vn >= 0) continue;
        const restitution = Math.min(a.restitution, b.restitution);
        const impulse = (-(1 + restitution) * vn) / (1 / a.mass + 1 / b.mass);
        if (!a.isStatic) {
          a.velocity.x -= (impulse * nx) / a.mass;
          a.velocity.y -= (impulse * ny) / a.mass;
        }
        if (!b.isStatic) {
          b.velocity.x += (impulse * nx) / b.mass;
          b.velocity.y += (impulse * ny) / b.mass;
        }

        const tx = -ny;
        const ty = nx;
        const vt = dvx * tx + dvy * ty;
        const friction = 0.01;
        if (!a.isStatic && a.radius !== undefined)
          a.angularVelocity -= (vt * friction) / a.radius;
        if (!b.isStatic && b.radius !== undefined)
          b.angularVelocity += (vt * friction) / b.radius;
      }
    }
    for (const body of bodies) {
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
