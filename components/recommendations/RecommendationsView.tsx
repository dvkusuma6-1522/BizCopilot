'use client';

import React, { useState } from 'react';
import { AIRecommendation, ActiveTab } from '@/lib/types';
import {
  Sparkles,
  AlertCircle,
  TrendingDown,
  PackageX,
  Boxes,
  ArrowRight,
  Filter,
  CheckCircle,
} from 'lucide-react';

interface RecommendationsViewProps {
  recommendations: AIRecommendation[];
  onNavigate: (tab: ActiveTab, productId?: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onNavigate,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = [
    'all',
    'Stockout Prevention',
    'Sales Decline Investigation',
    'Dead Stock Reduction',
    'Replenishment',
  ];

  const filtered = recommendations.filter((r) => {
    const matchPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchPriority && matchCat;
  });

  const getPriorityStyle = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          border: 'border-l-4 border-l-rose-500',
        };
      case 'medium':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          border: 'border-l-4 border-l-amber-500',
        };
      case 'low':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          border: 'border-l-4 border-l-blue-500',
        };
    }
  };

  const getCategoryIcon = (category: AIRecommendation['category']) => {
    switch (category) {
      case 'Stockout Prevention':
        return AlertCircle;
      case 'Sales Decline Investigation':
        return TrendingDown;
      case 'Dead Stock Reduction':
        return PackageX;
      case 'Replenishment':
        return Boxes;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Deterministic AI Recommendations</h2>
            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
              {recommendations.length} Actionable Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based prescriptive actions derived from customer velocity, inventory buffers, and distributor lead times
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Requires Business Owner Approval</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Priority:
          </span>
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                priorityFilter === p
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p} ({p === 'all' ? recommendations.length : recommendations.filter((r) => r.priority === p).length})
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No recommendations matching the selected filters.
          </div>
        ) : (
          filtered.map((rec) => {
            const Icon = getCategoryIcon(rec.category);
            const style = getPriorityStyle(rec.priority);

            return (
              <div
                key={rec.id}
                className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md ${style.border}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mt-0.5">
                      <Icon className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                        <span
                          className={`rounded-full border px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
                        >
                          {rec.priority} Priority
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.2 text-[10px] font-medium text-slate-600">
                          {rec.category}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600 font-medium leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(rec.targetSection, rec.productId)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold text-slate-800 shadow-xs hover:border-emerald-400 hover:text-emerald-800 hover:bg-emerald-50 transition-all self-end sm:self-auto"
                  >
                    <span>Inspect {rec.targetSection === 'sales' ? 'Sales' : 'Inventory'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Evidence Box */}
                <div className="mt-3.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 mb-1">Supporting Quantitative Facts:</div>
                  <div className="font-mono text-[11px] text-slate-600 bg-white rounded-lg p-2 border border-slate-200/60">
                    {rec.supportingEvidence}
                  </div>
                </div>

                {/* Next Action Box */}
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50/60 border border-emerald-200/60 p-3 text-xs text-emerald-950">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900">Recommended Next Step: </span>
                    <span>{rec.recommendedNextAction}</span>
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
