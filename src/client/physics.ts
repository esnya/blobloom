export interface Vector {
  x: number;
  y: number;
}

export interface Body {
  position: Vector;
  velocity: Vector;
  angle: number;
  angularVelocity: number;
  mass: number;
  radius?: number;
  width?: number;
  height?: number;
  isStatic?: boolean;
  restitution: number;
  frictionAir: number;
}

export interface Engine {
  world: { bodies: Body[] };
  gravity: { y: number; scale: number };
  bounds: { width: number; height: number };
}

export const Engine = {
  create(width = 0, height = 0): Engine {
    return {
      world: { bodies: [] },
      gravity: { y: 1, scale: 0.001 },
      bounds: { width, height },
    };
  },
  update(engine: Engine, delta: number) {
    const g = engine.gravity.y * engine.gravity.scale;
    const { width, height } = engine.bounds;
    const bodies = engine.world.bodies;
    for (const body of bodies) {
      if (body.isStatic) continue;
      body.velocity.y += g * delta;
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
        if (body.position.y - body.radius < 0) {
          body.position.y = body.radius;
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
        const dist = Math.hypot(dx, dy);
        const overlap = a.radius + b.radius - dist;
        if (overlap <= 0) continue;
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
        if (!a.isStatic)
          a.angularVelocity -= (vt * friction) / a.radius;
        if (!b.isStatic)
          b.angularVelocity += (vt * friction) / b.radius;
      }
    }
  },
};

export const Bodies = {
  circle(
    x: number,
    y: number,
    r: number,
    opts: Partial<Pick<Body, 'restitution' | 'frictionAir' | 'mass'>> = {},
  ): Body {
    return {
      position: { x, y },
      velocity: { x: 0, y: 0 },
      angle: 0,
      angularVelocity: 0,
      mass: opts.mass ?? r * r,
      radius: r,
      restitution: opts.restitution ?? 0,
      frictionAir: opts.frictionAir ?? 0,
    };
  },
  rectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    opts: Partial<Pick<Body, 'isStatic' | 'mass'>> = {},
  ): Body {
    const mass = opts.mass ?? width * height;
    return {
      position: { x, y },
      velocity: { x: 0, y: 0 },
      angle: 0,
      angularVelocity: 0,
      mass,
      width,
      height,
      isStatic: opts.isStatic ?? false,
      restitution: 0,
      frictionAir: 0,
    };
  },
};

export const Body = {
  setVelocity(body: Body, vel: Vector) {
    body.velocity = { ...vel };
  },
  setPosition(body: Body, pos: Vector) {
    body.position = { ...pos };
  },
  setAngularVelocity(body: Body, val: number) {
    body.angularVelocity = val;
  },
  scale(body: Body, sx: number, sy: number) {
    if (body.radius !== undefined) {
      const f = (sx + sy) / 2;
      body.radius *= f;
      body.mass *= f * f;
    } else {
      if (body.width !== undefined) body.width *= sx;
      if (body.height !== undefined) body.height *= sy;
      body.mass *= sx * sy;
    }
  },
};

export const Composite = {
  add(world: { bodies: Body[] }, body: Body | Body[]) {
    if (Array.isArray(body)) world.bodies.push(...body);
    else world.bodies.push(body);
  },
  remove(world: { bodies: Body[] }, body: Body | Body[]) {
    if (Array.isArray(body)) {
      for (const b of body) {
        const i = world.bodies.indexOf(b);
        if (i >= 0) world.bodies.splice(i, 1);
      }
    } else {
      const i = world.bodies.indexOf(body);
      if (i >= 0) world.bodies.splice(i, 1);
    }
  },
};
