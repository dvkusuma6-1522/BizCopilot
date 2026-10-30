'use client';

import React from 'react';
import { DoingWellItem, ActiveTab } from '@/lib/types';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SupportedLanguage, translations } from '@/lib/i18n';

interface DoingWellSectionProps {
  items: DoingWellItem[];
  onNavigate: (tab: ActiveTab, productId?: string) => void;
  lang?: SupportedLanguage;
}

export const DoingWellSection: React.FC<DoingWellSectionProps> = ({
  items,
  onNavigate,
  lang = 'en',
}) => {
  const t = translations[lang] || translations.en;

  return (
    <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/25 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-emerald-950 sm:text-lg">
                {t.doingWellTitle}
              </h2>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
                {items.length} Positive {items.length === 1 ? 'Signal' : 'Signals'}
              </span>
            </div>
            <p className="text-xs font-medium text-emerald-900/80 mt-0.5">
              {t.doingWellSubtitle}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/70 self-start sm:self-auto">
          Business Strengths
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
            No specific positive signals detected in this period.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-emerald-200/90 bg-white p-4 shadow-xs hover:border-emerald-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    {item.headline}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.productId}</span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-slate-900">{item.productName}</h3>
                <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed">
                  {item.positiveSignal}
                </p>

                <div className="mt-2.5 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 border border-slate-100 font-mono">
                  {item.supportingNumbers}
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-medium truncate max-w-[170px]">
                  ✓ {item.takeaway}
                </span>

                <button
                  onClick={() => onNavigate(item.targetSection, item.productId)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors shrink-0"
                >
                  <span>{t.btnInspect}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
