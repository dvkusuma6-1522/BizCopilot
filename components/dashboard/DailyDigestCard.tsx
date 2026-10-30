'use client';

import React, { useState } from 'react';
import {
  DailyDigest,
  DigestAction,
  renderDigestActionText,
  generateWhatsAppDigestShareText,
} from '@/lib/engine/digest';
import { SupportedLanguage, translations } from '@/lib/i18n';
import {
  Sparkles,
  Share2,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  PackageOpen,
  Calendar,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface DailyDigestCardProps {
  digest: DailyDigest;
  lang: SupportedLanguage;
  storeName: string;
  onNavigateToProduct?: (productId: string, section: 'sales' | 'inventory') => void;
  onActionDone?: (action: DigestAction) => void;
}

export const DailyDigestCard: React.FC<DailyDigestCardProps> = ({
  digest,
  lang,
  storeName,
  onNavigateToProduct,
  onActionDone,
}) => {
  const t = translations[lang] || translations.en;
  const [completedActionIds, setCompletedActionIds] = useState<Set<string>>(new Set());

  const handleMarkDone = (action: DigestAction) => {
    setCompletedActionIds((prev) => new Set(prev).add(action.id));
    if (onActionDone) {
      onActionDone(action);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = generateWhatsAppDigestShareText(storeName, digest, lang);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleWhatsAppOrderProduct = (action: DigestAction) => {
    const p = action.params;
    const prodName = (p.productName as string) || 'Stock replenishment';
    const qty = p.reorderQty || 10;
    const msg = encodeURIComponent(t.whatsappOrderMessage(storeName, prodName, Number(qty)));
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const getActionIcon = (type: DigestAction['type']) => {
    switch (type) {
      case 'stockout':
        return <AlertCircle className="h-5 w-5 text-rose-600" />;
      case 'festival_reorder':
        return <Calendar className="h-5 w-5 text-amber-600" />;
      case 'sales_drop':
        return <TrendingDown className="h-5 w-5 text-indigo-600" />;
      case 'dead_stock':
        return <PackageOpen className="h-5 w-5 text-orange-600" />;
    }
  };

  const getActionBorder = (type: DigestAction['type']) => {
    switch (type) {
      case 'stockout':
        return 'border-rose-200 bg-rose-50/40 hover:border-rose-300';
      case 'festival_reorder':
        return 'border-amber-200 bg-amber-50/40 hover:border-amber-300';
      case 'sales_drop':
        return 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-300';
      case 'dead_stock':
        return 'border-orange-200 bg-orange-50/40 hover:border-orange-300';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/20 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 p-5 sm:p-6 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                {t.digestTitle}
              </h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                {digest.actions.length} {lang === 'kn' ? 'ಕ್ರಮಗಳು' : lang === 'hi' ? 'फैसले' : 'Actions'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t.digestSubtitle}</p>
          </div>
        </div>

        {/* WhatsApp Share Button */}
        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>{t.digestShareWhatsApp}</span>
        </button>
      </div>

      {/* Body: Top 3 Urgent Actions */}
      <div className="mt-4 space-y-3">
        {digest.actions.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
            <p className="text-sm font-bold text-slate-800">{t.digestAllClear}</p>
          </div>
        ) : (
          digest.actions.map((action, idx) => {
            const text = renderDigestActionText(action, lang);
            const isDone = completedActionIds.has(action.id);

            return (
              <div
                key={action.id}
                className={`rounded-2xl border p-4 transition-all ${getActionBorder(action.type)} ${
                  isDone ? 'opacity-60 grayscale-50 bg-slate-50 border-slate-200' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200/60">
                      {getActionIcon(action.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{text.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {text.explanation}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-200/60">
                        <span className="text-emerald-700">👉 {lang === 'kn' ? 'ಸಲಹೆ:' : lang === 'hi' ? 'सलाह:' : 'Action:'}</span>
                        <span>{text.actionText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(action.type === 'stockout' || action.type === 'festival_reorder') && (
                      <button
                        onClick={() => handleWhatsAppOrderProduct(action)}
                        className="min-h-[48px] inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold shadow-xs transition-all active:scale-95"
                        title={t.btnWhatsApp}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>WhatsApp</span>
                      </button>
                    )}

                    {action.productId && onNavigateToProduct && (
                      <button
                        onClick={() =>
                          onNavigateToProduct(
                            action.productId!,
                            action.type === 'sales_drop' ? 'sales' : 'inventory'
                          )
                        }
                        className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        title={t.btnInspect}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleMarkDone(action)}
                      disabled={isDone}
                      className={`min-h-[48px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-slate-200 text-slate-500 cursor-default'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95'
                      }`}
                      title={t.btnDone}
                    >
                      {isDone ? (
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{t.btnDone}</span>
                        </span>
                      ) : (
                        t.btnDone
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
