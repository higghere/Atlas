import { Registry, Entity } from '../ecs/Registry';
import { SceneGraph } from '../scene/SceneNode';
import { TransformComponent } from '../transforms/TRS';
import { IComponent } from '../ecs/Registry';

export interface Landmark {
  name: string;
  localPosition: { x: number; y: number };
  worldPosition: { x: number; y: number };
}

export interface BoneComponent extends IComponent {
  readonly type: 'BoneComponent';
  id: string;
  displayName: string;
  latinName: string;
  bodyRegion: string;
  parentBone: string | null;
  children: string[];
  landmarks: Landmark[];
  boundingBox: { minX: number; minY: number; maxX: number; maxY: number };
  pivot: { x: number; y: number };
  rotation: number;
  defaultVisibility: boolean;
}

export interface RenderComponent extends IComponent {
  readonly type: 'RenderComponent';
  name: string;
  svgPaths: Record<string, string>; // Maps views ('anterior', 'posterior', 'leftLateral', 'rightLateral', 'superior', 'inferior') to paths
  lodMin: number; // minimum LOD level (e.g. 0 to 4)
  lodMax: number; // maximum LOD level
  layerType: 'skin' | 'fat' | 'muscle' | 'skeleton' | 'cardio' | 'respiratory' | 'digestive' | 'urinary' | 'endocrine' | 'lymphatic' | 'nerves';
  baseFill: string;
  baseStroke: string;
  baseStrokeWidth: number;
}

export interface RenderableNode {
  entityId: Entity;
  name: string;
  svgPath: string;
  transformCSS: string;
  visible: boolean;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  filter: string;
  className: string;
  layerType: string;
}

export class RenderPipeline {
  private registry: Registry;
  private sceneGraph: SceneGraph;

  constructor(registry: Registry, sceneGraph: SceneGraph) {
    this.registry = registry;
    this.sceneGraph = sceneGraph;
  }

  /**
   * Orchestrates the standard frame update:
   * SceneGraph Update -> LOD Check -> Layer Toggles -> Highlight Resolving -> Output list
   */
  public renderFrame(
    zoom: number,
    view: string,
    visibleLayers: Set<string>,
    layerOpacities: Record<string, number>,
    selectedEntityId: Entity | null,
    hoveredEntityId: Entity | null,
    organsState: Record<string, any>
  ): RenderableNode[] {
    // 1. Update World Matrices via TRS SceneGraph traversal
    this.sceneGraph.updateWorldMatrices();

    // 2. Query all renderable entities
    const renderEntities = this.registry.query(['RenderComponent', 'TransformComponent']);

    // 3. Resolve LOD Index (0: Entire skeleton, 1: Major bones, 2: Individual bones, 3: Landmarks, 4: Surface features)
    let currentLod = 0;
    if (zoom > 6.0) currentLod = 4;
    else if (zoom > 3.5) currentLod = 3;
    else if (zoom > 2.0) currentLod = 2;
    else if (zoom > 1.0) currentLod = 1;

    // Helper for structural highlighting/relationship cascades
    const isHighlighted = (id: Entity) => {
      if (!selectedEntityId) return true;
      if (selectedEntityId === id) return true;

      // Group highlights
      if (selectedEntityId.startsWith('bone-sternum') || selectedEntityId.startsWith('bone-ribs')) {
        return ['bone-sternum-manubrium', 'bone-sternum-body', 'bone-sternum-xiphoid', 'bone-ribs-true', 'bone-ribs-false', 'bone-ribs-floating'].includes(id);
      }
      return false;
    };

    const renderables: RenderableNode[] = [];

    // 4. Update Landmark World Coordinates using computed bone matrices
    for (const entity of renderEntities) {
      const transform = this.registry.getComponent<TransformComponent>(entity, 'TransformComponent');
      const bone = this.registry.getComponent<BoneComponent>(entity, 'BoneComponent');
      if (transform && bone) {
        for (const landmark of bone.landmarks) {
          landmark.worldPosition = transform.worldMatrix.transformPoint(
            landmark.localPosition.x,
            landmark.localPosition.y
          );
        }
      }
    }

    for (const entity of renderEntities) {
      const renderComp = this.registry.getComponent<RenderComponent>(entity, 'RenderComponent')!;
      const transformComp = this.registry.getComponent<TransformComponent>(entity, 'TransformComponent')!;

      // A. Layer Visibility Filter (Occlusion)
      const layerActive = visibleLayers.has(renderComp.layerType);
      if (!layerActive) continue;

      // B. LOD Filter
      const lodActive = currentLod >= renderComp.lodMin && currentLod <= renderComp.lodMax;
      if (!lodActive) continue;

      // C. Highlight check
      const highlight = isHighlighted(entity);
      const isSelected = selectedEntityId === entity;
      const isHovered = hoveredEntityId === entity;

      // D. Apply multi-view path selector
      const svgPath = renderComp.svgPaths[view] || renderComp.svgPaths['anterior'] || '';
      if (!svgPath) continue;

      let fill = renderComp.baseFill;
      let filter = isSelected ? 'url(#glow-selected)' : 'url(#organ-shadow)';
      let opacity = layerOpacities[renderComp.layerType] ?? 1.0;
      let className = 'transition-all duration-300 cursor-pointer';

      // Apply dynamic highlighting opacity fade
      if (!highlight) {
        opacity *= 0.22;
      }

      if (isHovered) {
        filter = 'url(#glow-selected)';
      }

      renderables.push({
        entityId: entity,
        name: renderComp.name,
        svgPath,
        transformCSS: transformComp.worldMatrix.toCSSTransform(),
        visible: true,
        opacity,
        fill,
        stroke: isSelected || isHovered ? '#22d3ee' : renderComp.baseStroke,
        strokeWidth: isSelected || isHovered ? 2.0 : renderComp.baseStrokeWidth,
        filter,
        className,
        layerType: renderComp.layerType
      });
    }

    return renderables;
  }
}
