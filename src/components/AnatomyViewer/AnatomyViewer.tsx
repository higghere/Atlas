import React, { useState, useRef, useEffect } from 'react';
import { OrganNode } from '../../types/physiology';
import { Eye, EyeOff, Search, Network } from 'lucide-react';

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
  const [view, setView] = useState<'front' | 'back'>('front');
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);

  // Emojis for system filter tabs
  const systemTabs = [
    { id: 'all', icon: '🧍', name: 'Full Body' },
    { id: 'skeletal', icon: '🦴', name: 'Skeleton' },
    { id: 'cardiovascular', icon: '🫀', name: 'Vessels' },
    { id: 'respiratory', icon: '🫁', name: 'Respiratory' },
    { id: 'digestive', icon: '🍏', name: 'Digestive' },
    { id: 'renal', icon: '🩸', name: 'Urinary' },
    { id: 'nervous', icon: '🧠', name: 'Nerves' }
  ];

  // Auto preset layer states on select tabs
  useEffect(() => {
    if (activeSystemId === 'skeletal') {
      setOpacitySkin(0.05); setOpacitySkeleton(0.95); setOpacityMuscle(0.0); setOpacityCardio(0.0); setOpacityRespiratory(0.0); setOpacityDigestive(0.0); setOpacityUrinary(0.0); setOpacityNerves(0.0);
      setShowSkeleton(true); setShowSkin(true); setShowMuscle(false); setShowCardio(false); setShowRespiratory(false);
    } else if (activeSystemId === 'cardiovascular') {
      setOpacitySkin(0.05); setOpacitySkeleton(0.1); setOpacityMuscle(0.0); setOpacityCardio(0.95); setOpacityRespiratory(0.15); setOpacityDigestive(0.0); setOpacityUrinary(0.0); setOpacityNerves(0.0);
      setShowCardio(true); setShowSkeleton(true);
    } else if (activeSystemId === 'respiratory') {
      setOpacitySkin(0.05); setOpacitySkeleton(0.15); setOpacityMuscle(0.0); setOpacityCardio(0.2); setOpacityRespiratory(0.95); setOpacityDigestive(0.0); setOpacityUrinary(0.0); setOpacityNerves(0.0);
      setShowRespiratory(true); setShowSkeleton(true);
    } else if (activeSystemId === 'digestive') {
      setOpacitySkin(0.05); setOpacitySkeleton(0.1); setOpacityMuscle(0.0); setOpacityCardio(0.1); setOpacityRespiratory(0.0); setOpacityDigestive(0.95); setOpacityUrinary(0.0); setOpacityNerves(0.0);
      setShowDigestive(true);
    } else if (activeSystemId === 'renal') {
      setOpacitySkin(0.05); setOpacitySkeleton(0.1); setOpacityMuscle(0.0); setOpacityCardio(0.2); setOpacityRespiratory(0.0); setOpacityDigestive(0.0); setOpacityUrinary(0.95); setOpacityNerves(0.0);
      setShowUrinary(true);
    } else if (activeSystemId === 'nervous') {
      setOpacitySkin(0.05); setOpacitySkeleton(0.1); setOpacityMuscle(0.0); setOpacityCardio(0.0); setOpacityRespiratory(0.0); setOpacityDigestive(0.0); setOpacityUrinary(0.0); setOpacityNerves(0.95);
      setShowNerves(true);
    } else {
      setOpacitySkin(0.1); setOpacitySkeleton(0.35); setOpacityMuscle(0.0); setOpacityCardio(0.4); setOpacityRespiratory(0.6); setOpacityDigestive(0.5); setOpacityUrinary(0.6); setOpacityNerves(0.3);
      setShowSkin(true); setShowSkeleton(true); setShowCardio(true); setShowRespiratory(true); setShowDigestive(true); setShowUrinary(true);
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'path' || (e.target as HTMLElement).tagName === 'circle') return;
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

  // Directories structure
  const organTreeData = [
    {
      id: 'skeletal-group',
      name: '🦴 Skeletal system',
      children: [
        { id: 'skull', name: 'Skull & Mandible' },
        { id: 'vertebrae', name: 'Spine Vertebrae' },
        { id: 'ribcage', name: 'Sternum & 12 Ribs' }
      ]
    },
    {
      id: 'cardiovascular-group',
      name: '𫏀 Cardiovascular',
      children: [
        { id: 'heart', name: 'Heart & Coronary Vessels' }
      ]
    },
    {
      id: 'respiratory-group',
      name: '𫏁 Respiratory',
      children: [
        { id: 'lungs', name: 'Lungs & Trachea' }
      ]
    },
    {
      id: 'digestive-group',
      name: '🍏 Digestive & Glandular',
      children: [
        { id: 'liver', name: 'Liver & Gallbladder' },
        { id: 'pancreas', name: 'Pancreas Gland' }
      ]
    },
    {
      id: 'renal-group',
      name: '🩸 Urinary / Kidney',
      children: [
        { id: 'kidney', name: 'Left/Right Kidneys' }
      ]
    },
    {
      id: 'nervous-group',
      name: '🧠 Nervous Central/PNS',
      children: [
        { id: 'brain', name: 'Cerebral Hemispheres' }
      ]
    }
  ];

  const filteredTree = organTreeData.map(system => {
    const matchingChildren = system.children.filter(child =>
      child.name.toLowerCase().includes(treeSearch.toLowerCase())
    );
    return { ...system, children: matchingChildren };
  }).filter(system => system.children.length > 0 || system.name.toLowerCase().includes(treeSearch.toLowerCase()));

  const handleOrganHover = (e: React.MouseEvent, id: string) => {
    const bounds = viewportRef.current?.getBoundingClientRect();
    if (bounds) {
      setHoveredOrgan({
        id,
        name: organs[id]?.name || id,
        x: e.clientX - bounds.left + 15,
        y: e.clientY - bounds.top + 15
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      {/* 1. LEFT COLUMN: DIRECTORY TREE SEARCH */}
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
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
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
          <button
            onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
            className="px-2.5 py-1.5 bg-slate-900/60 border border-slate-800 text-[10px] uppercase font-bold tracking-wider rounded text-slate-300 hover:text-white"
          >
            Rotate ({view})
          </button>
        </div>

        {/* Viewport canvas */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 bg-slate-950/30 relative flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {/* LEFT OVERLAY: 11 OPACITY CONTROLLER SLIDERS */}
          <div className="absolute top-4 left-4 p-3 bg-slate-900/85 border border-slate-800/60 rounded-xl backdrop-blur-md z-10 flex flex-col gap-2 text-[9px] text-slate-400 w-44 shadow-2xl">
            <div className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 mb-1">
              ANATOMICAL LAYERS
            </div>
            {[
              { label: '1. Skin Envelope', val: opacitySkin, set: setOpacitySkin, show: showSkin, toggle: setShowSkin },
              { label: '2. Subcutan Fat', val: opacityFat, set: setOpacityFat, show: showFat, toggle: setShowFat },
              { label: '3. Muscular System', val: opacityMuscle, set: setOpacityMuscle, show: showMuscle, toggle: setShowMuscle },
              { label: '4. Skeleton Frame', val: opacitySkeleton, set: setOpacitySkeleton, show: showSkeleton, toggle: setShowSkeleton },
              { label: '5. Cardiovascular', val: opacityCardio, set: setOpacityCardio, show: showCardio, toggle: setShowCardio },
              { label: '6. Respiratory', val: opacityRespiratory, set: setOpacityRespiratory, show: showRespiratory, toggle: setShowRespiratory },
              { label: '7. Digestive / Gut', val: opacityDigestive, set: setOpacityDigestive, show: showDigestive, toggle: setShowDigestive },
              { label: '8. Urinary / Renal', val: opacityUrinary, set: setOpacityUrinary, show: showUrinary, toggle: setShowUrinary },
              { label: '9. Endocrine', val: opacityEndocrine, set: setOpacityEndocrine, show: showEndocrine, toggle: setShowEndocrine },
              { label: '10. Lymph Nodes', val: opacityLymphatic, set: setOpacityLymphatic, show: showLymphatic, toggle: setShowLymphatic },
              { label: '11. Nervous PNS', val: opacityNerves, set: setOpacityNerves, show: showNerves, toggle: setShowNerves }
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

            {/* STACKED RENDERING SYSTEM - FROM DEEPEST (FIRST) TO SUPERFICIAL (LAST) - (Point 2, 5) */}

            {/* A. ENDOCRINE LAYER (Thyroid, Pancreas & Adrenals - Point 12) */}
            {showEndocrine && (
              <g id="layer-endocrine" opacity={opacityEndocrine} className="transition-all duration-300">
                {/* Thyroid butterfly gland wrapping trachea */}
                <path id="thyroid" d="M -8 -163 C -10 -168, 10 -168, 8 -163 C 12 -155, -12 -155, -8 -163 Z" fill="#b91c1c" stroke="#991b1b" strokeWidth="1" />

                {/* Adrenal pyramidal caps resting on kidneys */}
                <path id="adrenal-left" d="M 17 -48 Q 21 -52, 23 -47 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
                <path id="adrenal-right" d="M -17 -42 Q -21 -46, -23 -41 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />

                {/* Pancreas long curved gland (Point 12) */}
                <g
                  id="organ-pancreas"
                  onClick={(e) => { e.stopPropagation(); onSelectOrgan('pancreas'); }}
                  onMouseEnter={(e) => handleOrganHover(e, 'pancreas')}
                  onMouseMove={(e) => handleOrganHover(e, 'pancreas')}
                  onMouseLeave={() => setHoveredOrgan(null)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Select Pancreas"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSelectOrgan('pancreas'); } }}
                >
                  <path
                    d="M -15 -8 C 15 -14, 18 -2, -10 -4 Z"
                    {...getOrganStateStyle('pancreas', 'url(#grad-pancreas)')}
                  />
                </g>
              </g>
            )}

            {/* B. URINARY LAYER (Retroperitoneal kidneys & Ureters - Point 10) */}
            {showUrinary && (
              <g id="layer-urinary" opacity={opacityUrinary} className="transition-all duration-300">
                {/* Ureters drainage paths */}
                <path id="ureters" d="M -18 -30 L -7 40 M 18 -35 L 7 40" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.5" />

                {/* Bladder inside pelvic bone arches (Point 3) */}
                <path
                  id="organ-bladder"
                  d="M -10 38 C -16 38, -16 52, 0 58 C 16 52, 16 38, 10 38 Z"
                  fill="#eab308"
                  stroke="#ca8a04"
                  strokeWidth="1.2"
                  filter="url(#organ-shadow)"
                  opacity={isHighlighted('bladder') ? 0.95 : 0.2}
                />

                {/* Kidneys (Retroperitoneal, left slightly higher - Point 2, 11) */}
                <g id="organ-kidney" className="cursor-pointer">
                  {/* Left Kidney with Hilum detail */}
                  <path
                    role="button"
                    tabIndex={0}
                    aria-label="Select Left Kidney"
                    onMouseEnter={(e) => handleOrganHover(e, 'kidney')}
                    onMouseMove={(e) => handleOrganHover(e, 'kidney')}
                    onMouseLeave={() => setHoveredOrgan(null)}
                    onClick={(e) => { e.stopPropagation(); onSelectOrgan('kidney'); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSelectOrgan('kidney'); } }}
                    d="M 16 -46 C 20 -50, 26 -40, 24 -28 C 22 -22, 18 -26, 16 -30 T 16 -46 Z"
                    {...getOrganStateStyle('kidney', 'url(#grad-kidneys)')}
                  />
                  {/* Right Kidney with Hilum */}
                  <path
                    role="button"
                    tabIndex={0}
                    aria-label="Select Right Kidney"
                    onMouseEnter={(e) => handleOrganHover(e, 'kidney')}
                    onMouseMove={(e) => handleOrganHover(e, 'kidney')}
                    onMouseLeave={() => setHoveredOrgan(null)}
                    onClick={(e) => { e.stopPropagation(); onSelectOrgan('kidney'); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSelectOrgan('kidney'); } }}
                    d="M -16 -40 C -20 -44, -28 -34, -26 -22 C -24 -16, -20 -20, -16 -24 T -16 -40 Z"
                    {...getOrganStateStyle('kidney', 'url(#grad-kidneys)')}
                  />
                </g>
              </g>
            )}

            {/* C. DIGESTIVE LAYER (Liver covers stomach, pancreas overlap - Point 3, 10) */}
            {showDigestive && (
              <g id="layer-digestive" opacity={opacityDigestive} className="transition-all duration-300">
                {/* Esophagus (Food pipe) */}
                <path id="esophagus" d="M 0 -170 L 0 -54" stroke="#a21caf" strokeWidth="1.5" fill="none" opacity="0.4" />

                {/* Stomach (J-curve) */}
                <path
                  id="organ-stomach"
                  d="M 3 -52 C 10 -52, 25 -55, 27 -42 C 29 -30, 20 -18, 10 -22 C 1 -25, 1 -40, 3 -52 Z"
                  fill="url(#grad-stomach)"
                  stroke="#b91c1c"
                  strokeWidth="1.2"
                  filter="url(#organ-shadow)"
                  opacity={isHighlighted('stomach') ? 1.0 : 0.25}
                />

                {/* Large Intestine (Segmented colon framing abdominal base - Point 12) */}
                <path
                  id="organ-colon"
                  d="M -26 -14 L -26 -28 Q -26 -33, -16 -33 Q 0 -33, 16 -34 Q 22 -34, 22 -14 L 22 18 Q 22 28, 10 30 Q 0 32, -8 30 Z"
                  stroke="#78350f"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="2,3"
                  fill="none"
                  opacity={isHighlighted('colon') ? 0.85 : 0.22}
                />

                {/* Small Intestine convoluted loop cluster */}
                <path
                  id="organ-small-intestine"
                  d="M -16 -12 C -22 -4, -18 8, -14 12 C -8 12, -12 -4, -8 -8 C -4 -12, 0 8, 4 12 C 8 12, 4 -4, 8 -8 C 12 -12, 16 8, 16 16 C 16 20, -16 20, -16 -12 Z"
                  fill="#b45309"
                  stroke="#78350f"
                  strokeWidth="1.2"
                  filter="url(#organ-shadow)"
                  opacity={isHighlighted('small-intestine') ? 0.9 : 0.25}
                />

                {/* Liver (Right dominance, large left lobe overlap - Point 2, 11) */}
                <g
                  id="organ-liver"
                  onClick={(e) => { e.stopPropagation(); onSelectOrgan('liver'); }}
                  onMouseEnter={(e) => handleOrganHover(e, 'liver')}
                  onMouseMove={(e) => handleOrganHover(e, 'liver')}
                  onMouseLeave={() => setHoveredOrgan(null)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Select Liver"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSelectOrgan('liver'); } }}
                >
                  {/* Medically accurate lobed liver */}
                  <path
                    d="M -34 -52 C -32 -55, 4 -52, 8 -40 C 8 -30, -8 -22, -32 -35 C -38 -39, -36 -49, -34 -52 Z"
                    {...getOrganStateStyle('liver', 'url(#grad-liver)')}
                  />
                  {/* Falciform dividing line */}
                  <path d="M -14 -51 Q -16 -41, -12 -28" stroke="#854d0e" strokeWidth="0.8" fill="none" opacity="0.6" />
                </g>

                {/* Gallbladder (Green sac under right lobe - Point 12) */}
                <path
                  id="organ-gallbladder"
                  d="M -18 -34 C -20 -34, -21 -29, -17 -26 C -13 -23, -15 -32, -18 -34 Z"
                  fill="#15803d"
                  stroke="#166534"
                  strokeWidth="0.8"
                  opacity={isHighlighted('gallbladder') ? 0.95 : 0.2}
                />
              </g>
            )}

            {/* D. CARDIOVASCULAR SYSTEM (Tapered vessels trunk) */}
            {showCardio && (
              <g id="layer-cardio" opacity={opacityCardio} fill="none" className="transition-all duration-300">
                <path id="aorta" d="M -3 -88 C -14 -112, 10 -112, 3 -88 L 1 12" stroke="#ef4444" strokeWidth="3" />
                <path id="vena-cava" d="M -1 -88 L -1 12" stroke="#3b82f6" strokeWidth="2.8" />
                <path d="M 3 -102 L 18 -135" stroke="#ef4444" strokeWidth="1.5" /> 
                <path d="M -5 -102 L -18 -135" stroke="#ef4444" strokeWidth="1.5" /> 
                <path d="M 3 -106 Q 30 -105, 65 -50" stroke="#ef4444" strokeWidth="1.5" /> 
                <path d="M -3 -106 Q -30 -105, -65 -50" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M 1 12 Q 16 55, 30 220" stroke="#ef4444" strokeWidth="1.2" />
                <path d="M -1 12 Q -16 55, -30 220" stroke="#ef4444" strokeWidth="1.2" />
              </g>
            )}

            {/* E. HEART CHAMBERS OVERLAY */}
            {showCardio && (
              <g id="layer-heart-overlay" opacity={opacityCardio}>
                <g
                  id="organ-heart"
                  onClick={(e) => { e.stopPropagation(); onSelectOrgan('heart'); }}
                  onMouseEnter={(e) => handleOrganHover(e, 'heart')}
                  onMouseMove={(e) => handleOrganHover(e, 'heart')}
                  onMouseLeave={() => setHoveredOrgan(null)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Select Heart"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSelectOrgan('heart'); } }}
                >
                  <path
                    d="M 0 -95 C -15 -105, -22 -80, 0 -64 C 22 -80, 15 -105, 0 -95 Z"
                    {...getOrganStateStyle('heart', 'url(#grad-heart)')}
                  />
                  <path d="M -8 -84 Q 0 -80, 6 -72" stroke="#2563eb" strokeWidth="0.8" opacity="0.8" />
                  <path d="M -4 -90 Q 2 -85, 8 -78" stroke="#dc2626" strokeWidth="0.8" opacity="0.8" />
                </g>
              </g>
            )}

            {/* F. RESPIRATORY LAYER (Trachea & Lungs) */}
            {showRespiratory && (
              <g id="layer-respiratory" opacity={opacityRespiratory} fill="none" className="transition-all duration-300">
                <path id="trachea" d="M 0 -170 L 0 -105" stroke="#38bdf8" strokeWidth="2.2" strokeDasharray="1.2,1.2" />
                <path id="bronchi" d="M 0 -105 L -10 -90 M 0 -105 L 10 -90" stroke="#06b6d4" strokeWidth="1.5" />

                <path
                  id="organ-left-lung"
                  onClick={(e) => { e.stopPropagation(); onSelectOrgan('lungs'); }}
                  onMouseEnter={(e) => handleOrganHover(e, 'lungs')}
                  onMouseMove={(e) => handleOrganHover(e, 'lungs')}
                  onMouseLeave={() => setHoveredOrgan(null)}
                  d="M -3 -112 C -12 -112, -22 -102, -22 -82 C -22 -62, -10 -51, -3 -51 C -8 -61, -6 -82, -3 -91 C -1 -100, -3 -108, -3 -112 Z"
                  role="button"
                  tabIndex={0}
                  aria-label="Select Left Lung"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSelectOrgan('lungs'); } }}
                  {...getOrganStateStyle('lungs', 'url(#grad-lungs)')}
                />

                <path
                  id="organ-right-lung"
                  onClick={(e) => { e.stopPropagation(); onSelectOrgan('lungs'); }}
                  onMouseEnter={(e) => handleOrganHover(e, 'lungs')}
                  onMouseMove={(e) => handleOrganHover(e, 'lungs')}
                  onMouseLeave={() => setHoveredOrgan(null)}
                  d="M 3 -112 C 12 -112, 22 -102, 22 -82 C 22 -62, 10 -51, 3 -51 C 8 -68, 4 -99, 4 -112 Z"
                  role="button"
                  tabIndex={0}
                  aria-label="Select Right Lung"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSelectOrgan('lungs'); } }}
                  {...getOrganStateStyle('lungs', 'url(#grad-lungs)')}
                />
              </g>
            )}

            {/* G. NERVOUS LAYER & BRAIN CENTRAL CNS */}
            {showNerves && (
              <g id="layer-nerves" opacity={opacityNerves} stroke="#eab308" strokeWidth="1" fill="none" className="transition-all duration-300">
                <line x1="0" y1="-145" x2="0" y2="70" stroke="#f59e0b" strokeWidth="2.5" />
                <path d="M 0 -132 Q -22 -125, -42 -114" />
                <path d="M 0 -132 Q 22 -125, 42 -114" />
                <path d="M -42 -114 Q -60 -80, -95 28" />
                <path d="M 42 -114 Q 60 -80, 95 28" />
                <path d="M 0 -30 Q -15 0, -20 4" />
                <path d="M 0 -30 Q 15 0, 20 4" />
                <path d="M -20 4 Q -35 110, -32 230" stroke="#d97706" strokeWidth="1.6" />
                <path d="M 20 4 Q 35 110, 32 230" stroke="#d97706" strokeWidth="1.6" />
              </g>
            )}
            {showNerves && (
              <g id="layer-brain" opacity={opacityNerves}>
                <g
                  id="organ-brain"
                  onClick={(e) => { e.stopPropagation(); onSelectOrgan('brain'); }}
                  onMouseEnter={(e) => handleOrganHover(e, 'brain')}
                  onMouseMove={(e) => handleOrganHover(e, 'brain')}
                  onMouseLeave={() => setHoveredOrgan(null)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Select Brain"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSelectOrgan('brain'); } }}
                >
                  <path
                    d="M -22 -205 C -30 -220, -10 -235, 0 -235 C 10 -235, 30 -220, 22 -205 C 24 -180, -24 -180, -22 -205 Z"
                    {...getOrganStateStyle('brain', 'url(#grad-brain)')}
                  />
                  <path d="M -12 -215 Q 0 -225, 12 -215 M -8 -198 Q 0 -206, 8 -198" stroke="#9f1239" strokeWidth="0.8" opacity="0.4" />
                  <path
                    d="M -15 -188 C -22 -195, 22 -195, 15 -188 C 10 -182, -10 -182, -15 -188 Z"
                    fill="url(#grad-cerebellum)"
                    stroke="#9f1239"
                    strokeWidth="0.8"
                  />
                </g>
              </g>
            )}

            {/* H. SKELETAL LAYER (Fitted on top of organs to obscure them - Rule 5) */}
            {showSkeleton && (
              <g id="layer-skeleton" opacity={opacitySkeleton} stroke="#64748b" strokeWidth="1.2" fill="none" className="transition-all duration-300">
                {/* Skull */}
                <g fill="#1e293b" strokeWidth="1.2">
                  <path d="M -15 -185 C -25 -202, 25 -202, 15 -185 C 22 -172, -22 -172, -15 -185 Z" />
                  <ellipse cx="-6" cy="-178" rx="4" ry="5.5" fill="#020617" stroke="#334155" strokeWidth="0.8" />
                  <ellipse cx="6" cy="-178" rx="4" ry="5.5" fill="#020617" stroke="#334155" strokeWidth="0.8" />
                  <polygon points="0,-172 -3,-166 3,-166" fill="#020617" stroke="#334155" strokeWidth="0.5" />
                  <path d="M -11 -164 L -9 -154 C -7 -151, 7 -151, 9 -154 L 11 -164 Z" fill="#1e293b" />
                </g>

                {/* Spine Vertebrae segments */}
                <g fill="#1e293b" strokeWidth="0.8">
                  {[-148, -142, -136].map((y, i) => <rect key={`c-${i}`} x="-2.5" y={y} width="5" height="4.5" rx="1" />)}
                  {[-130, -124, -118, -112, -106, -100, -94, -88, -82, -76, -70, -64].map((y, i) => <rect key={`t-${i}`} x="-3.5" y={y} width="7" height="4.5" rx="1" />)}
                  {[-58, -52, -46, -40, -34].map((y, i) => <rect key={`l-${i}`} x="-4.5" y={y} width="9" height="5" rx="1" />)}
                </g>

                {/* Sternum body */}
                <rect x="-2" y="-120" width="4.5" height="52" rx="1" fill="#1e293b" />
                {/* Clavicles */}
                <path d="M -4 -122 Q -22 -120, -42 -114" />
                <path d="M 4 -122 Q 22 -120, 42 -114" />

                {/* 12 Rib Pairs wrapping thoracic cavity (Partially obscures organs) */}
                {[-115, -106, -97, -88, -79, -70, -61, -52, -43, -34, -25, -16].map((y, idx) => (
                  <g key={idx}>
                    <path d={`M 0 ${y} Q ${-28 - idx * 1.6} ${y + 4}, -3 ${y + 16}`} />
                    <path d={`M 0 ${y} Q ${27 + idx * 1.6} ${y + 4}, 3 ${y + 16}`} />
                  </g>
                ))}

                {/* Scapulae shoulder blades */}
                <path d="M -42 -114 L -28 -88 L -42 -92 Z" fill="#0f172a" />
                <path d="M 42 -114 L 28 -88 L 42 -92 Z" fill="#0f172a" />

                {/* Pelvis hip bones containing pelvic bladder */}
                <g fill="#1e293b">
                  <path d="M -28 -24 C -44 -24, -46 -2, -20 8 C -16 8, -20 -6, -24 -18 Z" />
                  <path d="M 26 -24 C 44 -24, 46 -2, 20 8 C 16 8, 20 -6, 24 -18 Z" />
                  <path d="M -7 -22 L 7 -22 L 4 4 L 0 12 L -4 4 Z" fill="#0f172a" />
                </g>

                {/* Upper/Lower extremity limbs */}
                <line x1="-42" y1="-114" x2="-75" y2="-40" strokeWidth="2.8" />
                <line x1="-75" y1="-40" x2="-95" y2="28" strokeWidth="1.8" />
                <line x1="42" y1="-114" x2="75" y2="-40" strokeWidth="2.8" />
                <line x1="75" y1="-40" x2="95" y2="28" strokeWidth="1.8" />

                <line x1="-22" y1="4" x2="-35" y2="120" strokeWidth="4.2" /> 
                <circle cx="-35" cy="125" r="3.2" fill="#475569" stroke="none" /> 
                <line x1="-35" y1="130" x2="-35" y2="230" strokeWidth="2.8" /> 
                <line x1="-39" y1="130" x2="-39" y2="230" strokeWidth="0.8" opacity="0.6" /> 

                <line x1="22" y1="4" x2="35" y2="120" strokeWidth="4.2" />
                <circle cx="35" cy="125" r="3.2" fill="#475569" stroke="none" />
                <line x1="35" y1="130" x2="35" y2="230" strokeWidth="2.8" />
                <line x1="39" y1="130" x2="39" y2="230" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {/* I. MUSCULAR SYSTEM overlaying skeleton frames */}
            {showMuscle && (
              <g id="layer-muscle" opacity={opacityMuscle} fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" className="transition-all duration-300">
                <path d="M -12 -178 L -6 -150 L 0 -150 Z" />
                <path d="M 12 -178 L 6 -150 L 0 -150 Z" />
                <path d="M -42 -135 C -35 -135, -5 -125, -2 -110 C -5 -100, -32 -100, -42 -115 Z" />
                <path d="M 42 -135 C 35 -135, 5 -125, 2 -110 C 5 -100, 32 -100, 42 -115 Z" />
                {[-90, -72, -54, -36, -18, 0].map((y, idx) => (
                  <g key={idx} fill="#b91c1c" opacity="0.8">
                    <rect x="-16" y={y} width="14" height="15" rx="1.5" />
                    <rect x="2" y={y} width="14" height="15" rx="1.5" />
                  </g>
                ))}
              </g>
            )}

            {/* J. LYMPHATIC LAYER nodes & green channels */}
            {showLymphatic && (
              <g id="layer-lymphatic" opacity={opacityLymphatic} stroke="#22c55e" strokeWidth="0.8" fill="#15803d" className="transition-all duration-300">
                {[-130, -115, -95].map((y, idx) => (
                  <g key={idx}>
                    <circle cx="-32" cy={y} r="2.2" />
                    <circle cx="32" cy={y} r="2.2" />
                    <circle cx="-14" cy={y - 25} r="2" />
                    <circle cx="14" cy={y - 25} r="2" />
                  </g>
                ))}
                <path d="M -14 -145 L -32 -130 L -32 -95" fill="none" />
                <path d="M 14 -145 L 32 -130 L 32 -95" fill="none" />
              </g>
            )}

            {/* K. SUBCUTANEOUS FAT LAYER */}
            {showFat && (
              <path
                id="layer-fat"
                d="M 0 -238 C 18 -238, 22 -195, 16 -180 C 16 -165, 23 -153, 52 -148 C 57 -148, 62 -128, 67 -88 C 72 -48, 79 0, 79 23 C 79 33, 81 43, 80 57 C 78 68, 74 68, 72 61 C 70 48, 64 10, 61 -23 C 59 -57, 48 -102, 42 -112 M -42 -112 C -48 -102, -59 -57, -61 -23 C -64 10, -70 48, -72 61 C -74 68, -78 68, -80 57 C -81 43, -79 33, -79 23 C -79 0, -72 -48, -67 -88 C -62 -128, -57 -148, -52 -148 C -23 -153, -16 -165, -16 -180 C -22 -195, -18 -238, 0 -238 Z"
                fill="#fbbf24"
                fillOpacity={opacityFat}
                stroke="#d97706"
                strokeWidth="0.8"
                strokeOpacity="0.15"
                className="transition-all duration-300"
              />
            )}

            {/* L. SKIN ENVELOPE (Drawn last/outermost - Point 5) */}
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
          {hoveredOrgan && organs[hoveredOrgan.id] && (
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
                <span className={organs[hoveredOrgan.id].temporary.health < 40 ? 'text-red-400' : 'text-emerald-400'}>
                  {organs[hoveredOrgan.id].temporary.health.toFixed(0)}%
                </span>
              </div>
              <div className="flex flex-col gap-1 text-slate-400">
                <div>Perfusion: <strong>{organs[hoveredOrgan.id].temporary.perfusion.toFixed(0)}% (Autoregulated)</strong></div>
                <div>Blood Supply: <strong>{organs[hoveredOrgan.id].id === 'heart' ? 'Ascending Aorta' : 'Systemic capillaries'}</strong></div>
                <div>Nerve Supply: <strong>{organs[hoveredOrgan.id].id === 'brain' ? 'CNS Cortex' : 'Peripheral Spinal Root'}</strong></div>
                <div>Metabolic rate: <strong>{organs[hoveredOrgan.id].temporary.oxygenation > 80 ? 'Aerobic' : 'Anaerobic'}</strong></div>
                <div>Active Drugs: <span className="text-emerald-400 font-semibold">{organs[hoveredOrgan.id].id === 'liver' && activeMeds['metformin'] ? 'Metformin' : 'None'}</span></div>
              </div>
            </div>
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
