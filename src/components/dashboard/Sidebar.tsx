'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  FileText,
  CheckCircle2,
  GitBranch,
  Activity,
  BarChart3,
  Settings,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  onResetDemo?: () => void;
  isResetting?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onResetDemo, isResetting }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/app', icon: Layers },
    { name: 'Invoices', href: '/app/invoices', icon: FileText },
    { name: 'Approvals', href: '/app/approvals', icon: ShieldAlert, badge: 'Needs Attention' },
    { name: 'Workflows', href: '/app/workflows', icon: GitBranch },
    { name: 'Activity & Audit', href: '/app/activity', icon: Activity },
    { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
    { name: 'Settings & Policy', href: '/app/settings', icon: Settings },
  ];

  const [localResetting, setLocalResetting] = React.useState(false);

  const handleResetClick = async () => {
    if (onResetDemo) {
      onResetDemo();
      return;
    }
    setLocalResetting(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setLocalResetting(false);
    }
  };

  const isButtonResetting = isResetting || localResetting;

  return (
    <aside className="w-64 bg-canvas-900 border-r border-canvas-800 flex flex-col justify-between h-screen sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-canvas-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-ivory-50" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-graphite-100 tracking-tight text-base">OpsPilot</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">AI</span>
              </div>
              <p className="text-[11px] text-graphite-400 font-mono tracking-tight">Autonomous Finance Ops</p>
            </div>
          </Link>
        </div>

        {/* Demo Environment Safety Badge (Mandatory Section 18 & 51) */}
        <div className="mx-4 my-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 animate-ping" />
          <div>
            <p className="font-medium text-amber-200">DEMO ENVIRONMENT</p>
            <p className="text-[10px] text-amber-400/80">Simulated rails. No real funds moved.</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-sm'
                    : 'text-graphite-400 hover:text-graphite-200 hover:bg-canvas-850'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-graphite-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    2
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls & System state */}
      <div className="p-4 border-t border-canvas-800/80 space-y-3">
        <div className="bg-canvas-850 p-3 rounded-lg border border-canvas-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-graphite-400">Agent Orchestrator</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-graphite-400">Autonomy Gate</span>
            <span className="text-graphite-300 font-mono">Enforced</span>
          </div>
        </div>

        <button
          onClick={handleResetClick}
          disabled={isButtonResetting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-canvas-800 hover:bg-canvas-700 text-graphite-300 hover:text-graphite-100 text-xs font-medium border border-canvas-700 transition-all disabled:opacity-50"
          title="Reset environment to default seed scenarios"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isButtonResetting ? 'animate-spin' : ''}`} />
          <span>{isButtonResetting ? 'Resetting Demo...' : 'Reset Demo Scenarios'}</span>
        </button>
      </div>
    </aside>
  );
};
