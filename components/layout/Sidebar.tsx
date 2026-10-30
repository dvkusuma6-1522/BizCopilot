'use client';

import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  Sparkles,
  Bot,
  UploadCloud,
  Store,
  X,
} from 'lucide-react';
import { ActiveTab } from '@/lib/types';
import { STORE_NAME, STORE_TYPE } from '@/lib/demo-data';
import { SupportedLanguage, translations } from '@/lib/i18n';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  stockoutCount: number;
  recommendationCount: number;
  lang?: SupportedLanguage;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  stockoutCount,
  recommendationCount,
  lang = 'en',
}) => {
  const t = translations[lang] || translations.en;

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: t.navOverview,
      icon: LayoutDashboard,
      badge: stockoutCount > 0 ? `${stockoutCount} alert` : undefined,
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      id: 'sales' as ActiveTab,
      label: t.navSales,
      icon: TrendingUp,
    },
    {
      id: 'inventory' as ActiveTab,
      label: t.navInventory,
      icon: Boxes,
      badge: stockoutCount > 0 ? `${stockoutCount} risk` : undefined,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'recommendations' as ActiveTab,
      label: t.navRecommendations,
      icon: Sparkles,
      badge: recommendationCount > 0 ? `${recommendationCount}` : undefined,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'copilot' as ActiveTab,
      label: t.navCopilot,
      icon: Bot,
      pulse: true,
    },
    {
      id: 'import' as ActiveTab,
      label: t.navImport,
      icon: UploadCloud,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">BizCopilot</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-800">
                  AI MVP
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">{t.tagline}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Intelligence Hub
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50/80 text-emerald-900 shadow-sm border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.pulse && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    {item.badge && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Current Store Badge Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-white p-2 shadow-sm border border-slate-200/80 text-slate-700">
                <Store className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{STORE_NAME}</h4>
                  <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-1.5 py-0.2 text-[9px] font-medium text-emerald-700">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{STORE_TYPE}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  12 Active SKUs Tracked
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
