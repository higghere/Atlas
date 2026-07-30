import React, { useState, useRef, useEffect, useMemo } from 'react';
import skeletalPng from '../../assets/skeletal_system.png';
import muscularPng from '../../assets/muscular_system.png';
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
import { muscleDatabase, muscleDatabaseMap } from '../../atlas/muscles/data/muscleData';
import { MuscleComponent } from '../../atlas/muscles/entities/MuscleComponent';
import { MUSCLE_HIT_ZONES } from '../../atlas/muscles/render/muscleHitZones';
import { MuscleSearchIndex } from '../../atlas/muscles/search/muscleSearch';
import { MuscleInteraction } from '../../atlas/muscles/interaction/muscleInteraction';
import { MUSCLE_GROUP_META, FASCIAL_LAYER_META } from '../../atlas/muscles/layers/fascialLayers';

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
  // Reference image & overlay layer
  const [showRefImage, setShowRefImage] = useState(true);
  const [refImageOpacity, setRefImageOpacity] = useState(1.0);
  const [showHitZones, setShowHitZones] = useState(true);

  // ── Phase 2: Muscle layer state ──────────────────────────────
  const [showMuscleHitZones, setShowMuscleHitZones] = useState(true);
  const [muscleLayerFilter, setMuscleLayerFilter] = useState<'all' | 'superficial' | 'intermediate' | 'deep' | 'intrinsic'>('all');
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);
  const [highlightSynergists, setHighlightSynergists] = useState(false);
  const [highlightAntagonists, setHighlightAntagonists] = useState(false);
  const [muscleSearch, setMuscleSearch] = useState('');
  const [isolatedMuscleId, setIsolatedMuscleId] = useState<string | null>(null);
  const [hiddenMuscles, setHiddenMuscles] = useState<Set<string>>(new Set());

  // Legacy layer opacity states (kept for compatibility)
  const [opacitySkin, setOpacitySkin] = useState(0.1);
  const [opacityFat] = useState(0.0);
  const [opacityMuscle] = useState(0.0);
  const [opacitySkeleton, setOpacitySkeleton] = useState(0.35);
  const [opacityCardio] = useState(0.4);
  const [opacityRespiratory] = useState(0.6);
  const [opacityDigestive] = useState(0.5);
  const [opacityUrinary] = useState(0.6);
  const [opacityEndocrine] = useState(0.0);
  const [opacityLymphatic] = useState(0.0);
  const [opacityNerves] = useState(0.3);

  // Layer Visibility states
  const [showSkin, setShowSkin] = useState(true);
  const [showFat] = useState(false);
  const [showMuscle] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showCardio] = useState(true);
  const [showRespiratory] = useState(true);
  const [showDigestive] = useState(true);
  const [showUrinary] = useState(true);
  const [showEndocrine] = useState(false);
  const [showLymphatic] = useState(false);
  const [showNerves] = useState(true);

  const [treeSearch, setTreeSearch] = useState('');
  const [view, setView] = useState<string>('anterior');
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);
  const [isolatedBoneId, setIsolatedBoneId] = useState<string | null>(null);
  const [hiddenBones, setHiddenBones] = useState<Set<string>>(new Set());
  const [showAdjacentOnly, setShowAdjacentOnly] = useState(false);

  // Emojis for system filter tabs
  const systemTabs = [
    { id: 'all',      icon: '🧍', name: 'Full Body' },
    { id: 'skeletal', icon: '🦴', name: 'Skeleton' },
    { id: 'muscular', icon: '💪', name: 'Muscular' },
  ];

  // Auto preset layer states on select tabs
  useEffect(() => {
    if (activeSystemId === 'skeletal') {
      setOpacitySkin(0.05); setOpacitySkeleton(0.95);
      setShowSkeleton(true); setShowSkin(true);
      setShowMuscleHitZones(false);
    } else if (activeSystemId === 'muscular') {
      setOpacitySkin(0.05); setOpacitySkeleton(0.1);
      setShowSkeleton(false); setShowSkin(true);
      setShowMuscleHitZones(true);
    } else {
      setOpacitySkin(0.1); setOpacitySkeleton(0.35);
      setShowSkin(true); setShowSkeleton(true);
      setShowMuscleHitZones(true);
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

  // Muscle tree grouped by region
  const muscleTreeData = useMemo(() => {
    const groups = Object.entries(MUSCLE_GROUP_META).map(([groupId, meta]) => ({
      id: `muscle-${groupId}`,
      name: `${meta.emoji} ${meta.label}`,
      children: muscleDatabase
        .filter(m => m.muscleGroup === groupId)
        .map(m => ({ id: m.id, name: m.displayName }))
    })).filter(g => g.children.length > 0);
    return groups;
  }, []);

  const filteredMuscleTree = useMemo(() => {
    if (!muscleSearch.trim()) return muscleTreeData;
    const matchedIds = MuscleSearchIndex.queryIds(muscleSearch);
    return muscleTreeData
      .map(g => ({ ...g, children: g.children.filter(c => matchedIds.has(c.id) || c.name.toLowerCase().includes(muscleSearch.toLowerCase())) }))
      .filter(g => g.children.length > 0);
  }, [muscleTreeData, muscleSearch]);

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
        {/* System mode tabs: Skeletal vs Muscular */}
        <div className="flex gap-1.5 mb-2">
          {(['skeletal', 'muscular'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onSelectSystem(mode)}
              className={`flex-1 py-1 px-2 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                activeSystemId === mode
                  ? mode === 'muscular'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
              }`}
            >
              {mode === 'skeletal' ? '🦴 Skeleton' : '💪 Muscles'}
            </button>
          ))}
        </div>

        {activeSystemId !== 'muscular' ? (
          /* ── SKELETAL TREE ── */
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
        ) : (
          /* ── MUSCULAR TREE ── */
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-0">
            {/* Fascial layer filter buttons */}
            <div className="flex flex-wrap gap-1 mb-1">
              {(['all', 'superficial', 'intermediate', 'deep'] as const).map(layer => (
                <button
                  key={layer}
                  onClick={() => setMuscleLayerFilter(layer)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                    muscleLayerFilter === layer
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {layer === 'all' ? 'All' : layer.slice(0,6)}
                </button>
              ))}
            </div>
            {filteredMuscleTree.map(grp => (
              <div key={grp.id} className="text-xs">
                <div className="font-bold text-orange-400/80 bg-orange-900/10 px-2 py-1 rounded border-l-2 border-orange-500/40">
                  {grp.name}
                </div>
                <div className="pl-3 mt-1 flex flex-col gap-1 border-l border-slate-900 ml-2">
                  {grp.children
                    .filter(c => {
                      if (muscleLayerFilter === 'all') return true;
                      const m = muscleDatabaseMap.get(c.id);
                      return m?.fascialLayer === muscleLayerFilter;
                    })
                    .map(child => {
                      const m = muscleDatabaseMap.get(child.id);
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setSelectedMuscleId(selectedMuscleId === child.id ? null : child.id);
                            onSelectOrgan(null);
                          }}
                          className={`w-full text-left py-1 px-2 rounded hover:bg-orange-900/20 transition-all text-[9px] ${
                            selectedMuscleId === child.id
                              ? 'text-orange-300 bg-orange-500/10 font-semibold border-l-2 border-orange-400'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <span className="opacity-50 mr-0.5">├─</span> {child.name}
                          {m && <span className={`ml-1 text-[7px] opacity-50 ${
                            m.fascialLayer === 'superficial' ? 'text-orange-400' :
                            m.fascialLayer === 'intermediate' ? 'text-pink-400' :
                            m.fascialLayer === 'deep' ? 'text-purple-400' : 'text-cyan-400'
                          }`}>{m.fascialLayer.slice(0,4)}</span>}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── INSPECTOR PANEL ── */}
        <div className="border-t border-slate-900 mt-3 pt-3 flex flex-col gap-2 shrink-0">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Anatomical Inspector
          </h4>

          {/* MUSCLE INSPECTOR */}
          {selectedMuscleId && activeSystemId === 'muscular' ? (() => {
            const muscle = muscleDatabaseMap.get(selectedMuscleId);
            if (!muscle) return <div className="text-slate-500 text-xs italic">Unknown muscle.</div>;
            const isMuscleIsolated = isolatedMuscleId === selectedMuscleId;
            const isMuscleHidden = hiddenMuscles.has(selectedMuscleId);
            const synergistIds = MuscleInteraction.getSynergists(selectedMuscleId);
            const antagonistIds = MuscleInteraction.getAntagonists(selectedMuscleId);
            const layerMeta = FASCIAL_LAYER_META[muscle.fascialLayer];
            const groupMeta = MUSCLE_GROUP_META[muscle.muscleGroup];
            return (
              <div className="text-[10px] text-slate-300 flex flex-col gap-2 bg-slate-950/40 p-2.5 rounded border border-orange-900/40 max-h-[500px] overflow-y-auto select-text">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-orange-300 text-xs leading-tight">{muscle.displayName}</div>
                    <div className="text-[8px] text-slate-500 italic">{muscle.latinName}</div>
                  </div>
                  <div className="flex flex-col gap-0.5 items-end">
                    <span className="text-[7px] px-1.5 py-0.5 rounded border" style={{ color: layerMeta.color, borderColor: layerMeta.color + '40', background: layerMeta.color + '15' }}>
                      {layerMeta.label}
                    </span>
                    <span className="text-[7px] text-slate-500 bg-slate-900 border border-slate-800 px-1 rounded">
                      {groupMeta.emoji} {groupMeta.label}
                    </span>
                  </div>
                </div>

                {/* Action controls */}
                <div className="grid grid-cols-3 gap-1 border-y border-slate-900 py-1.5">
                  <button
                    onClick={() => setIsolatedMuscleId(isMuscleIsolated ? null : selectedMuscleId)}
                    className={`py-1 px-1 rounded text-[8px] font-bold uppercase transition-all ${
                      isMuscleIsolated ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >{isMuscleIsolated ? 'Exit' : 'Isolate'}</button>
                  <button
                    onClick={() => {
                      const next = new Set(hiddenMuscles);
                      if (isMuscleHidden) next.delete(selectedMuscleId); else next.add(selectedMuscleId);
                      setHiddenMuscles(next);
                    }}
                    className="py-1 px-1 rounded text-[8px] font-bold uppercase bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  >{isMuscleHidden ? 'Show' : 'Hide'}</button>
                  <button
                    onClick={() => setHighlightSynergists(!highlightSynergists)}
                    className={`py-1 px-1 rounded text-[8px] font-bold uppercase transition-all ${
                      highlightSynergists ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >Syn</button>
                </div>

                {/* Origin */}
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[8px] block">Origin:</span>
                  <span className="text-emerald-400 block leading-snug">{muscle.originDescription}</span>
                  <span className="text-[8px] text-slate-600">Bones: {muscle.originBones.map(b => b.replace('bone-','')).join(', ')}</span>
                </div>

                {/* Insertion */}
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[8px] block">Insertion:</span>
                  <span className="text-rose-400 block leading-snug">{muscle.insertionDescription}</span>
                  <span className="text-[8px] text-slate-600">Bones: {muscle.insertionBones.map(b => b.replace('bone-','')).join(', ')}</span>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-900 pt-1.5">
                  <span className="text-slate-500 font-bold uppercase text-[8px] block">Primary Action:</span>
                  <span className="text-cyan-300 block leading-snug">{muscle.primaryAction}</span>
                  {muscle.secondaryActions.length > 0 && (
                    <div className="mt-1">
                      <span className="text-slate-500 font-bold uppercase text-[8px] block">Also:</span>
                      {muscle.secondaryActions.map((a, i) => <span key={i} className="text-slate-400 block text-[9px] leading-snug">• {a}</span>)}
                    </div>
                  )}
                </div>

                {/* Nerve & Blood */}
                <div className="grid grid-cols-1 gap-1.5 border-t border-slate-900 pt-1.5">
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[8px] block">Innervation:</span>
                    <span className="text-violet-300 block leading-snug">{muscle.innervation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[8px] block">Blood Supply:</span>
                    <span className="text-red-400 block leading-snug">{muscle.bloodSupply}</span>
                  </div>
                </div>

                {/* Synergists & Antagonists */}
                {synergistIds.length > 0 && (
                  <div className="border-t border-slate-900 pt-1.5">
                    <span className="text-slate-500 font-bold uppercase text-[8px] block mb-0.5">Synergists:</span>
                    <div className="flex flex-wrap gap-1">
                      {synergistIds.map(id => {
                        const sm = muscleDatabaseMap.get(id);
                        return sm ? (
                          <button key={id} onClick={() => setSelectedMuscleId(id)}
                            className="text-[7px] px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-800/40 transition-all">
                            {sm.displayName}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                {antagonistIds.length > 0 && (
                  <div className="border-t border-slate-900 pt-1.5">
                    <span className="text-slate-500 font-bold uppercase text-[8px] block mb-0.5">Antagonists:</span>
                    <div className="flex flex-wrap gap-1">
                      {antagonistIds.map(id => {
                        const am = muscleDatabaseMap.get(id);
                        return am ? (
                          <button key={id} onClick={() => setSelectedMuscleId(id)}
                            className="text-[7px] px-1.5 py-0.5 rounded bg-rose-900/30 text-rose-400 border border-rose-800/40 hover:bg-rose-800/40 transition-all">
                            {am.displayName}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Clinical */}
                <div className="border-t border-slate-900 pt-1.5">
                  <span className="text-slate-500 font-bold uppercase text-[8px] block">Clinical Notes:</span>
                  <span className="text-slate-400 block italic leading-snug">{muscle.clinicalNotes}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[8px] block">Common Injuries:</span>
                  <span className="text-amber-400 block leading-snug">{muscle.commonInjuries}</span>
                </div>

                {/* Fiber & joints */}
                <div className="border-t border-slate-900 pt-1.5 grid grid-cols-2 gap-1 text-[8px] text-slate-500">
                  <div><span className="font-bold block">Fiber Dir.:</span><span className="text-slate-400">{muscle.fiberDirection}</span></div>
                  <div><span className="font-bold block">Joints:</span><span className="text-slate-400">{muscle.crossesJoints.join(', ') || '—'}</span></div>
                </div>
              </div>
            );
          })() : selectedOrganId ? (
            (() => {
              const boneComp = registry.getComponent<BoneComponent>(selectedOrganId, 'BoneComponent');
              if (boneComp) {
                const desc = bonesCatalog.find(b => b.id === selectedOrganId)?.description || '';
                const clinical = clinicalBoneDatabase[selectedOrganId];
                const joints = registry.query(['JointComponent']);
                const connectedJoints: JointComponent[] = [];
                for (const jId of joints) {
                  const jComp = registry.getComponent<JointComponent>(jId, 'JointComponent');
                  if (jComp && jComp.connectedBones.includes(selectedOrganId)) connectedJoints.push(jComp);
                }
                const isIsolated = isolatedBoneId === selectedOrganId;
                const isHidden = hiddenBones.has(selectedOrganId);
                return (
                  <div className="text-[10px] text-slate-300 flex flex-col gap-2.5 bg-slate-950/40 p-2.5 rounded border border-slate-900 max-h-[460px] overflow-y-auto select-text">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-cyan-400 text-xs leading-tight">{boneComp.displayName}</div>
                        <div className="text-[8px] text-slate-500 uppercase font-semibold tracking-wider">{boneComp.latinName}</div>
                      </div>
                      <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded">
                        {clinical?.boneType || 'flat'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 border-y border-slate-900 py-1.5">
                      <button onClick={() => { setIsolatedBoneId(isIsolated ? null : selectedOrganId); setShowAdjacentOnly(true); }}
                        className={`py-1 px-1.5 rounded text-[8px] font-bold uppercase transition-all ${isIsolated ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850'}`}>
                        {isIsolated ? 'Exit Isolate' : 'Isolate'}
                      </button>
                      <button onClick={() => { const next = new Set(hiddenBones); if (isHidden) next.delete(selectedOrganId); else next.add(selectedOrganId); setHiddenBones(next); }}
                        className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 text-[8px] font-bold uppercase">
                        {isHidden ? 'Show' : 'Hide'}
                      </button>
                      <button onClick={() => setShowAdjacentOnly(!showAdjacentOnly)}
                        className={`py-1 px-1.5 rounded text-[8px] font-bold uppercase transition-all ${showAdjacentOnly ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850'}`}
                        disabled={!isIsolated}>
                        + Adjacent
                      </button>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{desc}</p>
                    {clinical && (
                      <div className="flex flex-col gap-2 border-t border-slate-900 pt-2">
                        <div><span className="text-slate-500 font-semibold uppercase text-[8px] block">Arterial Supply:</span><span className="text-slate-400 block">{clinical.bloodSupply}</span></div>
                        <div><span className="text-slate-500 font-semibold uppercase text-[8px] block">Innervation:</span><span className="text-slate-400 block">{clinical.nerveSupply}</span></div>
                        {clinical.muscleOrigins.length > 0 && <div><span className="text-slate-500 font-semibold uppercase text-[8px] block">Muscle Origins:</span><span className="text-slate-400 block">{clinical.muscleOrigins.join(', ')}</span></div>}
                        <div><span className="text-slate-500 font-semibold uppercase text-[8px] block">Clinical Notes:</span><span className="text-slate-400 block italic">{clinical.clinicalNotes}</span></div>
                        <div><span className="text-slate-500 font-semibold uppercase text-[8px] block">Fractures:</span><span className="text-slate-400 block">{clinical.commonFractures}</span></div>
                        <div><span className="text-slate-500 font-semibold uppercase text-[8px] block">Did You Know?</span><span className="text-slate-400 block">{clinical.interestingFacts}</span></div>
                      </div>
                    )}
                    {connectedJoints.length > 0 && (
                      <div className="mt-1.5 border-t border-slate-900 pt-1.5">
                        <span className="text-slate-500 font-semibold uppercase text-[8px] block mb-1">Joint Articulations:</span>
                        <div className="flex flex-col gap-1.5">
                          {connectedJoints.map((j, i) => (
                            <div key={i} className="bg-slate-950/40 p-1.5 rounded border border-slate-900">
                              <div className="font-bold text-slate-300">{j.displayName}</div>
                              <div className="text-[8px] text-slate-500 uppercase mt-0.5">Type: {j.jointType} | DoF: {j.degreesOfFreedom}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return <div className="text-slate-500 text-xs italic">Unknown element.</div>;
            })()
          ) : (
            <div className="text-slate-500 text-[10px] italic bg-slate-950/20 p-2.5 rounded border border-slate-900/40 text-center">
              {activeSystemId === 'muscular'
                ? 'Click any muscle to inspect attachments, innervation and clinical data.'
                : 'Select any bone to inspect its coordinate structures.'}
            </div>
          )}
        </div>

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
          {/* LEFT OVERLAY: LAYER CONTROLS */}
          <div className="absolute top-4 left-4 p-3 bg-slate-900/90 border border-slate-800/60 rounded-xl backdrop-blur-md z-10 flex flex-col gap-2 text-[9px] text-slate-400 w-44 shadow-2xl">
            <div className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 mb-1">
              {activeSystemId === 'muscular' ? '💪 MUSCLE LAYERS' : '🦴 BONE LAYERS'}
            </div>
            {activeSystemId === 'muscular' ? (
              /* MUSCLE LAYER CONTROLS */
              <>
                {([
                  { label: '📸 Reference Image', val: refImageOpacity, set: setRefImageOpacity, show: showRefImage, toggle: setShowRefImage },
                  { label: '💪 Muscle Hit Zones', val: showMuscleHitZones ? 1 : 0, set: (v: number) => setShowMuscleHitZones(v > 0), show: showMuscleHitZones, toggle: setShowMuscleHitZones },
                  { label: '🦴 Bone Overlay', val: showHitZones ? 0.4 : 0, set: (v: number) => setShowHitZones(v > 0), show: showHitZones, toggle: setShowHitZones },
                ] as { label: string; val: number; set: (v: number) => void; show: boolean; toggle: (v: boolean) => void }[]).map(layer => (
                  <div key={layer.label} className="flex flex-col gap-0.5">
                    <div className="flex justify-between font-semibold items-center">
                      <span>{layer.label}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { layer.toggle(!layer.show); layer.set(layer.show ? 0.0 : 1.0); }} className="text-slate-500 hover:text-slate-300">
                          {layer.show ? <Eye className="w-3 h-3 text-orange-400" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <span className="text-slate-600 w-6 text-right">{Math.round(layer.val * 100)}%</span>
                      </div>
                    </div>
                    <input type="range" min="0" max="1" step="0.05" value={layer.val}
                      onChange={e => { const v = parseFloat(e.target.value); layer.set(v); layer.toggle(v > 0); }}
                      className="accent-orange-500 h-1 bg-slate-950 rounded cursor-pointer" />
                  </div>
                ))}
                {/* Fascial depth filter */}
                <div className="border-t border-slate-900 pt-2 mt-1">
                  <div className="text-[8px] font-bold uppercase text-slate-500 mb-1">Fascial Depth</div>
                  {(['all', 'superficial', 'intermediate', 'deep'] as const).map(layer => (
                    <button key={layer}
                      onClick={() => setMuscleLayerFilter(layer)}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[8px] mb-0.5 transition-all ${
                        muscleLayerFilter === layer ? 'bg-orange-500/20 text-orange-300' : 'text-slate-500 hover:text-slate-300'
                      }`}>
                      {layer === 'all' ? '● All Layers' : layer === 'superficial' ? '◎ Superficial' : layer === 'intermediate' ? '◉ Intermediate' : '⬤ Deep'}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* BONE LAYER CONTROLS */
              ([
                { label: '📸 Reference Image', val: refImageOpacity, set: setRefImageOpacity, show: showRefImage, toggle: setShowRefImage },
                { label: '🫥 Skin Envelope', val: opacitySkin, set: setOpacitySkin, show: showSkin, toggle: setShowSkin },
                { label: '🦴 Skeleton Frame', val: opacitySkeleton, set: setOpacitySkeleton, show: showSkeleton, toggle: setShowSkeleton },
                { label: '🎯 Hit Zones', val: showHitZones ? 1 : 0, set: (v: number) => setShowHitZones(v > 0), show: showHitZones, toggle: setShowHitZones }
              ] as { label: string; val: number; set: (v: number) => void; show: boolean; toggle: (v: boolean) => void }[]).map(layer => (
                <div key={layer.label} className="flex flex-col gap-0.5">
                  <div className="flex justify-between font-semibold items-center">
                    <span>{layer.label}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { layer.toggle(!layer.show); layer.set(layer.show ? 0.0 : 1.0); }} className="text-slate-500 hover:text-slate-300">
                        {layer.show ? <Eye className="w-3 h-3 text-medical-400" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <span className="text-slate-600 w-6 text-right">{Math.round(layer.val * 100)}%</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={layer.val}
                    onChange={e => { const v = parseFloat(e.target.value); layer.set(v); layer.toggle(v > 0); }}
                    className="accent-medical-500 h-1 bg-slate-950 rounded cursor-pointer" />
                </div>
              ))
            )}
          </div>

          {/* TOP RIGHT: MINIMAP */}
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

          {/* ═══════════════════════════════════════════════════════════════════
               HYBRID RENDER: PNG BASE + SVG HIT-ZONE OVERLAY
               PNG uses invert+screen blend to eliminate white bg on dark theme.
               SVG polygons layered on top provide full interactivity.
          ════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              position: 'relative',
              flexShrink: 0,
              height: '100%',
              aspectRatio: '340 / 560',
              maxHeight: '90%',
            }}
          >
            {/* LAYER 1: INNERBODY REFERENCE PNGs (Skeletal or Muscular) */}
            {showRefImage && (
              <>
                {/* Skeletal PNG — always show in skeletal mode or full-body */}
                {activeSystemId !== 'muscular' && (
                  <img
                    src={skeletalPng}
                    alt="Human Skeletal System - Anterior View"
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'contain',
                      opacity: refImageOpacity,
                      filter: `invert(1) brightness(${activeSystemId === 'skeletal' ? 1.15 : 0.7}) contrast(1.1) saturate(1.3)`,
                      mixBlendMode: 'screen',
                      transition: 'opacity 0.4s ease, filter 0.4s ease',
                      userSelect: 'none', pointerEvents: 'none'
                    }}
                    draggable={false}
                  />
                )}
                {/* Muscular PNG — show in muscular mode or full-body */}
                {activeSystemId !== 'skeletal' && (
                  <img
                    src={muscularPng}
                    alt="Human Muscular System - Anterior View"
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'contain',
                      opacity: activeSystemId === 'muscular' ? refImageOpacity : refImageOpacity * 0.65,
                      filter: `invert(1) brightness(${activeSystemId === 'muscular' ? 1.2 : 0.85}) contrast(1.15) saturate(1.4) hue-rotate(${activeSystemId === 'muscular' ? 15 : 0}deg)`,
                      mixBlendMode: 'screen',
                      transition: 'opacity 0.4s ease, filter 0.4s ease',
                      userSelect: 'none', pointerEvents: 'none'
                    }}
                    draggable={false}
                  />
                )}
              </>
            )}

            {/* LAYER 2: SVG INTERACTIVE HIT-ZONES */}
            {/* viewBox matches PNG aspect ratio — 340×560 virtual units */}
            <svg
              viewBox="0 0 340 560"
              width="100%"
              height="100%"
              style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            >
              <defs>
                <filter id="hz-glow-selected" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="hz-glow-hover" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {showHitZones && (() => {
                // Each hit zone: { id, label, shape, ...coords }
                // Coordinates calibrated to 340x560 PNG (anterior female view)
                const hitZones: Array<{
                  id: string;
                  label: string;
                  type: 'ellipse' | 'rect' | 'polygon';
                  cx?: number; cy?: number; rx?: number; ry?: number;
                  x?: number; y?: number; w?: number; h?: number;
                  points?: string;
                }> = [
                  // ── SKULL / CRANIUM (maps to frontal bone – largest cranial target) ──
                  { id: 'bone-frontal',   label: 'Skull — Frontal Bone',           type: 'ellipse', cx: 170, cy: 38,  rx: 30, ry: 26 },
                  { id: 'bone-parietal',  label: 'Skull — Parietal Bones',         type: 'ellipse', cx: 170, cy: 22,  rx: 28, ry: 14 },
                  { id: 'bone-temporal',  label: 'Skull — Temporal Bones',         type: 'ellipse', cx: 148, cy: 52,  rx: 14, ry: 20 },
                  { id: 'bone-occipital', label: 'Skull — Occipital Bone',         type: 'ellipse', cx: 192, cy: 52,  rx: 14, ry: 20 },
                  { id: 'bone-mandible',  label: 'Mandible (Jawbone)',             type: 'ellipse', cx: 170, cy: 82,  rx: 22, ry: 13 },
                  { id: 'bone-maxilla',   label: 'Maxilla (Upper Jaw)',            type: 'ellipse', cx: 170, cy: 72,  rx: 14,  ry: 8  },
                  { id: 'bone-zygomatic', label: 'Zygomatic (Cheekbone)',          type: 'ellipse', cx: 148, cy: 66,  rx: 10,  ry: 8  },
                  // ── CERVICAL SPINE ──
                  { id: 'bone-cervical',  label: 'Cervical Spine (C1–C7)',         type: 'ellipse', cx: 170, cy: 104, rx: 9,  ry: 16 },
                  // ── SHOULDER GIRDLE ──
                  { id: 'bone-clavicle',  label: 'Clavicles (Collarbones)',        type: 'polygon', points: '120,126 155,116 185,116 220,126 218,133 185,122 155,122' },
                  { id: 'bone-scapula',   label: 'Scapulae (Shoulder Blades)',     type: 'ellipse', cx: 112, cy: 162, rx: 22, ry: 28 },
                  // ── THORAX ──
                  { id: 'bone-sternum-manubrium', label: 'Manubrium (Top Sternum)', type: 'rect', x: 160, y: 126, w: 20, h: 22 },
                  { id: 'bone-sternum-body',      label: 'Sternum Body',            type: 'rect', x: 160, y: 148, w: 18, h: 48 },
                  { id: 'bone-sternum-xiphoid',   label: 'Xiphoid Process',         type: 'ellipse', cx: 170, cy: 204, rx: 7, ry: 8 },
                  { id: 'bone-ribs-true',    label: 'True Ribs (1–7)',             type: 'polygon', points: '132,128 168,124 172,124 210,128 218,172 212,200 175,208 165,208 128,200 122,172' },
                  { id: 'bone-ribs-false',   label: 'False Ribs (8–10)',           type: 'polygon', points: '128,200 165,208 175,208 212,200 214,220 170,228 126,220' },
                  { id: 'bone-ribs-floating', label: 'Floating Ribs (11–12)',      type: 'polygon', points: '135,220 170,228 205,220 200,238 170,244 140,238' },
                  // ── THORACIC SPINE ──
                  { id: 'bone-thoracic',  label: 'Thoracic Spine (T1–T12)',        type: 'ellipse', cx: 170, cy: 175, rx: 8,  ry: 40 },
                  // ── LUMBAR SPINE ──
                  { id: 'bone-lumbar',    label: 'Lumbar Spine (L1–L5)',           type: 'ellipse', cx: 170, cy: 240, rx: 8,  ry: 26 },
                  // ── PELVIS ──
                  { id: 'bone-ilium',     label: 'Ilium (Hip Bone)',               type: 'ellipse', cx: 150, cy: 288, rx: 28, ry: 22 },
                  { id: 'bone-sacrum',    label: 'Sacrum',                          type: 'ellipse', cx: 170, cy: 292, rx: 14, ry: 20 },
                  { id: 'bone-pubis',     label: 'Pubic Symphysis',                type: 'ellipse', cx: 170, cy: 314, rx: 16, ry: 9  },
                  { id: 'bone-ischium',   label: 'Ischium (Sitting Bone)',         type: 'ellipse', cx: 150, cy: 310, rx: 12, ry: 10 },
                  { id: 'bone-coccyx',    label: 'Coccyx (Tailbone)',              type: 'ellipse', cx: 170, cy: 314, rx: 6,  ry: 7  },
                  // ── UPPER LIMBS (ECS uses single entity per bone, bilateral) ──
                  { id: 'bone-humerus',   label: 'Humerus (Upper Arm)',            type: 'ellipse', cx: 102, cy: 215, rx: 12, ry: 48 },
                  { id: 'bone-radius',    label: 'Radius (Forearm)',               type: 'ellipse', cx: 94,  cy: 295, rx: 7,  ry: 38 },
                  { id: 'bone-ulna',      label: 'Ulna (Forearm)',                 type: 'ellipse', cx: 85,  cy: 295, rx: 6,  ry: 38 },
                  { id: 'bone-carpals',   label: 'Wrist (Carpals)',                type: 'ellipse', cx: 87,  cy: 347, rx: 11, ry: 9  },
                  { id: 'bone-metacarpals', label: 'Hand (Metacarpals)',           type: 'ellipse', cx: 82,  cy: 368, rx: 13, ry: 13 },
                  { id: 'bone-phalanges-hand', label: 'Finger Bones (Phalanges)', type: 'ellipse', cx: 77,  cy: 394, rx: 17, ry: 15 },
                  // ── LOWER LIMBS ──
                  { id: 'bone-femur',     label: 'Femur (Thigh Bone)',             type: 'ellipse', cx: 148, cy: 385, rx: 17, ry: 54 },
                  { id: 'bone-patella',   label: 'Patella (Kneecap)',              type: 'ellipse', cx: 148, cy: 445, rx: 10, ry: 10 },
                  { id: 'bone-tibia',     label: 'Tibia (Shin Bone)',              type: 'ellipse', cx: 146, cy: 490, rx: 10, ry: 39 },
                  { id: 'bone-fibula',    label: 'Fibula',                         type: 'ellipse', cx: 135, cy: 490, rx: 5,  ry: 37 },
                  { id: 'bone-tarsals',   label: 'Ankle (Tarsals)',                type: 'ellipse', cx: 144, cy: 533, rx: 12, ry: 9  },
                  { id: 'bone-metatarsals', label: 'Foot (Metatarsals)',           type: 'ellipse', cx: 148, cy: 547, rx: 15, ry: 9  },
                  { id: 'bone-phalanges-foot', label: 'Toe Bones (Phalanges)',    type: 'ellipse', cx: 148, cy: 558, rx: 14, ry: 6  },
                ];

                return hitZones.map(zone => {
                  const isSelected = selectedOrganId === zone.id;
                  const isHidden = hiddenBones.has(zone.id);
                  const isAdjacent = isolatedBoneId && showAdjacentOnly
                    ? SkeletalInteraction.getAdjacentBones(registry, isolatedBoneId).includes(zone.id)
                    : false;
                  const isIsolated = isolatedBoneId === zone.id;
                  const dimmed = isolatedBoneId && !isIsolated && !isAdjacent;

                  if (isHidden) return null;

                  const baseOpacity = dimmed ? 0.08 : isAdjacent ? 0.35 : 0.0;
                  const hoverOpacity = 0.28;
                  const selectedOpacity = 0.45;
                  const strokeOpacity = isSelected ? 1 : dimmed ? 0.1 : 0.0;
                  const fillColor = isSelected ? '#38bdf8' : isAdjacent ? '#818cf8' : '#38bdf8';
                  const strokeColor = isSelected ? '#38bdf8' : '#94a3b8';

                  const commonProps = {
                    fill: fillColor,
                    fillOpacity: isSelected ? selectedOpacity : baseOpacity,
                    stroke: strokeColor,
                    strokeWidth: isSelected ? 2 : 1,
                    strokeOpacity,
                    filter: isSelected ? 'url(#hz-glow-selected)' : undefined,
                    style: { cursor: 'pointer', transition: 'fill-opacity 0.15s, stroke-opacity 0.15s' },
                    onClick: (e: React.MouseEvent) => { e.stopPropagation(); onSelectOrgan(zone.id); },
                    onMouseEnter: (e: React.MouseEvent) => {
                      const rect = (e.currentTarget as SVGElement).closest('div')?.getBoundingClientRect();
                      const svgEl = (e.currentTarget as SVGElement).closest('svg');
                      const svgRect = svgEl?.getBoundingClientRect();
                      if (svgRect) {
                        setHoveredOrgan({
                          id: zone.id,
                          name: zone.label,
                          x: e.clientX - (rect?.left ?? 0) + 12,
                          y: e.clientY - (rect?.top ?? 0) - 10
                        });
                      }
                    },
                    onMouseMove: (e: React.MouseEvent) => {
                      const rect = (e.currentTarget as SVGElement).closest('div')?.getBoundingClientRect();
                      if (rect) {
                        setHoveredOrgan(prev => prev ? {
                          ...prev,
                          x: e.clientX - rect.left + 12,
                          y: e.clientY - rect.top - 10
                        } : null);
                      }
                    },
                    onMouseLeave: () => setHoveredOrgan(null),
                  };

                  if (zone.type === 'ellipse') {
                    return <ellipse key={zone.id} cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} {...commonProps} />;
                  } else if (zone.type === 'rect') {
                    return <rect key={zone.id} x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={3} {...commonProps} />;
                  } else {
                    return <polygon key={zone.id} points={zone.points} {...commonProps} />;
                  }
                });
              })()}

              {/* ANATOMICAL LANDMARK DOTS */}
              <g opacity="0.55" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="2,2">
                <circle cx="170" cy="222" r="3" fill="#22d3ee" fillOpacity="0.5"
                  onMouseEnter={() => setHoveredLandmark('Costal Margin')}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  style={{ cursor: 'pointer' }}
                />
                <circle cx="170" cy="262" r="3" fill="#22d3ee" fillOpacity="0.5"
                  onMouseEnter={() => setHoveredLandmark('Umbilicus')}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  style={{ cursor: 'pointer' }}
                />
                <circle cx="148" cy="281" r="2.5" fill="#22d3ee" fillOpacity="0.4"
                  onMouseEnter={() => setHoveredLandmark('Anterior Superior Iliac Spine (ASIS)')}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  style={{ cursor: 'pointer' }}
                />
                <circle cx="192" cy="281" r="2.5" fill="#22d3ee" fillOpacity="0.4"
                  onMouseEnter={() => setHoveredLandmark('Anterior Superior Iliac Spine (ASIS)')}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  style={{ cursor: 'pointer' }}
                />
                <circle cx="170" cy="86"  r="2" fill="#22d3ee" fillOpacity="0.4"
                  onMouseEnter={() => setHoveredLandmark('Glabella (Forehead midpoint)')}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>

              {/* LAYER 2.5: MUSCLE HIT-ZONES */}
              {showMuscleHitZones && (
                <g id="muscle-hit-zones">
                  {MUSCLE_HIT_ZONES.map((zone, i) => {
                    if (muscleLayerFilter !== 'all' && zone.layer !== muscleLayerFilter) return null;
                    const m = muscleDatabaseMap.get(zone.id);
                    const isSelected = selectedMuscleId === zone.id;
                    const isHidden = hiddenMuscles.has(zone.id);
                    if (isHidden) return null;

                    const isSynergist = highlightSynergists && selectedMuscleId
                      ? MuscleInteraction.getSynergists(selectedMuscleId).includes(zone.id)
                      : false;
                    const isAntagonist = highlightAntagonists && selectedMuscleId
                      ? MuscleInteraction.getAntagonists(selectedMuscleId).includes(zone.id)
                      : false;
                    const isIsolated = isolatedMuscleId === zone.id;
                    const dimmed = isolatedMuscleId && !isIsolated;

                    const fillColor = isSelected
                      ? zone.color
                      : isSynergist ? '#34d399'
                      : isAntagonist ? '#f87171'
                      : zone.color;
                    const fillOpacity = dimmed ? 0.04 : isSelected ? 0.45 : isSynergist || isAntagonist ? 0.35 : 0.0;
                    const strokeOpacity = isSelected ? 1 : isSynergist || isAntagonist ? 0.8 : 0.0;

                    const uniqueKey = `muscle-hz-${zone.id}-${i}`;
                    const commonProps = {
                      fill: fillColor,
                      fillOpacity,
                      stroke: fillColor,
                      strokeWidth: isSelected ? 2 : 1.2,
                      strokeOpacity,
                      filter: isSelected ? 'url(#hz-glow-selected)' : undefined,
                      style: {
                        cursor: 'pointer',
                        transition: 'fill-opacity 0.15s, stroke-opacity 0.15s',
                        display: activeSystemId !== 'muscular' && !isSynergist && !isAntagonist && !isSelected ? 'none' : undefined
                      },
                      className: 'muscle-hit-zone',
                      onClick: (e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedMuscleId(zone.id);
                        onSelectOrgan(null);
                      },
                      onMouseEnter: (e: React.MouseEvent) => {
                        const rect = (e.currentTarget as SVGElement).closest('div')?.getBoundingClientRect();
                        if (rect) {
                          setHoveredOrgan({
                            id: zone.id,
                            name: zone.label,
                            x: e.clientX - rect.left + 12,
                            y: e.clientY - rect.top - 10
                          });
                        }
                      },
                      onMouseMove: (e: React.MouseEvent) => {
                        const rect = (e.currentTarget as SVGElement).closest('div')?.getBoundingClientRect();
                        if (rect) setHoveredOrgan(prev => prev ? { ...prev, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 10 } : null);
                      },
                      onMouseLeave: () => setHoveredOrgan(null),
                    };

                    if (zone.type === 'ellipse') {
                      return <ellipse key={uniqueKey} cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} {...commonProps} />;
                    } else if (zone.type === 'rect') {
                      return <rect key={uniqueKey} x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={3} {...commonProps} />;
                    } else {
                      return <polygon key={uniqueKey} points={zone.points} {...commonProps} />;
                    }
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* FLOATING HOVER CARD TOOLTIP */}
          {hoveredOrgan && (
            (() => {
              // Check if this is a muscle
              const hovMuscle = muscleDatabaseMap.get(hoveredOrgan.id);
              if (hovMuscle && activeSystemId === 'muscular') {
                const layerMeta = FASCIAL_LAYER_META[hovMuscle.fascialLayer];
                return (
                  <div
                    style={{ left: hoveredOrgan.x, top: hoveredOrgan.y, pointerEvents: 'none' }}
                    className="absolute z-30 w-52 bg-slate-950/95 border border-orange-900/60 rounded-xl p-3 shadow-2xl text-[10px] text-slate-300 font-sans backdrop-blur-md"
                  >
                    <div className="font-bold text-orange-300 border-b border-slate-900 pb-1 mb-1.5 flex justify-between items-start">
                      <span>{hoveredOrgan.name}</span>
                      <span className="text-[7px] px-1 py-0.5 rounded" style={{ color: layerMeta.color, background: layerMeta.color + '20' }}>{hovMuscle.fascialLayer}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 italic mb-1">{hovMuscle.latinName}</div>
                    <div className="flex flex-col gap-1 text-[9px]">
                      <div><span className="text-slate-500">Action: </span><span className="text-cyan-300">{hovMuscle.primaryAction}</span></div>
                      <div><span className="text-slate-500">Nerve: </span><span className="text-violet-300">{hovMuscle.innervation.split('(')[0].trim()}</span></div>
                    </div>
                  </div>
                );
              }

              // Existing bone hover
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
