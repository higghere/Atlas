import React from 'react';
import { DIGESTIVE_ORGANS_CATALOG, DigestiveOrganComponent } from '../data/digestiveData';

interface DigestiveExplorerProps {
  selectedOrganId: string | null;
  onSelectOrgan: (id: string | null) => void;
  searchQuery: string;
}

export const DigestiveExplorer: React.FC<DigestiveExplorerProps> = ({
  selectedOrganId,
  onSelectOrgan,
  searchQuery,
}) => {
  const regions: Array<{ label: string; emoji: string; filter: (o: DigestiveOrganComponent) => boolean }> = [
    { label: 'Upper GI (Pharynx/Esophagus)', emoji: '🗣️', filter: o => o.region === 'Upper GI' },
    { label: 'Upper Abdomen (Liver/Stomach/Pancreas)', emoji: '🥗', filter: o => o.region === 'Upper Abdomen' },
    { label: 'Mid Abdomen (Small Intestine)', emoji: '🌀', filter: o => o.region === 'Mid Abdomen' },
    { label: 'Outer Abdomen (Large Intestine)', emoji: '🍩', filter: o => o.region === 'Outer Abdomen' },
    { label: 'Pelvis (Rectum & Anal Canal)', emoji: '🚽', filter: o => o.region === 'Pelvis' },
  ];

  const filteredNodes = DIGESTIVE_ORGANS_CATALOG.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.latinName.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin select-none">
      {regions.map((reg, idx) => {
        const organsInRegion = filteredNodes.filter(reg.filter);
        if (organsInRegion.length === 0) return null;

        return (
          <div key={`dig_reg_${idx}`} className="text-xs">
            <div className="font-extrabold text-emerald-400 bg-slate-950/40 px-2 py-1.5 rounded-lg border border-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{reg.emoji}</span>
                <span>{reg.label}</span>
              </span>
              <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                {organsInRegion.length}
              </span>
            </div>

            <div className="pl-3 mt-1 flex flex-col gap-1 border-l border-slate-900/80 ml-2">
              {organsInRegion.map(organ => {
                const isSelected = selectedOrganId === organ.id;

                return (
                  <button
                    key={`dig_tree_${organ.id}`}
                    onClick={() => onSelectOrgan(isSelected ? null : organ.id)}
                    className={`w-full text-left py-1 px-2 rounded-md transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400">├─</span>
                      <span className="truncate text-[11px]">{organ.name}</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 group-hover:text-slate-400 uppercase">
                      {organ.region}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
