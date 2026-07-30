export type Entity = string;

// Base interface for all components
export interface IComponent {
  readonly type: string;
}

export class Registry {
  private nextEntityId = 0;
  private entities = new Set<Entity>();
  private stores = new Map<string, Map<Entity, any>>();

  public createEntity(name?: string): Entity {
    const id = name || `entity_${this.nextEntityId++}`;
    if (this.entities.has(id)) {
      const uniqueId = `${id}_${this.nextEntityId++}`;
      this.entities.add(uniqueId);
      return uniqueId;
    }
    this.entities.add(id);
    return id;
  }

  public destroyEntity(entity: Entity): void {
    this.entities.delete(entity);
    for (const store of this.stores.values()) {
      store.delete(entity);
    }
  }

  public addComponent<T extends IComponent>(entity: Entity, component: T): void {
    if (!this.entities.has(entity)) {
      throw new Error(`Cannot add component: Entity '${entity}' does not exist.`);
    }
    const type = component.type;
    let store = this.stores.get(type);
    if (!store) {
      store = new Map<Entity, any>();
      this.stores.set(type, store);
    }
    store.set(entity, component);
  }

  public getComponent<T extends IComponent>(entity: Entity, type: string): T | undefined {
    const store = this.stores.get(type);
    return store ? (store.get(entity) as T) : undefined;
  }

  public hasComponent(entity: Entity, type: string): boolean {
    const store = this.stores.get(type);
    return store ? store.has(entity) : false;
  }

  public removeComponent(entity: Entity, type: string): void {
    const store = this.stores.get(type);
    if (store) {
      store.delete(entity);
    }
  }

  // Queries all entities that possess every one of the requested component types
  public query(requiredTypes: string[]): Entity[] {
    if (requiredTypes.length === 0) return Array.from(this.entities);

    // Start with the smallest component store if possible to optimize search
    let smallestType = requiredTypes[0];
    let smallestSize = Infinity;

    for (const type of requiredTypes) {
      const store = this.stores.get(type);
      const size = store ? store.size : 0;
      if (size < smallestSize) {
        smallestSize = size;
        smallestType = type;
      }
    }

    const primaryStore = this.stores.get(smallestType);
    if (!primaryStore || primaryStore.size === 0) return [];

    const matches: Entity[] = [];
    for (const entity of primaryStore.keys()) {
      let hasAll = true;
      for (const type of requiredTypes) {
        if (type === smallestType) continue;
        const store = this.stores.get(type);
        if (!store || !store.has(entity)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        matches.push(entity);
      }
    }

    return matches;
  }

  public clear(): void {
    this.entities.clear();
    this.stores.clear();
    this.nextEntityId = 0;
  }
}
