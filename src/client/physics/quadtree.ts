import type { Body } from './body';

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

export class Quadtree {
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
