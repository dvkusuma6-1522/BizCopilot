'use client';

import React from 'react';
import { Festival } from '@/lib/festivals/data';
import { reminderDue, getFestivalEffectiveDate } from '@/lib/engine/festivals';
import { SupportedLanguage, translations } from '@/lib/i18n';
import { Bell, Calendar, X, ArrowRight } from 'lucide-react';

interface FestivalReminderBannerProps {
  festivals: Festival[];
  dismissedIds: string[];
  onDismiss: (festivalId: string) => void;
  onOpenCalendar: () => void;
  lang: SupportedLanguage;
  today?: string | Date;
}

export const FestivalReminderBanner: React.FC<FestivalReminderBannerProps> = ({
  festivals,
  dismissedIds,
  onDismiss,
  onOpenCalendar,
  lang,
  today = new Date(),
}) => {
  const t = translations[lang] || translations.en;

  // Find the first upcoming festival where reminderDue is true and not dismissed
  const activeReminder = festivals.find((fest) => {
    if (dismissedIds.includes(fest.id)) return false;
    return reminderDue(fest, today);
  });

  if (!activeReminder) return null;

  const festName = activeReminder.name[lang] || activeReminder.name.en;
  const tipText = activeReminder.tip[lang] || activeReminder.tip.en;
  const effectiveDate = getFestivalEffectiveDate(activeReminder);
  const festDate = new Date(`${effectiveDate.slice(0, 10)}T00:00:00`);
  const todayDate = typeof today === 'string' ? new Date(`${today.slice(0, 10)}T00:00:00`) : new Date(today);
  todayDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (festDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Bell className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                {diffDays === 14 ? '14-Day Advance Notice' : '3-Day Final Warning'}
              </span>
              <h4 className="text-sm font-bold text-amber-950">
                {t.festivalReminderBanner(festName, diffDays)}
              </h4>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
              💡 {tipText}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={onOpenCalendar}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-black transition-all"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {lang === 'kn' ? 'ಸ್ಟಾಕ್ ಚೆಕ್ ಮಾಡಿ' : lang === 'hi' ? 'स्टॉक चेक करें' : 'Check Festival Stock'}
                </span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss(activeReminder.id)}
          className="rounded-lg p-1 text-amber-700 hover:bg-amber-100 hover:text-amber-900 transition-colors"
          title={t.btnDismiss}
          aria-label="Dismiss reminder"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
