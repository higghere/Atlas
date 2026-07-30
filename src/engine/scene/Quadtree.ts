export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuadtreeItem<T> {
  bounds: Bounds;
  value: T;
}

export class Quadtree<T> {
  private maxItems = 8;
  private maxLevels = 4;
  private level: number;
  private bounds: Bounds;
  private items: QuadtreeItem<T>[] = [];
  private nodes: Quadtree<T>[] = [];

  constructor(bounds: Bounds, level = 0) {
    this.bounds = bounds;
    this.level = level;
  }

  public clear(): void {
    this.items = [];
    for (const node of this.nodes) {
      node.clear();
    }
    this.nodes = [];
  }

  private split(): void {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    // 0: Top Right, 1: Top Left, 2: Bottom Left, 3: Bottom Right
    this.nodes[0] = new Quadtree<T>({ x: x + subWidth, y: y, width: subWidth, height: subHeight }, this.level + 1);
    this.nodes[1] = new Quadtree<T>({ x: x, y: y, width: subWidth, height: subHeight }, this.level + 1);
    this.nodes[2] = new Quadtree<T>({ x: x, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1);
    this.nodes[3] = new Quadtree<T>({ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1);
  }

  private getIndices(itemBounds: Bounds): number[] {
    const indices: number[] = [];
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const startIsNorth = itemBounds.y < horizontalMidpoint;
    const endIsSouth = itemBounds.y + itemBounds.height > horizontalMidpoint;
    const startIsWest = itemBounds.x < verticalMidpoint;
    const endIsEast = itemBounds.x + itemBounds.width > verticalMidpoint;

    if (startIsNorth) {
      if (endIsEast) indices.push(0);
      if (startIsWest) indices.push(1);
    }
    if (endIsSouth) {
      if (startIsWest) indices.push(2);
      if (endIsEast) indices.push(3);
    }

    return indices;
  }

  public insert(item: QuadtreeItem<T>): void {
    if (this.nodes.length > 0) {
      const indices = this.getIndices(item.bounds);
      for (const index of indices) {
        this.nodes[index].insert(item);
      }
      return;
    }

    this.items.push(item);

    if (this.items.length > this.maxItems && this.level < this.maxLevels) {
      this.split();
      for (const it of this.items) {
        const indices = this.getIndices(it.bounds);
        for (const index of indices) {
          this.nodes[index].insert(it);
        }
      }
      this.items = [];
    }
  }

  public query(searchBounds: Bounds, results: QuadtreeItem<T>[] = []): QuadtreeItem<T>[] {
    if (this.nodes.length > 0) {
      const indices = this.getIndices(searchBounds);
      for (const index of indices) {
        this.nodes[index].query(searchBounds, results);
      }
    }

    for (const item of this.items) {
      if (
        item.bounds.x < searchBounds.x + searchBounds.width &&
        item.bounds.x + item.bounds.width > searchBounds.x &&
        item.bounds.y < searchBounds.y + searchBounds.height &&
        item.bounds.y + item.bounds.height > searchBounds.y
      ) {
        // Deduplicate in case items cross grid boundaries
        if (!results.some(r => r.value === item.value)) {
          results.push(item);
        }
      }
    }

    return results;
  }
}
