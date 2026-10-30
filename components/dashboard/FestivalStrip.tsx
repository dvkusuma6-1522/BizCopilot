'use client';

import React from 'react';
import { Festival } from '@/lib/festivals/data';
import { stockCheckForFestival } from '@/lib/engine/festivals';
import { CalculatedInventoryItem } from '@/lib/types';
import { SupportedLanguage, translations } from '@/lib/i18n';
import { Calendar, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FestivalStripProps {
  festivals: Festival[];
  inventory: CalculatedInventoryItem[];
  lang: SupportedLanguage;
  onOpenCalendar: () => void;
  today?: string | Date;
}

export const FestivalStrip: React.FC<FestivalStripProps> = ({
  festivals,
  inventory,
  lang,
  onOpenCalendar,
  today = new Date(),
}) => {
  const t = translations[lang] || translations.en;
  const topFestivals = festivals.slice(0, 2);

  if (topFestivals.length === 0) return null;

  return (
    <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50/60 via-pink-50/40 to-amber-50/50 p-4 sm:p-4.5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
              <span>{lang === 'kn' ? 'ಮುಂಬರುವ ಹಬ್ಬಗಳ ತಯಾರಿ' : lang === 'hi' ? 'आगामी त्यौहार एवं मौसमी बिक्री' : 'Coming Up: Festival & Season Prep'}</span>
              <span className="rounded-full bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">
                Calendar
              </span>
            </h3>
            <p className="text-xs text-purple-800/80">
              {lang === 'kn'
                ? 'ಮುಂಚಿತವಾಗಿಯೇ ದಾಸ್ತಾನು ಪರಿಶೀಲಿಸಿ ಸಪ್ಲೈಯರ್‌ಗೆ ಆರ್ಡರ್ ಮಾಡಿ'
                : lang === 'hi'
                ? 'सप्लायर के अवकाश व बाजार की तेजी से पहले स्टॉक जांचें'
                : 'Check stock levels and place advance orders before supplier cutoffs'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCalendar}
          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors self-start sm:self-auto"
        >
          <span>{lang === 'kn' ? 'ಕ್ಯಾಲೆಂಡರ್ ವೀಕ್ಷಿಸಿ' : lang === 'hi' ? 'कैलेंडर देखें' : 'View Full Calendar'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Festival cards row */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {topFestivals.map((fest) => {
          const checks = stockCheckForFestival(fest, inventory, today);
          const reorderNeeded = checks.filter(
            (c) => c.status === 'reorder now' || c.status === 'reorder soon'
          );
          const festName = fest.name[lang] || fest.name.en;
          const tipText = fest.tip[lang] || fest.tip.en;
          const festDate = fest.date || (fest.dateRange ? fest.dateRange.start : '');
          const d = festDate ? new Date(`${festDate.slice(0, 10)}T00:00:00`) : new Date();
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const daysAwayNum = Math.max(
            0,
            Math.round((d.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
          );

          return (
            <div
              key={fest.id}
              onClick={onOpenCalendar}
              className="group cursor-pointer rounded-xl border border-white/80 bg-white/90 hover:bg-white p-3.5 transition-all hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                      {festName}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5">
                    {t.daysAway(daysAwayNum)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  💡 {tipText}
                </p>
              </div>

              {/* Stock check pill */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {reorderNeeded.length > 0 ? (
                  <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>
                      {reorderNeeded.length}{' '}
                      {lang === 'kn'
                        ? 'ವಸ್ತುಗಳಿಗೆ ರೀಆರ್ಡರ್ ಅಗತ್ಯವಿದೆ'
                        : lang === 'hi'
                        ? 'आइटम रीऑर्डर योग्य'
                        : 'items need reorder'}
                    </span>
                  </span>
                ) : checks.length > 0 ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {lang === 'kn' ? 'ದಾಸ್ತಾನು ಸಿದ್ಧವಾಗಿದೆ' : lang === 'hi' ? 'स्टॉक पर्याप्त है' : 'Stock ready'}
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    {lang === 'kn' ? 'ಸಾಮಗ್ರಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' : lang === 'hi' ? 'स्टॉक चेक करें' : 'Review demand items'}
                  </span>
                )}

                <span className="text-purple-600 text-[11px] font-semibold group-hover:underline">
                  {lang === 'kn' ? 'ವಿವರಗಳು' : lang === 'hi' ? 'विवरण' : 'Details'} &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
