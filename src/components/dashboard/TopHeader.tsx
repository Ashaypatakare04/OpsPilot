'use client';

import React from 'react';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';

interface TopHeaderProps {
  onOpenUpload: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenUpload, onRefresh, isRefreshing }) => {
  return (
    <header className="h-16 border-b border-canvas-800 bg-canvas-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-sm font-semibold text-graphite-100 flex items-center gap-2">
          <span>Good morning.</span>
          <span className="text-graphite-400 font-normal">Your finance operations are under control.</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-canvas-800 hover:bg-canvas-700 text-graphite-300 border border-canvas-700 transition-colors disabled:opacity-50"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        )}

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-800/80 border border-canvas-700/60 text-xs font-mono text-graphite-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Gemini & Rules Engine: Active</span>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Invoice</span>
        </button>
      </div>
    </header>
  );
};
