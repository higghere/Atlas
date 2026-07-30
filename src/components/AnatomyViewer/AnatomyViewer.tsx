import React, { useState, useRef, useEffect, useMemo } from 'react';
import { OrganNode } from '../../types/physiology';
import { Eye, EyeOff, Search, Network } from 'lucide-react';
import { bonesCatalog, BoneMetadata } from '../../data/bones';
import { Registry } from '../../engine/ecs/Registry';
import { SceneGraph } from '../../engine/scene/SceneNode';
import { RenderPipeline, BoneComponent } from '../../engine/renderer/RenderPipeline';
import { SceneInitializer } from '../../engine/ecs/SceneInitializer';
import { SkeletalInteraction } from '../../atlas/skeleton/interaction/interaction';
import { SkeletalSearchIndex } from '../../atlas/skeleton/search/search';
import { SkeletalValidator } from '../../atlas/skeleton/validation/validation';
import { clinicalBoneDatabase } from '../../atlas/skeleton/metadata/boneMetadata';
import { JointComponent } from '../../atlas/skeleton/joints/joints';

interface AnatomyViewerProps {
  organs: Record<string, OrganNode>;
  selectedOrganId: string | null;
  onSelectOrgan: (id: string | null) => void;
  activeSystemId: string;
  onSelectSystem: (id: string) => void;
  activeMeds: Record<string, number>;
}

