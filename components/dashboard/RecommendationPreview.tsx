'use client';

import React from 'react';
import { AIRecommendation, ActiveTab } from '@/lib/types';
import { Sparkles, ArrowRight, AlertCircle, TrendingDown, PackageOpen } from 'lucide-react';

interface RecommendationPreviewProps {
  recommendations: AIRecommendation[];
  onNavigate: (tab: ActiveTab, productId?: string) => void;
}

export const RecommendationPreview: React.FC<RecommendationPreviewProps> = ({
  recommendations,
  onNavigate,
}) => {
  const top3 = recommendations.slice(0, 3);

  const getCategoryIcon = (category: AIRecommendation['category']) => {
    switch (category) {
      case 'Stockout Prevention':
        return AlertCircle;
      case 'Sales Decline Investigation':
        return TrendingDown;
      case 'Dead Stock Reduction':
        return PackageOpen;
      default:
        return Sparkles;
    }
  };

  const getPriorityStyle = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">AI Recommendations Preview</h3>
            <p className="text-xs text-slate-500">Top prioritized actions suggested by BizCopilot</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('recommendations')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <span>View All ({recommendations.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {top3.map((rec) => {
          const Icon = getCategoryIcon(rec.category);

          return (
            <div
              key={rec.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 p-3.5 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                    <span
                      className={`rounded-full border px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(
                        rec.priority
                      )}`}
                    >
                      {rec.priority}
                    </span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                      {rec.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-1">{rec.reason}</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate(rec.targetSection, rec.productId)}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-emerald-300 hover:text-emerald-800 transition-all self-end sm:self-auto"
              >
                <span>View Details</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
