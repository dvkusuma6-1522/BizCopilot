'use client';

import React, { useState } from 'react';
import { ActTodayItem, ActiveTab } from '@/lib/types';
import {
  AlertCircle,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Check,
  XCircle,
} from 'lucide-react';
import { SupportedLanguage, translations } from '@/lib/i18n';

interface ActTodaySectionProps {
  items: ActTodayItem[];
  onNavigate: (tab: ActiveTab, productId?: string) => void;
  onActionDone?: (productId: string, productName: string, impactValue: number) => void;
  onActionDismiss?: (productId: string) => void;
  lang?: SupportedLanguage;
  storeName?: string;
}

export const ActTodaySection: React.FC<ActTodaySectionProps> = ({
  items,
  onNavigate,
  onActionDone,
  onActionDismiss,
  lang = 'en',
  storeName = 'FreshMart Grocery',
}) => {
  const [expandedMathId, setExpandedMathId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>({});

  const t = translations[lang] || translations.en;

  const toggleMath = (id: string) => {
    setExpandedMathId(expandedMathId === id ? null : id);
  };

  const handleMarkDone = (item: ActTodayItem) => {
    setCompletedIds((prev) => ({ ...prev, [item.id]: true }));
    // Estimate impact value from reorder or drop
    const impactValue = item.productId.includes('OIL') ? 36 * 145 : 4500;
    if (onActionDone) {
      onActionDone(item.productId, item.productName, impactValue);
    }
  };

  const handleDismiss = (item: ActTodayItem) => {
    setDismissedIds((prev) => ({ ...prev, [item.id]: true }));
    if (onActionDismiss) {
      onActionDismiss(item.productId);
    }
  };

  // Filter out dismissed
  const visibleItems = items.filter((item) => !dismissedIds[item.id]);

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
                {t.actTodayTitle}
              </h2>
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                {visibleItems.length} Immediate
              </span>
            </div>
            <p className="text-xs font-medium text-rose-800/80 mt-0.5">
              {t.actTodaySubtitle}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800/70 self-start sm:self-auto">
          High Priority Checklist
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {visibleItems.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 text-center text-xs text-emerald-800">
            <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600 mb-1.5" />
            <p className="text-sm font-bold text-emerald-900">Good news! Nothing requires emergency action right now.</p>
            <p className="text-emerald-700 mt-0.5">All stock cover exceeds supplier delivery windows and sales velocity is normal.</p>
          </div>
        ) : (
          visibleItems.map((item) => {
            const isMathOpen = expandedMathId === item.id;
            const isDone = completedIds[item.id];

            const whatsappMsg = t.whatsappOrderMessage(storeName, item.productName, 36);
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

            return (
              <div
                key={item.id}
                className={`rounded-xl border bg-white p-4 shadow-xs transition-all ${
                  isDone ? 'border-emerald-300 bg-emerald-50/30' : 'border-rose-200 hover:border-rose-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{item.productName}</h3>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {item.category}
                      </span>
                      {isDone ? (
                        <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Action Done
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider text-rose-800">
                          Immediate Action
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-slate-700 font-medium leading-relaxed">
                      {item.simpleExplanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                    <button
                      onClick={() => onNavigate(item.targetSection, item.productId)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-emerald-300 hover:text-emerald-800 transition-all active:scale-[0.98]"
                    >
                      <span>{t.btnInspect}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    {item.targetSection === 'inventory' && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all active:scale-[0.98]"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    {!isDone ? (
                      <button
                        onClick={() => handleMarkDone(item)}
                        className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-[0.98]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{t.btnDone}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold px-2">✓ Saved</span>
                    )}

                    <button
                      onClick={() => handleDismiss(item)}
                      title={t.btnDismiss}
                      className="rounded-lg p-1.5 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
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
                    <span>{t.btnHowCalculated}</span>
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
