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
  angularDamping: number;
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
    angularDamping?: number;
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
    this.angularDamping = opts.angularDamping ?? 0;
    this.mass = opts.mass ?? 1;
    if (opts.radius !== undefined) this.radius = opts.radius;
    if (opts.onUpdate) this.onUpdate = opts.onUpdate;
    const r = this.radius ?? 0;
    this.aabb = {
      minX: this.position.x - r,
      minY: this.position.y - r,
      maxX: this.position.x + r,
      maxY: this.position.y + r,
    };
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

interface QuadBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface QuadNode {
  bounds: QuadBounds;
  items: number[];
  mask: bigint;
  children?: [QuadNode, QuadNode, QuadNode, QuadNode];
}

class Quadtree {
  private root: QuadNode;
  private leaves: QuadNode[] = [];
  private bitForIndex: bigint[];
  private bitIndex = new Map<bigint, number>();

  constructor(
    private bodies: Body[],
    bounds: QuadBounds,
    private maxObjects = 4,
    private maxDepth = 5,
  ) {
    this.root = { bounds, items: [], mask: 0n };
    this.bitForIndex = bodies.map((_, i) => 1n << BigInt(i));
    this.bitForIndex.forEach((b, i) => this.bitIndex.set(b, i));
    bodies.forEach((body, i) => this.insert(this.root, body.aabb, i, 0));
    this.collect(this.root);
  }

  getPairs(): [number, number][] {
    const pairs = new Set<string>();
    for (const leaf of this.leaves) {
      let m = leaf.mask;
      while (m) {
        const aBit = m & -m;
        const aIdx = this.bitIndex.get(aBit)!;
        m &= m - 1n;
        let n = m;
        while (n) {
          const bBit = n & -n;
          const bIdx = this.bitIndex.get(bBit)!;
          n &= n - 1n;
          const key = aIdx < bIdx ? `${aIdx},${bIdx}` : `${bIdx},${aIdx}`;
          pairs.add(key);
        }
      }
    }
    return Array.from(pairs, s => s.split(',').map(Number) as [number, number]);
  }

  private insert(node: QuadNode, aabb: QuadBounds, index: number, depth: number): void {
    if (!this.intersects(node.bounds, aabb)) return;
    if (node.children) {
      for (const child of node.children) this.insert(child, aabb, index, depth + 1);
      return;
    }
    node.items.push(index);
    node.mask |= this.bitForIndex[index]!;
    if (node.items.length > this.maxObjects && depth < this.maxDepth) {
      this.subdivide(node);
      const items = [...node.items];
      node.items = [];
      node.mask = 0n;
      for (const idx of items) this.insert(node, this.bodies[idx]!.aabb, idx, depth);
    }
  }

  private subdivide(node: QuadNode): void {
    const { minX, minY, maxX, maxY } = node.bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    node.children = [
      { bounds: { minX, minY, maxX: midX, maxY: midY }, items: [], mask: 0n },
      { bounds: { minX: midX, minY, maxX, maxY: midY }, items: [], mask: 0n },
      { bounds: { minX, minY: midY, maxX: midX, maxY }, items: [], mask: 0n },
      { bounds: { minX: midX, minY: midY, maxX, maxY }, items: [], mask: 0n },
    ];
  }

  private collect(node: QuadNode): void {
    if (node.children) node.children.forEach(c => this.collect(c));
    else this.leaves.push(node);
  }

  private intersects(a: QuadBounds, b: QuadBounds): boolean {
    return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
  }
}

export class Engine {
  world: { bodies: Body[] };
  gravity = { y: 1, scale: 0.008 };
  bounds: { width: number; height: number; top: number };
  maxDelta = 50;
  dampingScale = 1.5;
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
        angularDamping: number;
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
    if (opts.angularDamping !== undefined)
      params.angularDamping = opts.angularDamping;
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

      const air = Math.exp(-body.frictionAir * dt * this.dampingScale);
      body.velocity.x *= air;
      body.velocity.y *= air;
      body.angularVelocity *= air;
      if (body.angularDamping)
        body.angularVelocity *= Math.exp(-body.angularDamping * dt * this.dampingScale);

