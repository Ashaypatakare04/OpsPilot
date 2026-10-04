'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Github } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-canvas-950/80 backdrop-blur-md border-b border-canvas-800/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-ivory-50" />
          </div>
          <span className="font-semibold text-graphite-100 tracking-tight text-base">OpsPilot</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            WCC 30
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-graphite-400">
          <a href="#core-insight" className="hover:text-graphite-200 transition-colors">Core Insight</a>
          <a href="#workflow" className="hover:text-graphite-200 transition-colors">Agent Workflow</a>
          <a href="#autonomy" className="hover:text-graphite-200 transition-colors">Autonomy Matrix</a>
          <a href="#governance" className="hover:text-graphite-200 transition-colors">Responsible AI</a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch OpsPilot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
