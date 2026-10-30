'use client';

import React, { useState } from 'react';
import {
  DailySalesTrend,
  ProductPerformance,
  PeriodSummary,
  ActiveTab,
  ABCClass,
} from '@/lib/types';
import { formatINR, formatNumber } from '@/lib/analytics';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import {
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SalesViewProps {
  salesTrend: DailySalesTrend[];
  productPerformance: ProductPerformance[];
  summary: PeriodSummary;
  periodDays: number;
  setPeriodDays: (d: number) => void;
  onNavigate: (tab: ActiveTab, productId?: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  salesTrend,
  productPerformance,
  summary,
  periodDays,
  setPeriodDays,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [abcFilter, setAbcFilter] = useState<'All' | ABCClass>('All');

  const categories = ['All', ...Array.from(new Set(productPerformance.map((p) => p.category)))];

  const filteredProducts = productPerformance.filter((p) => {
    const matchSearch =
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.productId.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchABC = abcFilter === 'All' || p.abcClass === abcFilter;
    return matchSearch && matchCategory && matchABC;
  });

  // Identify products with severe sales drop (<= -20%)
  const dropProducts = productPerformance.filter(
    (p) => p.changePct !== undefined && p.changePct <= -20 && p.baselineUnits && p.baselineUnits > 15
  );

  return (
    <div className="space-y-6">
      {/* Header Banner & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sales Intelligence & Period Trends</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparing current sales ({summary.startDate} to {summary.endDate}) with the preceding {periodDays}-day baseline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Analysis Window:</span>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setPeriodDays(d)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  periodDays === d
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Sales ({periodDays}D)
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{formatINR(summary.totalRevenue)}</span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                summary.revenueChangePct >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {summary.revenueChangePct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {summary.revenueChangePct > 0 ? `+${summary.revenueChangePct}%` : `${summary.revenueChangePct}%`}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            vs {formatINR(summary.prevPeriodRevenue)} in prior {periodDays} days
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Items Sold ({periodDays}D)
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{formatNumber(summary.totalUnitsSold)}</span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                summary.unitsChangePct >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {summary.unitsChangePct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {summary.unitsChangePct > 0 ? `+${summary.unitsChangePct}%` : `${summary.unitsChangePct}%`}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            vs {formatNumber(summary.prevPeriodUnitsSold)} items in prior {periodDays} days
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Daily Sales
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {formatINR(Math.round(summary.totalRevenue / Math.max(1, periodDays)))}
            </span>
            <span className="text-xs font-medium text-slate-500">per day</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Across {productPerformance.length} inventory products
          </p>
        </div>
      </div>

      {/* Transparent Sales Drop Diagnosis Banner */}
      {dropProducts.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/50 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-rose-950">
                  Sales have dropped more than usual:{' '}
                  {dropProducts.map((p) => p.productName).join(', ')}
                </h3>
                <span className="rounded-full bg-rose-200 border border-rose-300 px-2.5 py-0.5 text-[11px] font-bold text-rose-900">
                  Calculated from Real Sales Records
                </span>
              </div>

              {dropProducts.map((p) => {
                const currentDaily = (p.unitsSold / periodDays).toFixed(1);
                const baselineDaily = (p.baselineUnits! / periodDays).toFixed(1);

                return (
                  <div key={p.productId} className="mt-3 space-y-2 text-xs text-rose-950">
                    <p className="font-medium text-sm">
                      <strong>{p.productName}</strong> sales have dropped from{' '}
                      <span className="underline decoration-rose-500 font-bold">{baselineDaily} packets/day</span> ({p.baselineUnits} total) down to{' '}
                      <span className="underline decoration-rose-500 font-bold">{currentDaily} packets/day</span> ({p.unitsSold} total) compared with the baseline period (a{' '}
                      <strong>{Math.abs(p.changePct!)}% drop</strong>).
                    </p>

                    <div className="rounded-xl bg-white border border-rose-200 p-3 space-y-1.5 text-slate-700">
                      <p className="font-bold text-slate-900 text-xs">
                        🔍 Recommended Investigation (Sales data alone cannot confirm customer intent):
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-1">
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span><strong>Product Availability:</strong> Was stock temporarily missing from front shelves?</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span><strong>Pricing Changes:</strong> Were prices recently marked up or was MRP altered?</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span><strong>Competitor Promotions:</strong> Did a neighboring grocery shop run a biscuit discount?</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span><strong>Customer Demand:</strong> Check if batch expiry dates or pack sizes changed.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Charts: Revenue Trend & Daily Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesTrendChart data={salesTrend} periodDays={periodDays} />

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Units Sold</h3>
              <p className="text-xs text-slate-500">Total units purchased per calendar date</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              Volume
            </span>
          </div>

          <div className="mt-4 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  width={40}
                />
                <Tooltip
                  formatter={(val: unknown) => [`${val} units`, 'Volume']}
                  labelFormatter={(lbl: unknown) => `Date: ${String(lbl)}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="units" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-slate-400 pt-3 border-t border-slate-100">
            Volume spikes correlate with weekend grocery restocking cycles.
          </div>
        </div>
      </div>

      {/* Product-Level Sales Table with ABC Prioritization */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Product-Level Sales Breakdown</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                ABC Analysis Included
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Revenue, volume, and period-over-period comparison for every product in your store
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-hidden"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={abcFilter}
              onChange={(e) => setAbcFilter(e.target.value as 'All' | ABCClass)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="All">All ABC Ranks</option>
              <option value="A">Class A (Top Earners)</option>
              <option value="B">Class B (Steady Core)</option>
              <option value="C">Class C (Low Revenue)</option>
            </select>
          </div>
        </div>

        {/* ABC Legend Banner */}
        <div className="my-3 rounded-xl bg-slate-50 border border-slate-200/70 p-3 text-xs text-slate-600 flex flex-wrap gap-4 items-center">
          <span className="font-bold text-slate-800">ABC Priority Guide:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-md bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 text-[10px]">Class A</span>
            <span>Top ~70% revenue (Vital champions — never run out)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-md bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 text-[10px]">Class B</span>
            <span>Next ~20% revenue (Core steady sellers)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-md bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 text-[10px]">Class C</span>
            <span>Remaining ~10% revenue (Slow/niche items)</span>
          </span>
        </div>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-1">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-center">ABC Rank</th>
                <th className="pb-3 text-right">Units Sold</th>
                <th className="pb-3 text-right">Revenue</th>
                <th className="pb-3 text-right">Rev Share</th>
                <th className="pb-3 text-right">Trend vs Baseline</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.map((p) => {
                const isDrop = p.changePct !== undefined && p.changePct <= -20;
                const isGrow = p.changePct !== undefined && p.changePct > 5;

                return (
                  <tr key={p.productId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-1 font-semibold text-slate-900">
                      <div>{p.productName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{p.productId}</span>
                    </td>
                    <td className="py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        title={p.abcDescription}
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold cursor-help ${
                          p.abcClass === 'A'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : p.abcClass === 'B'
                            ? 'bg-teal-100 text-teal-800 border border-teal-300'
                            : 'bg-slate-200 text-slate-800 border border-slate-300'
                        }`}
                      >
                        Class {p.abcClass}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium">{formatNumber(p.unitsSold)}</td>
                    <td className="py-3 text-right font-bold text-slate-900">{formatINR(p.revenue)}</td>
                    <td className="py-3 text-right font-medium text-slate-600">{p.shareOfRevenue}%</td>
                    <td className="py-3 text-right font-semibold">
                      {p.changePct !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] ${
                            isDrop
                              ? 'bg-rose-100 text-rose-800'
                              : isGrow
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.changePct > 0 ? `+${p.changePct}%` : `${p.changePct}%`}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A (New)</span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-1">
                      <button
                        onClick={() => onNavigate('inventory', p.productId)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                      >
                        Check Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
