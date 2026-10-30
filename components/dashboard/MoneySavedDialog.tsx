'use client';

import React from 'react';
import { DBAction } from '@/lib/db';
import { formatINR } from '@/lib/analytics';
import { X, TrendingUp, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { SupportedLanguage, translations } from '@/lib/i18n';

interface MoneySavedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  actions: DBAction[];
  lang?: SupportedLanguage;
}

export const MoneySavedDialog: React.FC<MoneySavedDialogProps> = ({
  isOpen,
  onClose,
  actions,
  lang = 'en',
}) => {
  const t = translations[lang] || translations.en;

  if (!isOpen) return null;

  const doneActions = actions.filter((a) => a.status === 'done');
  const totalSaved = doneActions.reduce((sum, a) => sum + (a.impactValue || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.moneySaved} Calculation</h3>
              <p className="text-xs text-slate-500">
                Formula breakdown of cash protected through your proactive actions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Hero Banner */}
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider block">
                Total Revenue & Cash Protected
              </span>
              <div className="text-2xl sm:text-3xl font-black mt-1">{formatINR(totalSaved)}</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
              <Sparkles className="h-6 w-6 text-emerald-200" />
            </div>
          </div>
          <p className="mt-2 text-xs text-emerald-100/90">
            Calculated deterministically whenever you mark a replenishment or discount action as &quot;Done&quot;.
          </p>
        </div>

        {/* Itemized List */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Completed Actions Breakdown ({doneActions.length})
          </h4>

          {doneActions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-slate-400" />
              <span>No actions marked Done yet.</span>
              <p className="mt-1 text-slate-400">
                When you reorder items or discount dead stock in &quot;Act Today&quot;, tap &quot;Done&quot; to credit money saved here!
              </p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {doneActions.map((act) => (
                <div
                  key={act.id || act.productId}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {act.productName}
                    </span>
                    <span className="text-emerald-700 font-extrabold">{formatINR(act.impactValue)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{act.description}</p>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      Formula:{' '}
                      {act.type === 'reorder'
                        ? 'Avoided stockout revenue (Units × Retail Price)'
                        : 'Liberated locked inventory at wholesale cost'}
                    </span>
                    <span>{act.completedAt?.slice(0, 10) || 'Today'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
};
