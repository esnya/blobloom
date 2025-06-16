export interface Vector {
  x: number;
  y: number;
}

interface EngineRunner {
  frame: number;
  last: number;
  running: boolean;
}

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class Body {
  position: Vector;
  velocity: Vector;
  angle: number;
  angularVelocity: number;
  restitution: number;
  friction: number;
  frictionAir: number;
  mass: number;
  radius?: number;
  aabb: AABB;
  onUpdate?: (body: Body) => void;

  constructor(opts: {
    position: Vector;
    velocity?: Vector;
    restitution?: number;
    radius?: number;
    friction?: number;
    frictionAir?: number;
    mass?: number;
    onUpdate?: (body: Body) => void;
  }) {
    this.position = { ...opts.position };
    this.velocity = opts.velocity ?? { x: 0, y: 0 };
    this.angle = 0;
    this.angularVelocity = 0;
    this.restitution = opts.restitution ?? 1;
    this.friction = opts.friction ?? 0;
    this.frictionAir = opts.frictionAir ?? 0;
    this.mass = opts.mass ?? 1;
    if (opts.radius !== undefined) this.radius = opts.radius;
    if (opts.onUpdate) this.onUpdate = opts.onUpdate;
    const r = this.radius ?? 0;
    this.aabb = { minX: this.position.x - r, minY: this.position.y - r, maxX: this.position.x + r, maxY: this.position.y + r };
  }

  updateAABB() {
    const r = this.radius ?? 0;
    this.aabb.minX = this.position.x - r;
    this.aabb.minY = this.position.y - r;
    this.aabb.maxX = this.position.x + r;
    this.aabb.maxY = this.position.y + r;
  }

  setVelocity(vel: Vector) {
    this.velocity = { ...vel };
  }

  setPosition(pos: Vector) {
    this.position = { ...pos };
    this.updateAABB();
  }

  setAngularVelocity(val: number) {
    this.angularVelocity = val;
  }

  scale(sx: number, sy: number) {
    if (this.radius !== undefined) {
      const f = (sx + sy) / 2;
      this.radius *= f;
      this.updateAABB();
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
    if (opts.friction !== undefined) params.friction = opts.friction;
    if (opts.frictionAir !== undefined) params.frictionAir = opts.frictionAir;
    if (opts.mass !== undefined) params.mass = opts.mass;
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
    const len = bodies.length;

    for (const body of bodies) {
      body.velocity.y += g * dt;
      body.position.x += body.velocity.x;
      body.position.y += body.velocity.y;
      body.angle += body.angularVelocity;

      body.velocity.x *= 1 - body.frictionAir;
      body.velocity.y *= 1 - body.frictionAir;
      body.angularVelocity *= 1 - body.frictionAir;

      if (body.radius !== undefined) {
        if (body.position.x - body.radius < 0) {
          body.position.x = body.radius;
          const vy = body.velocity.y;
          body.velocity.x *= -body.restitution;
          body.velocity.y *= 1 - body.friction;
          body.angularVelocity -= (body.velocity.y - vy) / body.radius;
        } else if (body.position.x + body.radius > width) {
          body.position.x = width - body.radius;
          const vy = body.velocity.y;
          body.velocity.x *= -body.restitution;
          body.velocity.y *= 1 - body.friction;
          body.angularVelocity += (body.velocity.y - vy) / body.radius;
        }
        if (body.position.y - body.radius < top) {
          body.position.y = top + body.radius;
          const vx = body.velocity.x;
          body.velocity.y *= -body.restitution;
          body.velocity.x *= 1 - body.friction;
          body.angularVelocity += (body.velocity.x - vx) / body.radius;
        } else if (body.position.y + body.radius > height) {
          body.position.y = height - body.radius;
          const vx = body.velocity.x;
          body.velocity.y *= -body.restitution;
          body.velocity.x *= 1 - body.friction;
          body.angularVelocity -= (body.velocity.x - vx) / body.radius;
        }
      }

      body.updateAABB();

      body.onUpdate?.(body);
    }

    for (let i = 0; i < len; i += 1) {
      const a = bodies[i]!;
      if (a.radius === undefined) continue;
      for (let j = i + 1; j < len; j += 1) {
        const b = bodies[j]!;
        if (b.radius === undefined) continue;
        if (a.aabb.maxX < b.aabb.minX || a.aabb.minX > b.aabb.maxX) continue;
        if (a.aabb.maxY < b.aabb.minY || a.aabb.minY > b.aabb.maxY) continue;
        this.resolveCircleCollision(a, b);
      }
    }
  }

  private resolveCircleCollision(a: Body, b: Body) {
    const dx = b.position.x - a.position.x;
    const dy = b.position.y - a.position.y;
    const r = (a.radius ?? 0) + (b.radius ?? 0);
    const distSq = dx * dx + dy * dy;
    if (distSq >= r * r) return;

    const dist = Math.sqrt(distSq);
    let nx = 0;
    let ny = 0;
    if (dist === 0) {
      nx = 1;
    } else {
      nx = dx / dist;
      ny = dy / dist;
    }
    const tx = -ny;
    const ty = nx;

    const relVelX = a.velocity.x - b.velocity.x;
    const relVelY = a.velocity.y - b.velocity.y;

    const relNormal = relVelX * nx + relVelY * ny;
    const e = Math.min(a.restitution, b.restitution);
    const m1 = a.mass;
    const m2 = b.mass;

    if (relNormal > 0) {
      const j = (-(1 + e) * relNormal) / (1 / m1 + 1 / m2);

      a.velocity.x += (j / m1) * nx;
      a.velocity.y += (j / m1) * ny;
      b.velocity.x -= (j / m2) * nx;
      b.velocity.y -= (j / m2) * ny;

      const relTang = relVelX * tx + relVelY * ty;
      const mu = (a.friction + b.friction) / 2;
      let jt = -relTang / (1 / m1 + 1 / m2);
      const maxJt = Math.abs(j) * mu;
      if (jt > maxJt) jt = maxJt;
      if (jt < -maxJt) jt = -maxJt;

      a.velocity.x += (jt / m1) * tx;
      a.velocity.y += (jt / m1) * ty;
      b.velocity.x -= (jt / m2) * tx;
      b.velocity.y -= (jt / m2) * ty;

      if (a.radius) a.angularVelocity -= (jt / m1) / a.radius;
      if (b.radius) b.angularVelocity += (jt / m2) / b.radius;
    }

    const overlap = r - dist;
    const correction = overlap / (m1 + m2);
    a.position.x -= nx * correction * m2;
    a.position.y -= ny * correction * m2;
    b.position.x += nx * correction * m1;
    b.position.y += ny * correction * m1;
    a.updateAABB();
    b.updateAABB();
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
