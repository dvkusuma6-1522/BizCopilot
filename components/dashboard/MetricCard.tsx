'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  changePct?: number;
  comparisonLabel?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  tooltip: string;
  isNeutralOrWarning?: boolean;
  statusBadge?: string;
  badgeColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  changePct,
  comparisonLabel,
  icon: Icon,
  iconColor,
  iconBg,
  tooltip,
  statusBadge,
  badgeColor,
}) => {
  const isPositive = changePct !== undefined && changePct > 0;
  const isNegative = changePct !== undefined && changePct < 0;
  const isZero = changePct !== undefined && changePct === 0;

  return (
    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300/80">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            <div className="group relative cursor-pointer">
              <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-48 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {tooltip}
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor} shadow-xs`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        {changePct !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold text-[11px] ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : isNegative
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {isZero && <Minus className="h-3 w-3" />}
              {changePct > 0 ? `+${changePct}%` : `${changePct}%`}
            </span>
            <span className="text-slate-400 font-medium truncate">{comparisonLabel || 'vs previous period'}</span>
          </div>
        ) : statusBadge ? (
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${badgeColor || 'bg-slate-100 text-slate-700'}`}>
            {statusBadge}
          </span>
        ) : (
          <span className="text-slate-400 font-medium">Calculated from period</span>
        )}
      </div>
    </div>
  );
};
