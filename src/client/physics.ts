export interface Vector {
  x: number;
  y: number;
}

export interface Body {
  position: Vector;
  velocity: Vector;
  angle: number;
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
}

export const Engine = {
  create(): Engine {
    return {
      world: { bodies: [] },
      gravity: { y: 1, scale: 0.001 },
    };
  },
  update(engine: Engine, delta: number) {
    const g = engine.gravity.y * engine.gravity.scale;
    for (const body of engine.world.bodies) {
      if (body.isStatic) continue;
      body.velocity.y += g * delta;
      body.velocity.x *= 1 - body.frictionAir;
      body.velocity.y *= 1 - body.frictionAir;
      body.position.x += body.velocity.x;
      body.position.y += body.velocity.y;
    }
  },
};

export const Bodies = {
  circle(x: number, y: number, r: number, opts: Partial<Pick<Body, 'restitution' | 'frictionAir'>> = {}): Body {
    return {
      position: { x, y },
      velocity: { x: 0, y: 0 },
      angle: 0,
      radius: r,
      restitution: opts.restitution ?? 0,
      frictionAir: opts.frictionAir ?? 0,
    };
  },
  rectangle(x: number, y: number, width: number, height: number, opts: Partial<Pick<Body, 'isStatic'>> = {}): Body {
    return {
      position: { x, y },
      velocity: { x: 0, y: 0 },
      angle: 0,
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
  scale(body: Body, sx: number, sy: number) {
    if (body.radius !== undefined) {
      body.radius *= (sx + sy) / 2;
    } else {
      if (body.width !== undefined) body.width *= sx;
      if (body.height !== undefined) body.height *= sy;
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
