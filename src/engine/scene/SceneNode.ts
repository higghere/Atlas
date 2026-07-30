import { Registry, Entity } from '../ecs/Registry';
import { TransformComponent } from '../transforms/TRS';
import { Matrix3x3 } from '../transforms/Matrix3x3';

export class SceneGraph {
  private registry: Registry;

  constructor(registry: Registry) {
    this.registry = registry;
  }

  /**
   * Iterates through all entities containing a TransformComponent,
   * computing their final world matrices in parent-first topological order.
   */
  public updateWorldMatrices(): void {
    const entities = this.registry.query(['TransformComponent']);
    const cache = new Map<Entity, Matrix3x3>();
    const visiting = new Set<Entity>(); // Cycle detection

    const resolveWorld = (entity: Entity): Matrix3x3 => {
      if (cache.has(entity)) {
        return cache.get(entity)!;
      }

      if (visiting.has(entity)) {
        console.warn(`SceneGraph: Transform hierarchy cycle detected at '${entity}'`);
        return Matrix3x3.identity();
      }

      visiting.add(entity);

      const transform = this.registry.getComponent<TransformComponent>(entity, 'TransformComponent');
      if (!transform) {
        visiting.delete(entity);
        return Matrix3x3.identity();
      }

      const localMat = transform.trs.getLocalMatrix();
      let worldMat = localMat;

      if (transform.parentId) {
        const parentMat = resolveWorld(transform.parentId);
        worldMat = parentMat.multiply(localMat);
      }

      transform.worldMatrix = worldMat;
      cache.set(entity, worldMat);
      visiting.delete(entity);

      return worldMat;
    };

    for (const entity of entities) {
      resolveWorld(entity);
    }
  }
}
