import { Registry, Entity } from '../ecs/Registry';
import { SceneGraph } from '../scene/SceneNode';
import { TransformComponent } from '../transforms/TRS';
import { IComponent } from '../ecs/Registry';

export interface RenderComponent extends IComponent {
  readonly type: 'RenderComponent';
  name: string;
  svgPath: string; // fallback/anterior path
  views?: {
    anterior?: string;
    posterior?: string;
    leftLateral?: string;
    rightLateral?: string;
    superior?: string;
    inferior?: string;
  };
  lodMin: number;
  lodMax: number;
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

  public renderFrame(
    zoom: number,
    visibleLayers: Set<string>,
    layerOpacities: Record<string, number>,
    selectedEntityId: Entity | null,
    hoveredEntityId: Entity | null,
    organsState: Record<string, any>,
    selectedView: 'anterior' | 'posterior' | 'leftLateral' | 'rightLateral' | 'superior' | 'inferior' = 'anterior'
  ): RenderableNode[] {
    // A. Apply view-specific transform modifications to the root "body" node
    const bodyTransform = this.registry.getComponent<TransformComponent>('body', 'TransformComponent');
    if (bodyTransform) {
      if (selectedView === 'posterior') {
        bodyTransform.trs.scale.x = -1.0;
        bodyTransform.trs.scale.y = 1.0;
        bodyTransform.trs.position.x = 0;
      } else if (selectedView === 'leftLateral') {
        bodyTransform.trs.scale.x = 0.45;
        bodyTransform.trs.scale.y = 1.0;
        bodyTransform.trs.position.x = -15;
      } else if (selectedView === 'rightLateral') {
        bodyTransform.trs.scale.x = -0.45;
        bodyTransform.trs.scale.y = 1.0;
        bodyTransform.trs.position.x = 15;
      } else if (selectedView === 'superior') {
        bodyTransform.trs.scale.x = 1.0;
        bodyTransform.trs.scale.y = 0.35;
        bodyTransform.trs.position.y = -80;
      } else if (selectedView === 'inferior') {
        bodyTransform.trs.scale.x = 1.0;
        bodyTransform.trs.scale.y = -0.35;
        bodyTransform.trs.position.y = 80;
      } else {
        // Anterior (standard)
        bodyTransform.trs.scale.x = 1.0;
        bodyTransform.trs.scale.y = 1.0;
        bodyTransform.trs.position.x = 0;
        bodyTransform.trs.position.y = 0;
      }
    }

    // 1. Update World Matrices via TRS SceneGraph traversal
    this.sceneGraph.updateWorldMatrices();

    // 2. Query all renderable entities
    const renderEntities = this.registry.query(['RenderComponent', 'TransformComponent']);

    // 3. Resolve LOD Index (0: entire, 1: major, 2: individual, 3: landmarks, 4: surface)
    let currentLod = 0;
    if (zoom > 8.0) currentLod = 4;
    else if (zoom > 4.5) currentLod = 3;
    else if (zoom > 2.0) currentLod = 2;
    else if (zoom > 1.0) currentLod = 1;

    // Helper for structural highlighting/relationship cascades
    const isHighlighted = (id: Entity) => {
      if (!selectedEntityId) return true;
      if (selectedEntityId === id) return true;

      // Highlight skeletal groupings
      if (selectedEntityId.startsWith('bone-sternum') || selectedEntityId.startsWith('bone-ribs')) {
        return ['bone-sternum-manubrium', 'bone-sternum-body', 'bone-sternum-xiphoid', 'bone-ribs-true', 'bone-ribs-false', 'bone-ribs-floating'].includes(id);
      }
      return false;
    };

    const renderables: RenderableNode[] = [];

    for (const entity of renderEntities) {
      const renderComp = this.registry.getComponent<RenderComponent>(entity, 'RenderComponent')!;
      const transformComp = this.registry.getComponent<TransformComponent>(entity, 'TransformComponent')!;

      // A. Layer Visibility Filter
      const layerActive = visibleLayers.has(renderComp.layerType);
      if (!layerActive) continue;

      // B. LOD Filter
      const lodActive = currentLod >= renderComp.lodMin && currentLod <= renderComp.lodMax;
      if (!lodActive) continue;

      // C. Highlight check
      const highlight = isHighlighted(entity);
      const isSelected = selectedEntityId === entity;
      const isHovered = hoveredEntityId === entity;

      // D. Styles
      let fill = renderComp.baseFill;
      let filter = isSelected ? 'url(#glow-selected)' : 'none';
      let opacity = layerOpacities[renderComp.layerType] ?? 1.0;
      let className = 'transition-all duration-300 cursor-pointer';

      if (!highlight) {
        opacity *= 0.25;
      }
      if (isHovered) {
        filter = 'url(#glow-selected)';
      }

      // E. Resolve path based on selected view
      let svgPath = renderComp.svgPath;
      if (renderComp.views) {
        if (selectedView === 'posterior' && renderComp.views.posterior) {
          svgPath = renderComp.views.posterior;
        } else if (selectedView === 'leftLateral' && renderComp.views.leftLateral) {
          svgPath = renderComp.views.leftLateral;
        } else if (selectedView === 'rightLateral' && renderComp.views.rightLateral) {
          svgPath = renderComp.views.rightLateral;
        } else if (selectedView === 'superior' && renderComp.views.superior) {
          svgPath = renderComp.views.superior;
        } else if (selectedView === 'inferior' && renderComp.views.inferior) {
          svgPath = renderComp.views.inferior;
        }
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
