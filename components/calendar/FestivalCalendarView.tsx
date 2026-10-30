'use client';

import React, { useState, useMemo } from 'react';
import { Festival, FESTIVALS_DATA, FestivalType } from '@/lib/festivals/data';
import {
  stockCheckForFestival,
  getFestivalEffectiveDate,
  FestivalProductStockCheck,
} from '@/lib/engine/festivals';
import { CalculatedInventoryItem } from '@/lib/types';
import { SupportedLanguage, translations } from '@/lib/i18n';
import { CategoryConfig } from '@/lib/categories/types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MessageSquare,
  X,
  ExternalLink,
} from 'lucide-react';

interface FestivalCalendarViewProps {
  inventory: CalculatedInventoryItem[];
  category?: CategoryConfig;
  lang: SupportedLanguage;
  storeName: string;
  onNavigateToProduct?: (productId: string) => void;
}

export const FestivalCalendarView: React.FC<FestivalCalendarViewProps> = ({
  inventory,
  category,
  lang,
  storeName,
  onNavigateToProduct,
}) => {
  const t = translations[lang] || translations.en;
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [filterMode, setFilterMode] = useState<'category' | 'all'>('category');

  const monthNames = useMemo(
    () => [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    []
  );

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter festivals
  const filteredFestivals = useMemo(() => {
    return FESTIVALS_DATA.filter((fest) => {
      if (filterMode === 'all' || !category) return true;
      if (fest.categories === 'all') return true;
      return fest.categories.includes(category.id);
    });
  }, [filterMode, category]);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix for current month
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      festivals: Festival[];
    }[] = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        festivals: [],
      });
    }

    // Days in current month
    const todayStr = today.toISOString().slice(0, 10);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;

      // Match festivals for this day
      const dayFestivals = filteredFestivals.filter((f) => {
        if (f.date) {
          return f.date === dateStr;
        }
        if (f.dateRange) {
          return dateStr >= f.dateRange.start && dateStr <= f.dateRange.end;
        }
        return false;
      });

      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday,
        festivals: dayFestivals,
      });
    }

    // Trailing days for next month to fill grid
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        festivals: [],
      });
    }

    return cells;
  }, [currentYear, currentMonth, today, filteredFestivals]);

  const getDotColor = (type: FestivalType) => {
    switch (type) {
      case 'festival':
        return 'bg-purple-600';
      case 'season':
        return 'bg-emerald-600';
      case 'peak':
        return 'bg-amber-500';
    }
  };

  // Stock check for selected festival
  const selectedStockCheck = useMemo(() => {
    if (!selectedFestival) return [];
    return stockCheckForFestival(selectedFestival, inventory, today);
  }, [selectedFestival, inventory, today]);

  const handleOrderWhatsApp = (check: FestivalProductStockCheck) => {
    const qty = check.recommendedOrderQty || 15;
    const msg = encodeURIComponent(
      t.whatsappOrderMessage(storeName, check.productName, qty)
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                {t.calendarTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.calendarSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setFilterMode('category')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterMode === 'category'
                  ? 'bg-white text-purple-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {category?.labels[lang] || category?.labels.en || 'My Category'}
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-purple-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.calendarFilterAll}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation & Month Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <span className="rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5">
              {filteredFestivals.filter((f) => {
                const d = getFestivalEffectiveDate(f);
                return (
                  d.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`) ||
                  (f.dateRange &&
                    f.dateRange.start <= `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31` &&
                    f.dateRange.end >= `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)
                );
              }).length}{' '}
              {lang === 'kn' ? 'ಘಟನೆಗಳು' : lang === 'hi' ? 'अवसर' : 'Events'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setCurrentYear(today.getFullYear());
                setCurrentMonth(today.getMonth());
              }}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {lang === 'kn' ? 'ಈ ತಿಂಗಳು' : lang === 'hi' ? 'वर्तमान माह' : 'Today'}
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="my-3 flex items-center gap-4 text-xs font-medium text-slate-500 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
            <span>{lang === 'kn' ? 'ಹಬ್ಬಗಳು' : lang === 'hi' ? 'त्यौहार' : 'Festival'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span>{lang === 'kn' ? 'ಸೀಸನ್ ಮತ್ತು ಶಾಲೆ' : lang === 'hi' ? 'सीजन व स्कूल' : 'Season'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>{lang === 'kn' ? 'ಪೀಕ್ ಬೇಸಿಗೆ' : lang === 'hi' ? 'पीक मांग' : 'Peak Demand'}</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Day of Week Headers */}
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              {day}
            </div>
          ))}

          {/* Calendar Day Cells */}
          {calendarCells.map((cell, idx) => {
            const hasFestivals = cell.festivals.length > 0;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (hasFestivals) {
                    setSelectedFestival(cell.festivals[0]);
                  }
                }}
                className={`min-h-16 sm:min-h-20 rounded-2xl p-2 transition-all flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'opacity-30 bg-slate-50/50'
                    : cell.isToday
                    ? 'border-2 border-purple-600 bg-purple-50/40 shadow-xs'
                    : hasFestivals
                    ? 'border border-purple-200 bg-purple-50/20 hover:bg-purple-100/40 cursor-pointer shadow-xs hover:scale-[1.02]'
                    : 'border border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      cell.isToday
                        ? 'bg-purple-600 text-white'
                        : hasFestivals
                        ? 'text-purple-950 font-black'
                        : 'text-slate-700'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Colored dots */}
                  {hasFestivals && (
                    <div className="flex items-center gap-1">
                      {cell.festivals.slice(0, 3).map((f) => (
                        <span
                          key={f.id}
                          className={`h-2 w-2 rounded-full ${getDotColor(f.type)}`}
                          title={f.name[lang] || f.name.en}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Festival labels preview on desktop */}
                {hasFestivals && (
                  <div className="mt-1 space-y-0.5 hidden sm:block">
                    {cell.festivals.slice(0, 2).map((f) => (
                      <p
                        key={f.id}
                        className="truncate text-[10px] font-bold text-purple-900 bg-white/90 px-1 py-0.5 rounded shadow-2xs"
                      >
                        {f.name[lang] || f.name.en}
                      </p>
                    ))}
                    {cell.festivals.length > 2 && (
                      <p className="text-[9px] font-bold text-purple-700">
                        +{cell.festivals.length - 2} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day / Festival Details Bottom Sheet Modal */}
      {selectedFestival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white ${getDotColor(
                      selectedFestival.type
                    )}`}
                  >
                    {selectedFestival.type}
                  </span>
                  <span className="rounded-full bg-purple-100 text-purple-900 px-2.5 py-0.5 text-xs font-bold">
                    {(() => {
                      const eff = getFestivalEffectiveDate(selectedFestival);
                      const d = new Date(`${eff.slice(0, 10)}T00:00:00`);
                      const diff = Math.max(
                        0,
                        Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      );
                      return t.daysAway(diff);
                    })()}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {selectedFestival.name[lang] || selectedFestival.name.en}
                </h3>
              </div>

              <button
                onClick={() => setSelectedFestival(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tip Banner */}
            <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50/60 p-4">
              <span className="text-xs font-black text-purple-900 uppercase tracking-wider">
                💡 {lang === 'kn' ? 'ವ್ಯಾಪಾರಿ ಸಲಹೆ' : lang === 'hi' ? 'व्यापारी सलाह' : 'Retailer Tip'}
              </span>
              <p className="text-xs text-purple-950 mt-1 leading-relaxed font-medium">
                {selectedFestival.tip[lang] || selectedFestival.tip.en}
              </p>
            </div>

            {/* Commonly in demand items */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {t.commonlyInDemandLabel}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(
                  selectedFestival.commonlyInDemand[lang] ||
                  selectedFestival.commonlyInDemand.en ||
                  []
                ).map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200/60"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Your Stock Check List */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-slate-900">
                  {t.stockCheckTitle}
                </h4>
                <span className="text-xs text-slate-500">
                  {selectedStockCheck.length}{' '}
                  {lang === 'kn' ? 'ಹೊಂದಾಣಿಕೆಯಾದ ವಸ್ತುಗಳು' : lang === 'hi' ? 'मिलते-जुलते सामान' : 'matching products'}
                </span>
              </div>

              {selectedStockCheck.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">
                  {lang === 'kn'
                    ? 'ಈ ಹಬ್ಬದ ಕೀವರ್ಡ್‌ಗಳಿಗೆ ನಿಮ್ಮ ಅಂಗಡಿಯ ದಾಸ್ತಾನಿನಲ್ಲಿ ಯಾವುದೇ ವಸ್ತುಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ.'
                    : lang === 'hi'
                    ? 'आपकी वर्तमान इन्वेंटरी में इस त्यौहार से संबंधित कोई कीवर्ड मैच नहीं हुआ।'
                    : 'No matching products found in your inventory for this festival’s keywords.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedStockCheck.map((check) => {
                    const isUrgent = check.status === 'reorder now';
                    const isWarning = check.status === 'reorder soon';

                    return (
                      <div
                        key={check.productId}
                        className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isUrgent
                            ? 'border-rose-200 bg-rose-50/50'
                            : isWarning
                            ? 'border-amber-200 bg-amber-50/40'
                            : 'border-slate-200 bg-slate-50/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-900">
                              {check.productName}
                            </h5>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-800'
                                  : isWarning
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {check.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            {lang === 'kn'
                              ? `ದಾಸ್ತಾನು: ${check.stockOnHand} | ದಿನದ ಮಾರಾಟ: ~${check.avgDailySales} | ದಾಸ್ತಾನು ಉಳಿಕೆ: ~${check.daysOfCover} ದಿನ`
                              : lang === 'hi'
                              ? `स्टॉक: ${check.stockOnHand} | दैनिक बिक्री: ~${check.avgDailySales} | स्टॉक बचा: ~${check.daysOfCover} दिन`
                              : `Stock: ${check.stockOnHand} | Daily sales: ~${check.avgDailySales} | Cover: ~${check.daysOfCover}d`}
                          </p>
                        </div>

                        {/* Order on WhatsApp */}
                        <div className="flex items-center gap-2 shrink-0">
                          {(isUrgent || isWarning) && (
                            <button
                              onClick={() => handleOrderWhatsApp(check)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs active:scale-95 transition-all"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{t.btnWhatsApp}</span>
                            </button>
                          )}

                          {onNavigateToProduct && (
                            <button
                              onClick={() => {
                                setSelectedFestival(null);
                                onNavigateToProduct(check.productId);
                              }}
                              className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
                              title={t.btnInspect}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedFestival(null)}
                className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition-colors"
              >
                {t.btnClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
