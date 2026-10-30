'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ProductPerformance } from '@/lib/types';
import { formatINR, formatNumber } from '@/lib/analytics';
import { IndianRupee, Layers } from 'lucide-react';

interface ProductPerformanceChartProps {
  products: ProductPerformance[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ProductPerformance }>;
}

export const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({ products }) => {
  const [metric, setMetric] = useState<'revenue' | 'units'>('revenue');

  // Show top 6 items for clean visualization
  const topProducts = [...products]
    .sort((a, b) => (metric === 'revenue' ? b.revenue - a.revenue : b.unitsSold - a.unitsSold))
    .slice(0, 6);

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload as ProductPerformance;
      return (
        <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg text-xs">
          <p className="font-bold text-slate-900">{p.productName}</p>
          <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 mb-2">
            {p.category}
          </span>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Revenue:</span>
              <span className="font-bold text-emerald-700">{formatINR(p.revenue)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Units Sold:</span>
              <span className="font-semibold text-slate-800">{formatNumber(p.unitsSold)} units</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Revenue Share:</span>
              <span className="font-semibold text-slate-800">{p.shareOfRevenue}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Top Product Contribution</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify the primary contributors driving store volume & turnover
          </p>
        </div>

        {/* Metric Toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 self-start sm:self-auto">
          <button
            onClick={() => setMetric('revenue')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              metric === 'revenue'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <IndianRupee className="h-3 w-3" />
            Revenue
          </button>
          <button
            onClick={() => setMetric('units')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              metric === 'units'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-3 w-3" />
            Units Sold
          </button>
        </div>
      </div>

      <div className="mt-4 h-[280px] w-full">
        {topProducts.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No product data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tickFormatter={(v) => (metric === 'revenue' ? `₹${(v / 1000).toFixed(0)}k` : `${v}`)}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="productName"
                tickFormatter={(v) => (v.length > 14 ? `${v.slice(0, 14)}…` : v)}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={metric === 'revenue' ? 'revenue' : 'unitsSold'}
                radius={[0, 6, 6, 0]}
              >
                {topProducts.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#059669' : index === 1 ? '#10b981' : '#34d399'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>Click or hover bars to inspect revenue breakdown</span>
        <span className="font-semibold text-emerald-700">Top 6 Leaders</span>
      </div>
    </div>
  );
};
