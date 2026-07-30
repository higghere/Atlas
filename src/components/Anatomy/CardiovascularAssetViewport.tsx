import React from 'react';
import { useAnatomy } from '../../hooks/useAnatomy';

interface CardiovascularAssetViewportProps {
  activeSystemId: string;
}

export const CardiovascularAssetViewport: React.FC<CardiovascularAssetViewportProps> = () => {
  const {
    svgContent,
    selectedId,
    hoveredId,
    selectedMetadata,
    searchQuery,
    searchResults,
    setSearchQuery,
    handleSelect,
    handleHover,
  } = useAnatomy();

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Search Header Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 backdrop-blur-md">
        <input
          type="text"
          placeholder="Search Cardiovascular Asset Registry..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent text-[11px] text-slate-200 focus:outline-none w-48 placeholder-slate-500"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
            {searchResults.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="px-3 py-1.5 text-[10px] text-slate-300 hover:bg-cyan-950 hover:text-cyan-400 cursor-pointer border-b border-slate-900 last:border-0"
              >
                <div className="font-bold">{item.name}</div>
                <div className="text-[8px] text-slate-500">{item.type} • #{item.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SVG Asset Stack Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {Object.entries(svgContent).map(([key, rawSvg]) => (
          <div
            key={key}
            className="absolute inset-0 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: rawSvg }}
            onClick={(e) => {
              const target = e.target as SVGElement;
              const pathId = target.getAttribute('id') || target.closest('[id]')?.getAttribute('id');
              if (pathId) {
                handleSelect(pathId);
              }
            }}
            onMouseOver={(e) => {
              const target = e.target as SVGElement;
              const pathId = target.getAttribute('id') || target.closest('[id]')?.getAttribute('id');
              if (pathId) {
                handleHover(pathId);
              }
            }}
            onMouseOut={() => handleHover(null)}
          />
        ))}
      </div>

      {/* Selection Metadata Panel */}
      {selectedMetadata && (
        <div className="absolute bottom-4 left-4 z-20 w-64 bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-fade-in text-[10px]">
          <div className="font-bold text-slate-100 uppercase border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
            <span>{selectedMetadata.name}</span>
            <span className="text-cyan-400 font-bold uppercase text-[8px]">{selectedMetadata.type}</span>
          </div>
          <p className="text-slate-400 leading-snug mb-2">{selectedMetadata.description}</p>
          <div className="text-[8px] text-slate-500 flex flex-col gap-0.5">
            <div>System: <strong className="text-slate-400">{selectedMetadata.system}</strong></div>
            <div>Parent: <strong className="text-slate-400">{selectedMetadata.parent || 'None'}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
