import { Registry, Entity } from '../ecs/Registry';
import { SceneGraph } from '../scene/SceneNode';
import { TransformComponent } from '../transforms/TRS';
import { IComponent } from '../ecs/Registry';

export interface RenderComponent extends IComponent {
  readonly type: 'RenderComponent';
  name: string;
  svgPath: string;
  lodMin: number; // minimum LOD level (e.g. 0 to 6)
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
    visibleLayers: Set<string>,
    layerOpacities: Record<string, number>,
    selectedEntityId: Entity | null,
    hoveredEntityId: Entity | null,
    organsState: Record<string, any> // physiology/simulation state
  ): RenderableNode[] {
    // 1. Update World Matrices via TRS SceneGraph traversal
    this.sceneGraph.updateWorldMatrices();

    // 2. Query all renderable entities
    const renderEntities = this.registry.query(['RenderComponent', 'TransformComponent']);

    // 3. Resolve LOD Index (0: whole human, 1: regional, 2: major organs, 3: internal organ divisions)
    let currentLod = 0;
    if (zoom > 8.0) currentLod = 4;
    else if (zoom > 4.5) currentLod = 3;
    else if (zoom > 2.0) currentLod = 2;
    else if (zoom > 1.0) currentLod = 1;

    // Helper for structural highlighting/relationship cascades
    const isHighlighted = (id: Entity) => {
      if (!selectedEntityId) return true;
      if (selectedEntityId === id) return true;

      // Highlight cardiovascular structures
      if (selectedEntityId === 'heart' || selectedEntityId.startsWith('bone-sternum') || selectedEntityId.startsWith('bone-ribs')) {
        return ['heart', 'aorta', 'vena-cava', 'coronary-vessels', 'bone-sternum-manubrium', 'bone-sternum-body', 'bone-sternum-xiphoid', 'bone-ribs-true', 'bone-ribs-false', 'bone-ribs-floating'].includes(id);
      }
      // Highlight digestive structures
      if (selectedEntityId === 'liver') {
        return ['liver', 'pancreas', 'gallbladder', 'duodenum', 'hepatic-vessels'].includes(id);
      }
      if (selectedEntityId === 'lungs') {
        return ['lungs', 'trachea', 'bronchi'].includes(id);
      }
      return false;
    };

    const renderables: RenderableNode[] = [];

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

      // D. Apply Physiology/Simulation styling overrides
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

      // Check organ physiology states (Integrity, Oxygenation, Infection, Inflammation)
      const state = organsState[entity];
      if (state) {
        if (state.integrity < 30) {
          fill = '#27272a'; // Necrotic decay
        } else if (state.oxygenation < 60) {
          fill = 'url(#grad-hypoxic)'; // Cyanosis blue
        } else if (state.infection > 30) {
          fill = 'url(#grad-infected)'; // Infected speckled
        } else if (state.inflammation > 35) {
          fill = 'url(#grad-inflamed)';
          filter = 'url(#glow-inflamed)';
          className += ' animate-pulse duration-500';
        } else if (state.healing > 10) {
          filter = 'url(#glow-healing)';
        }
      }

      renderables.push({
        entityId: entity,
        name: renderComp.name,
        svgPath: renderComp.svgPath,
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
