'use client';

import React, { useState } from 'react';
import { ActTodayItem, ActiveTab } from '@/lib/types';
import { AlertCircle, ArrowRight, HelpCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface ActTodaySectionProps {
  items: ActTodayItem[];
  onNavigate: (tab: ActiveTab, productId?: string) => void;
}

export const ActTodaySection: React.FC<ActTodaySectionProps> = ({ items, onNavigate }) => {
  const [expandedMathId, setExpandedMathId] = useState<string | null>(null);

  const toggleMath = (id: string) => {
    setExpandedMathId(expandedMathId === id ? null : id);
  };

  return (
    <div className="rounded-2xl border-2 border-rose-300/80 bg-rose-50/30 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm shadow-rose-600/30">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-rose-950 sm:text-lg">
                Act Today
              </h2>
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                {items.length} Immediate {items.length === 1 ? 'Action' : 'Actions'}
              </span>
            </div>
            <p className="text-xs font-medium text-rose-800/80 mt-0.5">
              Urgent issues that could cost your shop money or empty your shelves today
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800/70 self-start sm:self-auto">
          High Priority Checklist
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {items.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 text-center text-xs text-emerald-800">
            <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600 mb-1.5" />
            <p className="text-sm font-bold text-emerald-900">Good news! Nothing requires emergency action today.</p>
            <p className="text-emerald-700 mt-0.5">All stock cover exceeds supplier delivery windows and sales velocity is normal.</p>
          </div>
        ) : (
          items.map((item) => {
            const isMathOpen = expandedMathId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-rose-200 bg-white p-4 shadow-xs hover:border-rose-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{item.productName}</h3>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {item.category}
                      </span>
                      <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider text-rose-800">
                        Immediate Action
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-700 font-medium leading-relaxed">
                      {item.simpleExplanation}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate(item.targetSection, item.productId)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-all self-end sm:self-auto active:scale-[0.98]"
                  >
                    <span>Inspect Problem</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Supporting Numbers */}
                <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-100 font-mono">
                  <span className="font-sans font-bold text-slate-900">Numbers: </span>
                  {item.supportingNumbers}
                </div>

                {/* Suggested Action Box */}
                <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-rose-50/70 border border-rose-200/80 p-2.5 text-xs text-rose-950">
                  <span className="font-bold text-rose-900 shrink-0">👉 What to do today:</span>
                  <span>{item.suggestedAction}</span>
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
                  <span className="text-slate-400 font-mono text-[10px]">Product SKU: {item.productId}</span>
                </div>

                {isMathOpen && (
                  <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-600 animate-in fade-in duration-100">
                    <p className="font-semibold text-slate-800 mb-0.5">Exact Calculation:</p>
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
