'use client';

import React from 'react';
import { PeriodSummary } from '@/lib/types';
import { formatINR } from '@/lib/analytics';
import { Activity } from 'lucide-react';

interface HealthSummaryCardProps {
  summary: PeriodSummary;
}

export const HealthSummaryCard: React.FC<HealthSummaryCardProps> = ({ summary }) => {
  const getSalesBadge = (health: PeriodSummary['salesHealth']) => {
    switch (health) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Good':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Needs Attention':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const getInventoryBadge = (health: PeriodSummary['inventoryHealth']) => {
    switch (health) {
      case 'Optimal':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Balanced':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'High Risk':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Overstocked':
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Business Health Summary</h3>
            <p className="text-xs text-slate-500">Real-time composite health scorecard</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
          Deterministic Scorecard
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Sales Health */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sales Health
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getSalesBadge(
                summary.salesHealth
              )}`}
            >
              {summary.salesHealth}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-700 font-medium leading-relaxed">
            {summary.salesHealthReason}
          </p>
        </div>

        {/* Inventory Health */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inventory Health
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getInventoryBadge(
                summary.inventoryHealth
              )}`}
            >
              {summary.inventoryHealth}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-700 font-medium leading-relaxed">
            {summary.inventoryHealthReason}
          </p>
        </div>

        {/* Stockout Exposure */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stockout Exposure
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                summary.stockoutRiskCount > 0
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {summary.stockoutRiskCount} Product{summary.stockoutRiskCount === 1 ? '' : 's'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-700 font-medium leading-relaxed">
            {summary.stockoutRiskCount > 0
              ? 'Stock cover is insufficient to survive supplier delivery delay.'
              : 'All products currently meet lead-time safety cover.'}
          </p>
        </div>

        {/* Dead Stock Exposure */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dead Stock Value
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                summary.deadStockTotalCost > 0
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {formatINR(summary.deadStockTotalCost)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-700 font-medium leading-relaxed">
            {summary.deadStockCount > 0
              ? `${summary.deadStockCount} SKU(s) with minimal movement locking working capital.`
              : 'Zero stagnant inventory lines detected in selected timeframe.'}
          </p>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 italic">
        * Health metrics are calculated deterministically from active sales and inventory parameters, not financial credit ratings.
      </div>
    </div>
  );
};
