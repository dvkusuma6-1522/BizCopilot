'use client';

import React from 'react';
import { Menu, Calendar, RotateCcw, Bot } from 'lucide-react';
import { ActiveTab } from '@/lib/types';
import { STORE_NAME } from '@/lib/demo-data';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  periodDays: number;
  setPeriodDays: (days: number) => void;
  onResetData: () => void;
  setMobileOpen: (open: boolean) => void;
  isCustomData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  periodDays,
  setPeriodDays,
  onResetData,
  setMobileOpen,
  isCustomData,
}) => {
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Store Performance Overview',
      subtitle: `Executive summary & proactive alerts for ${STORE_NAME}`,
    },
    sales: {
      title: 'Sales Intelligence & Velocity',
      subtitle: 'Analyze revenue dynamics, detect drops, and track product movement',
    },
    inventory: {
      title: 'Inventory & Stock Cover',
      subtitle: 'Days of supply, supplier delivery lead-time buffers, and dead-stock identification',
    },
    recommendations: {
      title: 'AI Advisor Recommendations',
      subtitle: 'Deterministic, prioritized operational decisions to protect profit & cash flow',
    },
    copilot: {
      title: 'BizCopilot Assistant',
      subtitle: 'Ask natural questions about sales trends, reorders, and inventory decisions',
    },
    import: {
      title: 'Data Import & CSV Management',
      subtitle: 'Upload transaction CSVs or review active data structure',
    },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {current.title}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">{current.subtitle}</p>
        </div>
      </div>

      {/* Right: Period Selector & Action Badges */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dataset Origin Badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 md:flex">
          <span className={`h-2 w-2 rounded-full ${isCustomData ? 'bg-blue-500' : 'bg-emerald-500'}`} />
          <span>{isCustomData ? 'Custom CSV Data' : 'Sample Store Data'}</span>
          {isCustomData && (
            <button
              onClick={onResetData}
              title="Reset to FreshMart sample data"
              className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Period Selector (Hidden on Copilot & Import tabs) */}
        {activeTab !== 'copilot' && activeTab !== 'import' && (
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/90 p-1 shadow-xs">
            <span className="hidden px-2 text-xs font-medium text-slate-400 sm:inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Period:
            </span>
            <div className="flex items-center gap-0.5">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriodDays(days)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    periodDays === days
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Ask Copilot Button if not on Copilot */}
        {activeTab !== 'copilot' && (
          <button
            onClick={() => setActiveTab('copilot')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Ask Copilot</span>
          </button>
        )}
      </div>
    </header>
  );
};