export const AnatomyViewer: React.FC<AnatomyViewerProps> = ({
  organs,
  selectedOrganId,
  onSelectOrgan,
  activeSystemId,
  onSelectSystem,
  activeMeds
}) => {
  // 11 Layers Opacity Controls
  const [opacitySkin, setOpacitySkin] = useState(0.1);
  const [opacityFat, setOpacityFat] = useState(0.0);
  const [opacityMuscle, setOpacityMuscle] = useState(0.0);
  const [opacitySkeleton, setOpacitySkeleton] = useState(0.35);
  const [opacityCardio, setOpacityCardio] = useState(0.4);
  const [opacityRespiratory, setOpacityRespiratory] = useState(0.6);
  const [opacityDigestive, setOpacityDigestive] = useState(0.5);
  const [opacityUrinary, setOpacityUrinary] = useState(0.6);
  const [opacityEndocrine, setOpacityEndocrine] = useState(0.0);
  const [opacityLymphatic, setOpacityLymphatic] = useState(0.0);
  const [opacityNerves, setOpacityNerves] = useState(0.3);

  // Layer Visibility states
  const [showSkin, setShowSkin] = useState(true);
  const [showFat, setShowFat] = useState(false);
  const [showMuscle, setShowMuscle] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showCardio, setShowCardio] = useState(true);
  const [showRespiratory, setShowRespiratory] = useState(true);
  const [showDigestive, setShowDigestive] = useState(true);
  const [showUrinary, setShowUrinary] = useState(true);
  const [showEndocrine, setShowEndocrine] = useState(false);
  const [showLymphatic, setShowLymphatic] = useState(false);
  const [showNerves, setShowNerves] = useState(true);

  const [treeSearch, setTreeSearch] = useState('');
  const [view, setView] = useState<string>('anterior');
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);
  const [isolatedBoneId, setIsolatedBoneId] = useState<string | null>(null);
  const [hiddenBones, setHiddenBones] = useState<Set<string>>(new Set());
  const [showAdjacentOnly, setShowAdjacentOnly] = useState(false);

  // Emojis for system filter tabs
  const systemTabs = [
    { id: 'all', icon: '🧍', name: 'Full Body' },
    { id: 'skeletal', icon: '🦴', name: 'Skeleton' }
  ];

  // Auto preset layer states on select tabs
  useEffect(() => {
    if (activeSystemId === 'skeletal') {
      setOpacitySkin(0.05); setOpacitySkeleton(0.95);
      setShowSkeleton(true); setShowSkin(true);
    } else {
      setOpacitySkin(0.1); setOpacitySkeleton(0.35);
      setShowSkin(true); setShowSkeleton(true);
    }
  }, [activeSystemId]);

  // Zoom & Pan
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Tooltip hover state
  const [hoveredOrgan, setHoveredOrgan] = useState<{
    id: string;
    name: string;
    x: number;
    y: number;
  } | null>(null);

  // Engine Core initialization
  const registry = useMemo(() => {
    const r = new Registry();
    SceneInitializer.initialize(r);
    return r;
  }, []);

  const sceneGraph = useMemo(() => new SceneGraph(registry), [registry]);
  const renderPipeline = useMemo(() => new RenderPipeline(registry, sceneGraph), [registry, sceneGraph]);

  const visibleLayers = useMemo(() => {
    const layers = new Set<string>();
    if (showSkin) layers.add('skin');
    if (showFat) layers.add('fat');
    if (showMuscle) layers.add('muscle');
    if (showSkeleton) layers.add('skeleton');
    if (showCardio) layers.add('cardio');
    if (showRespiratory) layers.add('respiratory');
    if (showDigestive) layers.add('digestive');
    if (showUrinary) layers.add('urinary');
    if (showEndocrine) layers.add('endocrine');
    if (showLymphatic) layers.add('lymphatic');
    if (showNerves) layers.add('nerves');
    return layers;
  }, [showSkin, showFat, showMuscle, showSkeleton, showCardio, showRespiratory, showDigestive, showUrinary, showEndocrine, showLymphatic, showNerves]);

  const layerOpacities = useMemo(() => {
    return {
      skin: opacitySkin,
      fat: opacityFat,
      muscle: opacityMuscle,
      skeleton: opacitySkeleton,
      cardio: opacityCardio,
      respiratory: opacityRespiratory,
      digestive: opacityDigestive,
      urinary: opacityUrinary,
      endocrine: opacityEndocrine,
      lymphatic: opacityLymphatic,
      nerves: opacityNerves
    };
  }, [opacitySkin, opacityFat, opacityMuscle, opacitySkeleton, opacityCardio, opacityRespiratory, opacityDigestive, opacityUrinary, opacityEndocrine, opacityLymphatic, opacityNerves]);

  const renderableNodes = useMemo(() => {
    return renderPipeline.renderFrame(
      zoom,
      view,
      visibleLayers,
      layerOpacities,
      selectedOrganId,
      hoveredOrgan?.id || null,
      organs
    );
  }, [renderPipeline, zoom, view, visibleLayers, layerOpacities, selectedOrganId, hoveredOrgan?.id, organs]);

  const adjacentBones = useMemo(() => {
    if (!selectedOrganId) return [];
    return SkeletalInteraction.getAdjacentBones(registry, selectedOrganId);
  }, [selectedOrganId, registry]);

  const processedNodes = useMemo(() => {
    return renderableNodes.map(node => {
      const clone = { ...node };
      
      // Hide filter
      if (hiddenBones.has(clone.entityId)) {
        clone.visible = false;
        clone.opacity = 0;
      }

      // Isolate filter
      if (isolatedBoneId) {
        if (clone.entityId === isolatedBoneId) {
          // Keep isolated bone visible
        } else if (showAdjacentOnly && adjacentBones.includes(clone.entityId)) {
          // Dim adjacent bones
          clone.opacity *= 0.25;
        } else {
          clone.visible = false;
          clone.opacity = 0;
        }
      }

      return clone;
    }).filter(n => n.visible && n.opacity > 0);
  }, [renderableNodes, hiddenBones, isolatedBoneId, showAdjacentOnly, adjacentBones]);

  // Dynamic selection and pathology highlighting logic
  const isHighlighted = (id: string) => {
    if (!selectedOrganId) return true; 
    if (selectedOrganId === id) return true;
    
    if (selectedOrganId === 'liver') {
      return ['liver', 'pancreas', 'gallbladder', 'duodenum', 'hepatic-vessels'].includes(id);
    }
    if (selectedOrganId === 'heart') {
      return ['heart', 'aorta', 'vena-cava', 'coronary-vessels'].includes(id);
    }
    if (selectedOrganId === 'lungs') {
      return ['lungs', 'trachea', 'bronchi'].includes(id);
    }
    return false;
  };

  const getOrganStateStyle = (id: string, baseFill: string) => {
    const organ = organs[id];
    const highlight = isHighlighted(id);
    const isSelected = selectedOrganId === id;

    let fill = baseFill;
    let filter = isSelected ? 'url(#glow-selected)' : 'url(#organ-shadow)';
    let opacity = highlight ? 1.0 : 0.22;
    let className = 'transition-all duration-300 cursor-pointer';

    if (organ) {
      const temp = organ.temporary;
      if (temp.integrity < 30) {
        fill = '#27272a'; 
      } else if (temp.oxygenation < 60) {
        fill = 'url(#grad-hypoxic)'; 
      } else if (temp.infection > 30) {
        fill = 'url(#grad-infected)'; 
      } else if (temp.inflammation > 35) {
        fill = 'url(#grad-inflamed)';
        filter = 'url(#glow-inflamed)';
        className += ' animate-pulse duration-500';
      } else if (temp.healing > 10) {
        filter = 'url(#glow-healing)';
      }
    }

    return { fill, filter, opacity, className };
  };

  // Bone selections styles
  const getBoneStyle = (id: string, defaultStroke = '#64748b', defaultFill = 'none') => {
    const isSelected = selectedOrganId === id;
    const highlight = !selectedOrganId || selectedOrganId === id;

    return {
      stroke: isSelected ? '#22d3ee' : defaultStroke,
      fill: defaultFill,
      opacity: highlight ? 1.0 : 0.25,
      filter: isSelected ? 'url(#glow-selected)' : 'none',
      className: 'transition-all duration-300 cursor-pointer hover:stroke-white hover:stroke-[2px]'
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'path' || (e.target as HTMLElement).tagName === 'circle' || (e.target as HTMLElement).tagName === 'line') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Dynamically group bones from catalog
  const skeletalGroups = [
    { id: 'cranium', name: '💀 Skull - Cranium' },
    { id: 'face', name: '顎 Skull - Facial Bones' },
    { id: 'spine', name: '脊 Vertebral Column' },
    { id: 'thorax', name: '籠 Thoracic Cage' },
    { id: 'pectoral', name: '肩 Shoulder Girdle' },
    { id: 'arm', name: '肱 Upper Limbs' },
    { id: 'hand', name: '掌 Wrist & Hand' },
    { id: 'pelvis', name: '骨 Pelvic Girdle' },
    { id: 'leg', name: '股 Lower Limbs' },
    { id: 'foot', name: '足 Ankle & Foot' }
  ];

  const organTreeData = [
    ...skeletalGroups.map(group => ({
      id: `skeletal-${group.id}`,
      name: group.name,
      children: bonesCatalog
        .filter(bone => bone.subCategory === group.id)
        .map(bone => ({
          id: bone.id,
          name: bone.name
        }))
    }))
  ];

  const filteredTree = useMemo(() => {
    if (!treeSearch.trim()) {
      return organTreeData;
    }
    const matchedBones = SkeletalSearchIndex.query(registry, treeSearch);
    const matchedIds = new Set(matchedBones.map(b => b.id));

    return organTreeData.map(system => {
      const matchingChildren = system.children.filter(child =>
        matchedIds.has(child.id) || child.name.toLowerCase().includes(treeSearch.toLowerCase())
      );
      return { ...system, children: matchingChildren };
    }).filter(system => system.children.length > 0);
  }, [organTreeData, treeSearch, registry]);

  const handleOrganHover = (e: React.MouseEvent, id: string) => {
    const bounds = viewportRef.current?.getBoundingClientRect();
    if (bounds) {
      const bone = bonesCatalog.find(b => b.id === id);
      setHoveredOrgan({
        id,
        name: bone ? bone.name : (organs[id]?.name || id),
        x: e.clientX - bounds.left + 15,
        y: e.clientY - bounds.top + 15
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      {/* 1. LEFT COLUMN: DIRECTORY TREE SEARCH & INSPECTOR */}
      <div className="lg:col-span-3 glass-panel p-3 flex flex-col h-full overflow-hidden select-none">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Network className="w-4 h-4 text-medical-400" />
          Anatomical Explorer
        </h3>
        <div className="relative mb-3 flex items-center">
          <input
            type="text"
            placeholder="Search anatomy..."
            value={treeSearch}
            onChange={(e) => setTreeSearch(e.target.value)}
            className="glass-input w-full pl-8"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-2.5" />
        </div>
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-0">
          {filteredTree.map(sys => (
            <div key={sys.id} className="text-xs">
              <div className="font-bold text-slate-400 bg-slate-950/20 px-2 py-1 rounded">
                {sys.name}
              </div>
              <div className="pl-3 mt-1 flex flex-col gap-1 border-l border-slate-900 ml-2">
                {sys.children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => onSelectOrgan(selectedOrganId === child.id ? null : child.id)}
                    className={`w-full text-left py-1 px-2 rounded hover:bg-slate-900/30 transition-all ${
                      selectedOrganId === child.id
                        ? 'text-medical-400 bg-medical-500/10 font-semibold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    ├─ {child.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Anatomical Element Inspector */}
        <div className="border-t border-slate-900 mt-3 pt-3 flex flex-col gap-2 shrink-0">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Anatomical Inspector
          </h4>
          {selectedOrganId ? (
            (() => {
              const boneComp = registry.getComponent<BoneComponent>(selectedOrganId, 'BoneComponent');
              if (boneComp) {
                const desc = bonesCatalog.find(b => b.id === selectedOrganId)?.description || '';
                const clinical = clinicalBoneDatabase[selectedOrganId];
                
                // Query joint entities connecting this bone
                const joints = registry.query(['JointComponent']);
                const connectedJoints: JointComponent[] = [];
                for (const jId of joints) {
                  const jComp = registry.getComponent<JointComponent>(jId, 'JointComponent');
                  if (jComp && jComp.connectedBones.includes(selectedOrganId)) {
                    connectedJoints.push(jComp);
                  }
                }

                const isIsolated = isolatedBoneId === selectedOrganId;
                const isHidden = hiddenBones.has(selectedOrganId);

                return (
                  <div className="text-[10px] text-slate-300 flex flex-col gap-2.5 bg-slate-950/40 p-2.5 rounded border border-slate-900 max-h-[460px] overflow-y-auto select-text">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-cyan-400 text-xs leading-tight">{boneComp.displayName}</div>
                        <div className="text-[8px] text-slate-500 uppercase font-semibold tracking-wider">
                          {boneComp.latinName}
                        </div>
                      </div>
                      <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded">
                        {clinical?.boneType || 'flat'}
                      </span>
                    </div>

                    {/* Interactive Action Controls */}
                    <div className="grid grid-cols-3 gap-1.5 border-y border-slate-900 py-1.5">
                      <button
                        onClick={() => {
                          setIsolatedBoneId(isIsolated ? null : selectedOrganId);
                          setShowAdjacentOnly(true);
                        }}
                        className={`py-1 px-1.5 rounded text-[8px] font-bold uppercase transition-all ${
                          isIsolated ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850'
                        }`}
                      >
                        {isIsolated ? 'Exit Isolate' : 'Isolate'}
                      </button>
                      <button
                        onClick={() => {
                          const next = new Set(hiddenBones);
                          if (isHidden) next.delete(selectedOrganId);
                          else next.add(selectedOrganId);
                          setHiddenBones(next);
                        }}
                        className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 text-[8px] font-bold uppercase"
                      >
                        {isHidden ? 'Show' : 'Hide'}
                      </button>
                      <button
                        onClick={() => setShowAdjacentOnly(!showAdjacentOnly)}
                        className={`py-1 px-1.5 rounded text-[8px] font-bold uppercase transition-all ${
                          showAdjacentOnly ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850'
                        }`}
                        disabled={!isIsolated}
                        title="Show adjacent bones during isolation"
                      >
                        + Adjacent
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 leading-relaxed">{desc}</p>

                    {/* Educational / Clinical Details */}
                    {clinical && (
                      <div className="flex flex-col gap-2 border-t border-slate-900 pt-2">
                        <div>
                          <span className="text-slate-500 font-semibold uppercase text-[8px] block">Arterial Supply:</span>
                          <span className="text-slate-400 block">{clinical.bloodSupply}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold uppercase text-[8px] block">Innervation:</span>
                          <span className="text-slate-400 block">{clinical.nerveSupply}</span>
                        </div>
                        {clinical.muscleOrigins.length > 0 && (
                          <div>
                            <span className="text-slate-500 font-semibold uppercase text-[8px] block">Muscle Origins:</span>
                            <span className="text-slate-400 block">{clinical.muscleOrigins.join(', ')}</span>
                          </div>
                        )}
                        {clinical.muscleInsertions.length > 0 && (
                          <div>
                            <span className="text-slate-500 font-semibold uppercase text-[8px] block">Muscle Insertions:</span>
                            <span className="text-slate-400 block">{clinical.muscleInsertions.join(', ')}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-500 font-semibold uppercase text-[8px] block">Clinical Notes:</span>
                          <span className="text-slate-400 block italic">{clinical.clinicalNotes}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold uppercase text-[8px] block">Fractures:</span>
                          <span className="text-slate-400 block">{clinical.commonFractures}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold uppercase text-[8px] block">Did You Know?</span>
                          <span className="text-slate-400 block">{clinical.interestingFacts}</span>
                        </div>
                      </div>
                    )}

                    {/* Scene Graph hierarchy links */}
                    <div className="grid grid-cols-2 gap-2 mt-1 border-t border-slate-900 pt-1 text-[8px] text-slate-500">
                      <div>
                        <span className="font-semibold uppercase block">Parent Node:</span>
                        <span className="text-slate-400 block truncate">{boneComp.parentBone || 'None (Root)'}</span>
                      </div>
                      <div>
                        <span className="font-semibold uppercase block">Pivot Point:</span>
                        <span className="text-slate-400 block">({boneComp.pivot.x}, {boneComp.pivot.y})</span>
                      </div>
                    </div>

                    {boneComp.children.length > 0 && (
                      <div className="mt-1">
                        <span className="text-slate-500 font-semibold uppercase text-[8px] block">Child Nodes:</span>
                        <span className="text-slate-400 block max-h-12 overflow-y-auto leading-relaxed">
                          {boneComp.children.map(c => c.replace('bone-', '')).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Joint Articulations */}
                    {connectedJoints.length > 0 && (
                      <div className="mt-1.5 border-t border-slate-900 pt-1.5">
                        <span className="text-slate-500 font-semibold uppercase text-[8px] block mb-1">Joint Articulations:</span>
                        <div className="flex flex-col gap-1.5">
                          {connectedJoints.map((j, i) => (
                            <div key={i} className="bg-slate-950/40 p-1.5 rounded border border-slate-900">
                              <div className="font-bold text-slate-300">{j.displayName}</div>
                              <div className="text-[8px] text-slate-500 uppercase mt-0.5">
                                Type: {j.jointType} | DoF: {j.degreesOfFreedom}
                              </div>
                              {Object.keys(j.rangeOfMotion).length > 0 && (
                                <div className="text-[8px] text-slate-400 mt-0.5">
                                  Range: {Object.entries(j.rangeOfMotion).map(([k, v]) => `${k}: ${v?.[0]}° to ${v?.[1]}°`).join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Landmarks Anchors coordinates */}
                    {boneComp.landmarks.length > 0 && (
                      <div className="mt-1.5 border-t border-slate-900 pt-1.5">
                        <span className="text-slate-500 font-semibold uppercase text-[8px] block mb-1">Active Landmarks:</span>
                        <ul className="flex flex-col gap-1">
                          {boneComp.landmarks.map((l, i) => (
                            <li key={i} className="flex justify-between bg-slate-950/60 px-1.5 py-1 rounded border border-slate-900/60">
                              <span className="font-bold text-cyan-400">{l.name}</span>
                              <span className="text-[8px] text-slate-500 font-mono">
                                W: ({l.worldPosition.x.toFixed(1)}, {l.worldPosition.y.toFixed(1)})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }
              return <div className="text-slate-500 text-xs italic">Unknown element.</div>;
            })()
          ) : (
            <div className="text-slate-500 text-[10px] italic bg-slate-950/20 p-2.5 rounded border border-slate-900/40 text-center">
              Select any bone to inspect its coordinate structures.
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER COLUMN: LARGE BODY VIEWPORT */}
      <div className="lg:col-span-9 glass-panel flex flex-col h-full relative overflow-hidden select-none" ref={viewportRef}>
        
        {/* Navigation tabs */}
        <div className="flex justify-between items-center p-3 border-b border-slate-900 bg-slate-950/20 backdrop-blur-sm z-10">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {systemTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onSelectSystem(tab.id)}
                title={tab.name}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200 ${
                  activeSystemId === tab.id
                    ? 'bg-medical-600/30 border-medical-500/50 text-medical-300 shadow-md'
                    : 'bg-slate-900/40 border-slate-800/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="hidden md:inline">{tab.name}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {/* Skeletal Validation Badge */}
            {(() => {
              const report = SkeletalValidator.validate(registry);
              return (
                <div
                  title={report.isValid ? "Skeletal system meets all anatomical specifications, digit counts, proportions, and symmetries." : report.errors.join('\n')}
                  className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                    report.isValid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Skeletal Validation: {report.isValid ? "PASSED" : "FAILED"}
                </div>
              );
            })()}

            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="glass-input text-[10px] uppercase font-bold tracking-wider rounded px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              {[
                { id: 'anterior', name: 'Anterior (Front)' },
                { id: 'posterior', name: 'Posterior (Back)' },
                { id: 'leftLateral', name: 'Left Lateral (Profile)' },
                { id: 'rightLateral', name: 'Right Lateral (Profile)' },
                { id: 'superior', name: 'Superior (Top)' },
                { id: 'inferior', name: 'Inferior (Bottom)' }
              ].map(v => (
                <option key={v.id} value={v.id} className="bg-slate-950 text-slate-300 font-sans text-xs">
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Viewport canvas */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 bg-slate-950/30 relative flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {/* LEFT OVERLAY: OPACITY CONTROLLER SLIDERS */}
          <div className="absolute top-4 left-4 p-3 bg-slate-900/85 border border-slate-800/60 rounded-xl backdrop-blur-md z-10 flex flex-col gap-2 text-[9px] text-slate-400 w-44 shadow-2xl">
            <div className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 mb-1">
              ANATOMICAL LAYERS
            </div>
            {[
              { label: '1. Skin Envelope', val: opacitySkin, set: setOpacitySkin, show: showSkin, toggle: setShowSkin },
              { label: '2. Skeleton Frame', val: opacitySkeleton, set: setOpacitySkeleton, show: showSkeleton, toggle: setShowSkeleton }
            ].map(layer => (
              <div key={layer.label} className="flex flex-col gap-0.5">
                <div className="flex justify-between font-semibold items-center">
                  <span>{layer.label}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        layer.toggle(!layer.show);
                        layer.set(layer.show ? 0.0 : 0.85);
                      }}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {layer.show ? <Eye className="w-3 h-3 text-medical-400" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <span className="text-slate-600 w-6 text-right">{Math.round(layer.val * 100)}%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={layer.val}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    layer.set(v);
                    layer.toggle(v > 0);
                  }}
                  className="accent-medical-500 h-1 bg-slate-950 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* TOP RIGHT OVERLAY: ZOOM MINIMAP VIEWPORT */}
          <div className="absolute top-4 right-4 p-2 bg-slate-900/80 border border-slate-800/80 rounded-xl z-10 w-24 h-32 flex flex-col items-center justify-between shadow-lg shadow-black/20 text-[8px] text-slate-500">
            <span className="font-semibold tracking-wider uppercase text-[7px] text-slate-400">Viewport Minimap</span>
            <div className="relative border border-slate-800 w-16 h-24 bg-slate-950/60 rounded flex items-center justify-center">
              <div className="absolute inset-2 border border-slate-900 rounded-full opacity-10 bg-slate-900" />
              <div
                style={{
                  width: `${Math.max(15, 60 / zoom)}%`,
                  height: `${Math.max(15, 80 / zoom)}%`,
                  transform: `translate(${Math.max(-25, Math.min(25, -pan.x / 15))}px, ${Math.max(-30, Math.min(30, -pan.y / 10))}px)`,
                  transition: 'all 0.15s ease-out'
                }}
                className="border border-medical-500/50 bg-medical-500/5 rounded shadow-sm shadow-medical-500/10"
              />
            </div>
          </div>

          {/* SVG Vector Render */}
          <svg
            width="100%"
            height="100%"
            viewBox="-200 -250 400 500"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom * 1.35})` 
            }}
            className="w-full h-full transition-all duration-300"
          >
            {/* STYLES & RADIAL GRADIENTS FOR 3D RENDER DEPTH */}
            <defs>
              <filter id="organ-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#000" floodOpacity="0.6" />
              </filter>
              <filter id="glow-selected">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-inflamed">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Organ Gradients */}
              <radialGradient id="grad-brain" cx="45%" cy="35%" r="55%">
                <stop offset="0%" stopColor="#fecdd3" />
                <stop offset="60%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#9f1239" />
              </radialGradient>
              <radialGradient id="grad-cerebellum" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="85%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#881337" />
              </radialGradient>
              <radialGradient id="grad-heart" cx="35%" cy="35%" r="55%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="65%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#4c0519" />
              </radialGradient>
              <radialGradient id="grad-lungs" cx="40%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#ffe4e6" />
                <stop offset="70%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#9f1239" />
              </radialGradient>
              <linearGradient id="grad-liver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a16207" />
                <stop offset="60%" stopColor="#713f12" />
                <stop offset="100%" stopColor="#422006" />
              </linearGradient>
              <linearGradient id="grad-stomach" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fecdd3" />
                <stop offset="70%" stopColor="#fda4af" />
                <stop offset="100%" stopColor="#9f1239" />
              </linearGradient>
              <radialGradient id="grad-kidneys" cx="40%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="70%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#4c0519" />
              </radialGradient>
              <linearGradient id="grad-pancreas" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="65%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>

              {/* Dynamic state fills */}
              <radialGradient id="grad-hypoxic" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="70%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#164e63" />
              </radialGradient>
              <linearGradient id="grad-infected" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bef264" />
                <stop offset="65%" stopColor="#84cc16" />
                <stop offset="100%" stopColor="#3f6212" />
              </linearGradient>
              <radialGradient id="grad-inflamed" cx="30%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="65%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#450a0a" />
              </radialGradient>
            </defs>

            {/* STACKED RENDERING SYSTEM - ECS DRIVEN SCENE GRAPH GRAPHICS */}
            <g id="layer-ecs-pipeline" className="transition-all duration-300">
              {processedNodes.map((node) => (
                <path
                  key={node.entityId}
                  d={node.svgPath}
                  transform={node.transformCSS}
                  fill={node.fill}
                  stroke={node.stroke}
                  strokeWidth={node.strokeWidth}
                  filter={node.filter}
                  className={node.className}
                  opacity={node.opacity}
                  onClick={(e) => { e.stopPropagation(); onSelectOrgan(node.entityId); }}
                  onMouseEnter={(e) => handleOrganHover(e, node.entityId)}
                  onMouseMove={(e) => handleOrganHover(e, node.entityId)}
                  onMouseLeave={() => setHoveredOrgan(null)}
                />
              ))}
            </g>

            {/* L. SKIN ENVELOPE */}
            {showSkin && (
              <path
                id="layer-skin"
                d="M 0 -240 C 20 -240, 24 -195, 18 -180 C 18 -165, 25 -155, 55 -150 C 60 -150, 65 -130, 70 -90 C 75 -50, 82 0, 82 25 C 82 35, 85 45, 83 60 C 81 72, 76 72, 74 65 C 72 50, 66 10, 63 -25 C 61 -60, 50 -105, 44 -115 C 40 -115, 34 -90, 34 -60 C 34 -30, 38 0, 25 0 C 25 30, 35 90, 35 120 C 35 150, 38 195, 38 220 C 38 235, 30 240, 25 240 L 12 240 C 15 220, 10 190, 5 130 L -5 130 C -10 190, -15 220, -12 240 L -25 240 C -30 240, -38 235, -38 220 C -38 195, -35 150, -35 120 C -35 90, -25 30, -25 0 C -38 0, -34 -30, -34 -60 C -34 -90, -40 -115, -44 -115 C -50 -105, -61 -60, -63 -25 C -66 10, -72 50, -74 65 C -76 72, -81 72, -83 60 C -85 45, -82 35, -82 25 C -82 0, -75 -50, -70 -90 C -65 -130, -60 -150, -55 -150 C -25 -155, -18 -165, -18 -180 C -24 -195, -20 -240, 0 -240 Z"
                fill="#0f172a"
                fillOpacity={opacitySkin}
                stroke="#22d3ee"
                strokeWidth="1.2"
                strokeOpacity="0.25"
                className="transition-all duration-300"
              />
            )}

            {/* M. ANATOMICAL SURFACE LANDMARKS GUIDE */}
            <g id="anatomical-landmarks" stroke="#22d3ee" strokeWidth="1" strokeDasharray="1,1" opacity="0.5">
              <path d="M -30 -38 Q 0 -34, 30 -38" fill="none" onMouseEnter={() => setHoveredLandmark('Costal Margin')} onMouseLeave={() => setHoveredLandmark(null)} className="cursor-pointer hover:stroke-white hover:stroke-[2px]" />
              <circle cx="0" cy="-28" r="2.5" fill="#22d3ee" fillOpacity="0.4" onMouseEnter={() => setHoveredLandmark('Umbilicus')} onMouseLeave={() => setHoveredLandmark(null)} className="cursor-pointer hover:fill-white" />
              <path d="M -30 -22 Q 0 -24, 30 -22" fill="none" onMouseEnter={() => setHoveredLandmark('Iliac Crest')} onMouseLeave={() => setHoveredLandmark(null)} className="cursor-pointer hover:stroke-white hover:stroke-[2px]" />
            </g>
          </svg>

          {/* FLOATING HOVER CARD TOOLTIP */}
          {hoveredOrgan && (
            (() => {
              const bone = bonesCatalog.find(b => b.id === hoveredOrgan.id);
              if (bone) {
                return (
                  <div
                    style={{
                      left: hoveredOrgan.x,
                      top: hoveredOrgan.y,
                      pointerEvents: 'none'
                    }}
                    className="absolute z-30 w-48 bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-2xl text-[10px] text-slate-300 font-sans backdrop-blur-md animate-fade-in"
                  >
                    <div className="font-bold text-slate-100 uppercase border-b border-slate-900 pb-1 mb-1.5 flex justify-between">
                      <span>{bone.name}</span>
                      <span className="text-cyan-400 font-bold uppercase text-[7px]">{bone.subCategory}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-slate-400">
                      <p className="text-slate-300 leading-snug">{bone.description}</p>
                      {bone.joints.length > 0 && (
                        <div className="mt-1 border-t border-slate-900 pt-1 text-[8px]">
                          <strong>Joints:</strong> {bone.joints.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              const organNode = organs[hoveredOrgan.id];
              if (organNode) {
                return (
                  <div
                    style={{
                      left: hoveredOrgan.x,
                      top: hoveredOrgan.y,
                      pointerEvents: 'none'
                    }}
                    className="absolute z-30 w-48 bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-2xl text-[10px] text-slate-300 font-sans backdrop-blur-md animate-fade-in"
                  >
                    <div className="font-bold text-slate-100 uppercase border-b border-slate-900 pb-1 mb-1.5 flex justify-between">
                      <span>{hoveredOrgan.name}</span>
                      <span className={organNode.temporary.health < 40 ? 'text-red-400' : 'text-emerald-400'}>
                        {organNode.temporary.health.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-slate-400">
                      <div>Perfusion: <strong>{organNode.temporary.perfusion.toFixed(0)}%</strong></div>
                      <div>Oxygenation: <strong>{organNode.temporary.oxygenation.toFixed(0)}%</strong></div>
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}

          {/* Hovered Landmark Label */}
          {hoveredLandmark && (
            <div className="absolute top-16 right-4 px-3 py-1.5 bg-slate-950/90 border border-cyan-800/60 text-cyan-400 rounded-lg text-[9px] uppercase font-bold tracking-wider shadow-md backdrop-blur-sm animate-pulse">
              Landmark: {hoveredLandmark}
            </div>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <button onClick={() => setZoom(z => Math.min(2.5, z + 0.25))} className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-850">+</button>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-850">-</button>
            <button onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }} className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[9px] uppercase font-bold text-slate-400 hover:text-white">Reset View</button>
          </div>
        </div>
      </div>
    </div>
  );
};
