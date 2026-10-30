import React from 'react';
import { IMMUNE_LYMPHATIC_STRUCTURES_CATALOG, ImmuneLymphaticStructureComponent } from '../data/immuneData';

interface ImmuneExplorerProps {
  selectedStructureId: string | null;
  onSelectStructure: (id: string | null) => void;
  searchQuery: string;
}

export const ImmuneExplorer: React.FC<ImmuneExplorerProps> = ({
  selectedStructureId,
  onSelectStructure,
  searchQuery,
}) => {
  const categories: Array<{ label: string; emoji: string; filter: (s: ImmuneLymphaticStructureComponent) => boolean }> = [
    { label: 'Lymphatic Organs', emoji: '🛡️', filter: s => s.region === 'Lymphatic Organs' },
    { label: 'Lymph Nodes', emoji: '🟢', filter: s => s.region === 'Lymph Nodes' },
    { label: 'Lymphatic Vessels', emoji: '🌿', filter: s => s.region === 'Lymphatic Vessels' },
    { label: 'Lymphatic Tissue', emoji: '🧬', filter: s => s.region === 'Lymphatic Tissue' },
  ];

  const filteredNodes = IMMUNE_LYMPHATIC_STRUCTURES_CATALOG.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.latinName.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin select-none">
      {categories.map((cat, idx) => {
        const itemsInCat = filteredNodes.filter(cat.filter);
        if (itemsInCat.length === 0) return null;

        return (
          <div key={`imm_cat_${idx}`} className="text-xs">
            <div className="font-extrabold text-emerald-400 bg-slate-950/40 px-2 py-1.5 rounded-lg border border-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </span>
              <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                {itemsInCat.length}
              </span>
            </div>

            <div className="pl-3 mt-1 flex flex-col gap-1 border-l border-slate-900/80 ml-2">
              {itemsInCat.map(struct => {
                const isSelected = selectedStructureId === struct.id;

                return (
                  <button
                    key={`imm_tree_${struct.id}`}
                    onClick={() => onSelectStructure(isSelected ? null : struct.id)}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'text-emerald-400 bg-emerald-500/10 font-bold border-l-2 border-emerald-500 pl-3'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                  >
                    <span className="truncate">{struct.name}</span>
                    <span className="text-[9px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {struct.location}
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
