'use client';

import React from 'react';
import { Menu, Calendar, RotateCcw, Bot, ShieldCheck, Sparkles, Globe } from 'lucide-react';
import { ActiveTab } from '@/lib/types';
import { STORE_NAME } from '@/lib/demo-data';
import { SupportedLanguage, translations } from '@/lib/i18n';
import { formatINR } from '@/lib/analytics';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  periodDays: number;
  setPeriodDays: (days: number) => void;
  onResetData: () => void;
  setMobileOpen: (open: boolean) => void;
  isCustomData: boolean;
  mode: 'owner' | 'analyst';
  setMode: (mode: 'owner' | 'analyst') => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  moneySaved: number;
  onOpenMoneySaved: () => void;
  onOpenTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  periodDays,
  setPeriodDays,
  onResetData,
  setMobileOpen,
  isCustomData,
  mode,
  setMode,
  lang,
  setLang,
  moneySaved,
  onOpenMoneySaved,
  onOpenTour,
}) => {
  const t = translations[lang] || translations.en;

  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    overview: {
      title: t.brandName,
      subtitle: `${t.tagline} • ${STORE_NAME}`,
    },
    sales: {
      title: t.navSales,
      subtitle: 'Analyze revenue dynamics, detect drops, and track product movement',
    },
    inventory: {
      title: t.navInventory,
      subtitle: 'Days of supply, supplier delivery lead-time buffers, and dead-stock identification',
    },
    recommendations: {
      title: t.navRecommendations,
      subtitle: 'Deterministic, prioritized operational decisions to protect profit & cash flow',
    },
    copilot: {
      title: t.navCopilot,
      subtitle: 'Ask natural questions about sales trends, reorders, and inventory decisions',
    },
    import: {
      title: t.navImport,
      subtitle: 'Upload transaction CSVs/Excel or review active data structure',
    },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <header className="sticky top-0 z-30 flex min-h-18 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 py-2.5">
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
          <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {current.title}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">{current.subtitle}</p>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
        {/* Money Saved Counter Pill (Owner Mode highlight) */}
        {moneySaved > 0 && (
          <button
            onClick={onOpenMoneySaved}
            className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-100 transition-all"
            title="Click to view Money Saved calculation"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t.moneySaved}:</span>
            <span className="text-emerald-900 font-extrabold">{formatINR(moneySaved)}</span>
          </button>
        )}

        {/* Mode Toggle: Owner Mode vs Analyst Mode */}
        <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5">
          <button
            onClick={() => setMode('owner')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mode === 'owner'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.ownerMode.split(' ')[0]}
          </button>
          <button
            onClick={() => setMode('analyst')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mode === 'analyst'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.analystMode.split(' ')[0]}
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
          <Globe className="h-3.5 w-3.5 text-slate-400 ml-1 mr-0.5" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as SupportedLanguage)}
            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        {/* Dataset Origin Badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 md:flex">
          <span className={`h-2 w-2 rounded-full ${isCustomData ? 'bg-blue-500' : 'bg-emerald-500'}`} />
          <span>{isCustomData ? t.customData : t.sampleData}</span>
          {isCustomData && (
            <button
              onClick={onResetData}
              title={t.resetDemo}
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
              {t.periodSelector}:
            </span>
            <div className="flex items-center gap-0.5">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriodDays(days)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    periodDays === days
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tour Button */}
        <button
          onClick={onOpenTour}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hidden sm:flex"
          title="Setup & Quick Guide"
        >
          <Sparkles className="h-4 w-4 text-emerald-600" />
        </button>

        {/* Quick Ask Copilot Button if not on Copilot */}
        {activeTab !== 'copilot' && (
          <button
            onClick={() => setActiveTab('copilot')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">{t.askCopilotBtn}</span>
          </button>
        )}
      </div>
    </header>
  );
};
