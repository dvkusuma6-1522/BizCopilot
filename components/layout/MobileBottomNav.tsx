'use client';

import React from 'react';
import { ActiveTab } from '@/lib/types';
import { LayoutDashboard, TrendingUp, Boxes, Bot, Calendar } from 'lucide-react';
import { SupportedLanguage, translations } from '@/lib/i18n';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang?: SupportedLanguage;
  stockoutCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  lang = 'en',
  stockoutCount = 0,
}) => {
  const t = translations[lang] || translations.en;

  const tabs: { id: ActiveTab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'overview', label: t.navOverview.split(' ')[0], icon: LayoutDashboard },
    { id: 'inventory', label: t.navInventory.split(' ')[0], icon: Boxes, badge: stockoutCount },
    {
      id: 'calendar',
      label: lang === 'kn' ? 'ಕ್ಯಾಲೆಂಡರ್' : lang === 'hi' ? 'कैलेंडर' : 'Calendar',
      icon: Calendar,
    },
    { id: 'sales', label: t.navSales.split(' ')[0], icon: TrendingUp },
    { id: 'copilot', label: 'Copilot', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md lg:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