      if (body.radius !== undefined) {
        if (body.position.x - body.radius < 0) {
          body.position.x = body.radius;
          const sign = 1;
          const r = body.radius;
          const m = body.mass;
          const vn = body.velocity.x * sign;
          const vt = body.velocity.y - sign * body.angularVelocity * r;
          const jn = -(1 + body.restitution) * vn * m;
          let jt = -vt * m;
          const maxJt = Math.abs(jn) * body.friction;
          if (jt > maxJt) jt = maxJt;
          if (jt < -maxJt) jt = -maxJt;
          body.velocity.x += (jn / m) * sign;
          body.velocity.y += jt / m;
          body.angularVelocity -= (sign * jt) / (m * r);
        } else if (body.position.x + body.radius > width) {
          body.position.x = width - body.radius;
          const sign = -1;
          const r = body.radius;
          const m = body.mass;
          const vn = body.velocity.x * sign;
          const vt = body.velocity.y - sign * body.angularVelocity * r;
          const jn = -(1 + body.restitution) * vn * m;
          let jt = -vt * m;
          const maxJt = Math.abs(jn) * body.friction;
          if (jt > maxJt) jt = maxJt;
          if (jt < -maxJt) jt = -maxJt;
          body.velocity.x += (jn / m) * sign;
          body.velocity.y += jt / m;
          body.angularVelocity -= (sign * jt) / (m * r);
        }
        if (body.position.y - body.radius < top) {
          body.position.y = top + body.radius;
          const sign = 1;
          const r = body.radius;
          const m = body.mass;
          const vn = body.velocity.y * sign;
          const vt = body.velocity.x + sign * body.angularVelocity * r;
          const jn = -(1 + body.restitution) * vn * m;
          let jt = -vt * m;
          const maxJt = Math.abs(jn) * body.friction;
          if (jt > maxJt) jt = maxJt;
          if (jt < -maxJt) jt = -maxJt;
          body.velocity.y += (jn / m) * sign;
          body.velocity.x += jt / m;
          body.angularVelocity -= (sign * jt) / (m * r);
        } else if (body.position.y + body.radius > height) {
          body.position.y = height - body.radius;
          const sign = -1;
          const r = body.radius;
          const m = body.mass;
          const vn = body.velocity.y * sign;
          const vt = body.velocity.x + sign * body.angularVelocity * r;
          const jn = -(1 + body.restitution) * vn * m;
          let jt = -vt * m;
          const maxJt = Math.abs(jn) * body.friction;
          if (jt > maxJt) jt = maxJt;
          if (jt < -maxJt) jt = -maxJt;
          body.velocity.y += (jn / m) * sign;
          body.velocity.x += jt / m;
          body.angularVelocity -= (sign * jt) / (m * r);
        }
      }

      body.updateAABB();

      body.onUpdate?.(body);
    }

    const qt = new Quadtree(bodies, { minX: 0, minY: top, maxX: width, maxY: height });
    for (const [i, j] of qt.getPairs()) {
      const a = bodies[i]!;
      const b = bodies[j]!;
      if (a.radius === undefined || b.radius === undefined) continue;
      if (a.aabb.maxX < b.aabb.minX || a.aabb.minX > b.aabb.maxX) continue;
      if (a.aabb.maxY < b.aabb.minY || a.aabb.minY > b.aabb.maxY) continue;
      this.resolveCircleCollision(a, b);
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

    const r1 = a.radius ?? 0;
    const r2 = b.radius ?? 0;

    const contactAX = a.velocity.x - a.angularVelocity * r1 * ny;
    const contactAY = a.velocity.y + a.angularVelocity * r1 * nx;
    const contactBX = b.velocity.x + b.angularVelocity * r2 * ny;
    const contactBY = b.velocity.y - b.angularVelocity * r2 * nx;

    const relVelX = contactAX - contactBX;
    const relVelY = contactAY - contactBY;

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

      if (a.radius) a.angularVelocity += jt / m1 / a.radius;
      if (b.radius) b.angularVelocity -= jt / m2 / b.radius;
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
