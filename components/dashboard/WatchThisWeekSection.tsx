'use client';

import React, { useState } from 'react';
import { WatchThisWeekItem, ActiveTab } from '@/lib/types';
import { Clock, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface WatchThisWeekSectionProps {
  items: WatchThisWeekItem[];
  onNavigate: (tab: ActiveTab, productId?: string) => void;
}

export const WatchThisWeekSection: React.FC<WatchThisWeekSectionProps> = ({ items, onNavigate }) => {
  const [expandedMathId, setExpandedMathId] = useState<string | null>(null);

  const toggleMath = (id: string) => {
    setExpandedMathId(expandedMathId === id ? null : id);
  };

  return (
    <div className="rounded-2xl border border-amber-300/80 bg-amber-50/25 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/20">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-amber-950 sm:text-lg">
                Watch This Week
              </h2>
              <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                {items.length} {items.length === 1 ? 'Item' : 'Items'} to Plan
              </span>
            </div>
            <p className="text-xs font-medium text-amber-900/80 mt-0.5">
              Not an emergency today, but needs a decision before it becomes a problem
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 self-start sm:self-auto">
          Weekly Planning
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
            No items flagged for weekly watching. Your stock levels and turnover are on schedule.
          </div>
        ) : (
          items.map((item) => {
            const isMathOpen = expandedMathId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-amber-200/90 bg-white p-4 shadow-xs hover:border-amber-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{item.productName}</h3>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {item.category}
                      </span>
                      <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Watch
                      </span>
                    </div>

                    <h4 className="mt-1 text-xs font-bold text-amber-900">{item.headline}</h4>
                    <p className="mt-1 text-xs text-slate-700 font-medium leading-relaxed">
                      {item.reason}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate(item.targetSection, item.productId)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100 transition-all self-end sm:self-auto active:scale-[0.98]"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Supporting Numbers */}
                <div className="mt-2.5 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 border border-slate-100 font-mono">
                  <span className="font-sans font-bold text-slate-800">Numbers: </span>
                  {item.supportingNumbers}
                </div>

                {/* Recommended Next Step Box */}
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50/60 border border-amber-200/60 p-2.5 text-xs text-amber-950">
                  <span className="font-bold text-amber-900 shrink-0">💡 What to do this week:</span>
                  <span>{item.recommendedAction}</span>
                </div>

                {/* How we calculated this toggle */}
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1">
                  <button
                    onClick={() => toggleMath(item.id)}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                  >
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                    <span>How we calculated this</span>
                    {isMathOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  <span className="text-slate-400 font-mono text-[10px]">SKU: {item.productId}</span>
                </div>

                {isMathOpen && (
                  <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-600 animate-in fade-in duration-100">
                    <p className="font-semibold text-slate-800 mb-0.5">Calculation Breakdown:</p>
                    <p className="font-mono text-[11px] text-slate-700">{item.howCalculated}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
