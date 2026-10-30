'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DailySalesTrend } from '@/lib/types';
import { formatINR } from '@/lib/analytics';
import { TrendingDown, Calendar } from 'lucide-react';

interface SalesTrendChartProps {
  data: DailySalesTrend[];
  periodDays: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailySalesTrend }>;
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: DailySalesTrend;
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, periodDays }) => {
  const hasDrop = data.some((d) => d.isDrop);

  const formatYAxis = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as DailySalesTrend;
      return (
        <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg text-xs">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            {point.displayDate} ({point.date})
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Revenue:</span>
              <span className="font-bold text-emerald-700">{formatINR(point.revenue)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Units Sold:</span>
              <span className="font-semibold text-slate-800">{point.units} units</span>
            </div>
            {point.isDrop && (
              <div className="mt-1 pt-1 border-t border-rose-100 flex items-center gap-1 text-[11px] font-medium text-rose-600">
                <TrendingDown className="h-3 w-3" />
                <span>Steep sales dip below baseline average</span>
              </div>
            )}
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
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Daily Revenue Trend</h3>
            <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              Last {periodDays} Days
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily store turnover calculated across all 12 tracked grocery product lines
          </p>
        </div>

        {hasDrop && (
          <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200/70 px-2.5 py-1 text-xs text-rose-700 font-medium self-start sm:self-auto">
            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
            <span>Sales dip flagged vs 7-day average</span>
          </div>
        )}
      </div>

      <div className="mt-4 h-[280px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No sales records available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
                dy={8}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#emeraldGradient)"
                dot={(props: DotProps) => {
                  const isDrop = props.payload?.isDrop;
                  if (isDrop) {
                    return (
                      <circle
                        key={`dot-${props.cx}-${props.cy}`}
                        cx={props.cx}
                        cy={props.cy}
                        r={4.5}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return (
                    <circle
                      key={`dot-${props.cx}-${props.cy}`}
                      cx={props.cx}
                      cy={props.cy}
                      r={3}
                      fill="#059669"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  );
                }}
                activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>Hover data points to inspect daily revenue and units sold.</span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
          Red marker indicates anomalous decline
        </span>
      </div>
    </div>
  );
};
