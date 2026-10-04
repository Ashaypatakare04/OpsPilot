'use client';

import React from 'react';
import Link from 'next/link';
import { HeroCore3D } from '@/components/3d/HeroCore3D';
import { ArrowRight, ShieldCheck, Play, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden border-b border-canvas-800/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-850 border border-canvas-750 text-xs font-mono text-graphite-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-graphite-400">Agentic Finance Operations</span>
            <span className="text-graphite-600">•</span>
            <span className="text-amber-400">WCC Launchpad 30</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-graphite-50 leading-[1.12]">
            Your startup&apos;s <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-200 bg-clip-text text-transparent">
              AI execution layer.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-graphite-300 leading-relaxed max-w-2xl mx-auto font-normal">
            OpsPilot reviews, reconciles, and routes invoices automatically — while knowing exactly when a human needs to step in.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/app"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Launch OpsPilot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#demo-sandbox"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-canvas-850 hover:bg-canvas-800 text-graphite-200 hover:text-graphite-100 border border-canvas-750 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-graphite-400" />
              <span>See How It Works</span>
            </a>
          </div>

          {/* Micro Trust Proof */}
          <div className="pt-2 flex items-center justify-center gap-6 text-[11px] font-mono text-graphite-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Deterministic Safety Rails
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Gemini Multimodal Reasoning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Zero Blind Autonomy
            </span>
          </div>
        </div>

        {/* 3D OpsPilot Operations Core Visualization */}
        <div className="mt-8 rounded-2xl bg-canvas-900/60 border border-canvas-800/80 backdrop-blur-sm overflow-hidden shadow-2xl relative">
          <HeroCore3D />
        </div>
      </div>
    </section>
  );
};
