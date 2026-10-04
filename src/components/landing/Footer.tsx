'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-canvas-950 text-graphite-400 border-t border-canvas-800/80">
      {/* Final CTA Banner */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center border-b border-canvas-850 space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-graphite-100 tracking-tight">
          Automate the routine. <br />
          <span className="bg-gradient-to-r from-blue-400 to-amber-300 bg-clip-text text-transparent">
            Keep control of the important.
          </span>
        </h2>
        <p className="text-sm text-graphite-300 max-w-xl mx-auto leading-relaxed">
          Deploy an autonomous finance operations layer designed specifically for lean startup teams and fast-moving operations.
        </p>
        <div>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
          >
            <span>Launch OpsPilot Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-graphite-200">OpsPilot</span>
          <span className="text-graphite-600">|</span>
          <span>WCC Launchpad 30 Hackathon</span>
        </div>

        <div className="text-graphite-500 text-center sm:text-right">
          <span>Demo Environment • Powered by Google Gemini & Deterministic Rules</span>
        </div>
      </div>
    </footer>
  );
};
