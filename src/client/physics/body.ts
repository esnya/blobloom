export interface Vector {
  x: number;
  y: number;
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
  angle = 0;
  angularVelocity = 0;
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
