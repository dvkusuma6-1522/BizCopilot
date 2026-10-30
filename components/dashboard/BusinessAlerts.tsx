'use client';

import React from 'react';
import { BusinessAlert, ActiveTab } from '@/lib/types';
import { AlertCircle, AlertTriangle, ArrowRight, TrendingDown, PackageX, Boxes } from 'lucide-react';

interface BusinessAlertsProps {
  alerts: BusinessAlert[];
  onNavigate: (tab: ActiveTab, productId?: string) => void;
}

export const BusinessAlerts: React.FC<BusinessAlertsProps> = ({ alerts, onNavigate }) => {
  const getIcon = (type: BusinessAlert['type']) => {
    switch (type) {
      case 'sales_decline':
        return TrendingDown;
      case 'stockout_risk':
        return AlertCircle;
      case 'dead_stock':
        return PackageX;
      case 'reorder_needed':
        return Boxes;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityStyle = (severity: BusinessAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'border-rose-200 bg-rose-50/40 hover:bg-rose-50/70',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          iconBg: 'bg-rose-100 text-rose-600',
          button: 'text-rose-700 hover:text-rose-900',
        };
      case 'warning':
        return {
          container: 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          iconBg: 'bg-amber-100 text-amber-600',
          button: 'text-amber-700 hover:text-amber-900',
        };
      default:
        return {
          container: 'border-slate-200 bg-slate-50/50 hover:bg-slate-50',
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          iconBg: 'bg-slate-100 text-slate-600',
          button: 'text-slate-700 hover:text-slate-900',
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Critical Business Alerts</h3>
            <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 text-[11px] font-bold">
              {alerts.length} Actionable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated warnings computed from demand velocity and supplier constraints
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {alerts.map((alert) => {
          const Icon = getIcon(alert.type);
          const styles = getSeverityStyle(alert.severity);

          return (
            <div
              key={alert.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all shadow-xs ${styles.container}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.iconBg}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                      <p className="text-xs font-semibold text-slate-700">{alert.productName}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <div className="mt-3 rounded-lg bg-white/80 p-2.5 text-xs text-slate-600 border border-slate-100/80">
                  <span className="font-semibold text-slate-800">Evidence: </span>
                  {alert.supportingData}
                </div>

                <p className="mt-2 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Recommended Action: </span>
                  {alert.recommendedAction}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200/50 flex justify-end">
                <button
                  onClick={() => onNavigate(alert.targetSection, alert.productId)}
                  className={`inline-flex items-center gap-1 text-xs font-bold transition-colors ${styles.button}`}
                >
                  <span>Resolve in {alert.targetSection === 'sales' ? 'Sales' : 'Inventory'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
