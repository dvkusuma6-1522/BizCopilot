'use client';

import React from 'react';
import { CalculatedInventoryItem, SalesRecord } from '@/lib/types';
import { CategoryConfig } from '@/lib/categories/types';
import { SupportedLanguage } from '@/lib/i18n';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { getFestivalMultiplier } from '@/lib/engine';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface CategoryKpiSectionProps {
  category: CategoryConfig;
  inventory: CalculatedInventoryItem[];
  sales: SalesRecord[];
  periodDays: number;
  lang?: SupportedLanguage;
}

export const CategoryKpiSection: React.FC<CategoryKpiSectionProps> = ({
  category,
  inventory,
  sales,
  periodDays,
  lang = 'en',
}) => {
  // Check seasonality for the current date
  const now = new Date();
  const nowStr = now.toISOString().slice(0, 10);
  const seasonality = getFestivalMultiplier(category.id, nowStr);

  const getStatusColor = (status?: 'optimal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return {
          border: 'border-rose-200',
          bg: 'bg-rose-50/70',
          text: 'text-rose-900',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50/70',
          text: 'text-amber-900',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: AlertTriangle,
        };
      case 'optimal':
      default:
        return {
          border: 'border-emerald-200',
          bg: 'bg-emerald-50/60',
          text: 'text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
            <CategoryIcon iconName={category.icon} className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {category.labels[lang] || category.labels.en} Domain KPIs & Intelligence
              </h3>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                Analyst Mode
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Deterministic key performance metrics specifically tailored for{' '}
              {category.labels.en.toLowerCase()} business models
            </p>
          </div>
        </div>

        {/* Seasonality Pill */}
        {seasonality.festivalName && (
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            <span>
              {seasonality.festivalName}:{' '}
              <strong className="text-amber-950">{seasonality.multiplier}x</strong> demand factor
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.kpis.map((kpi) => {
          let computed: {
            value: string;
            numericValue?: number;
            sublabel?: string;
            status?: 'optimal' | 'warning' | 'critical';
          } = {
            value: '—',
            status: 'optimal',
          };

          try {
            computed = kpi.compute({ inventory, sales, periodDays, now });
          } catch (e) {
            console.warn(`Error computing KPI ${kpi.id}:`, e);
          }

          const style = getStatusColor(computed.status);
          const StatusIcon = style.icon;

          return (
            <div
              key={kpi.id}
              className={`rounded-2xl border p-4.5 transition-all ${style.border} ${style.bg} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    {kpi.label[lang] || kpi.label.en}
                  </span>
                  <div
                    className="group relative cursor-help text-slate-400 hover:text-slate-600"
                    title={kpi.tooltip[lang] || kpi.tooltip.en}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="text-2xl font-black tracking-tight text-slate-900 my-1">
                  {computed.value}
                </div>

                {computed.sublabel && (
                  <p className="text-xs text-slate-500 font-medium">
                    {computed.sublabel}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Domain Benchmark</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${style.badge}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  <span className="capitalize">{computed.status || 'Optimal'}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
