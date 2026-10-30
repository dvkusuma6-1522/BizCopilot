'use client';

import React, { useState, useMemo } from 'react';
import { CalculatedInventoryItem } from '@/lib/types';
import { formatINR } from '@/lib/analytics';
import {
  generateDemandForecast,
  projectStockDepletion,
  calculateReorderQuantity,
  DailySalesPoint,
} from '@/lib/engine';
import { SupportedLanguage, translations } from '@/lib/i18n';
import { CategoryConfig } from '@/lib/categories/types';
import {
  X,
  Sliders,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  HelpCircle,
  Truck,
  TrendingDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface InventoryDrawerProps {
  product: CalculatedInventoryItem | null;
  onClose: () => void;
  salesHistory?: DailySalesPoint[];
  lang?: SupportedLanguage;
  storeName?: string;
  category?: CategoryConfig;
}

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  product,
  onClose,
  salesHistory = [],
  lang = 'en',
  storeName = 'FreshMart Grocery',
  category,
}) => {
  const t = translations[lang] || translations.en;

  // Simulator state: allow owner to test "What-if delivery takes X days?" or "What if I order Y units?"
  const initialLead = product?.supplierLeadDays ?? 3;
  const initialOrder = product?.recommendedReorderQty ?? 30;

  const [leadDays, setLeadDays] = useState<number>(initialLead);
  const [orderQty, setOrderQty] = useState<number>(initialOrder);

  // Sync state if product changes
  React.useEffect(() => {
    if (product) {
      setLeadDays(product.supplierLeadDays || 3);
      setOrderQty(product.recommendedReorderQty || 30);
    }
  }, [product]);

  // Generate synthetic daily history if none provided to ensure live chart always works
  const activeHistory: DailySalesPoint[] = useMemo(() => {
    if (salesHistory && salesHistory.length >= 7) return salesHistory;
    const velocity = product?.avgDailySales || 2.5;
    const pts: DailySalesPoint[] = [];
    const today = new Date();
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const noise = (Math.sin(i) * 0.4 + 1) * (isWeekend ? 1.3 : 0.9);
      pts.push({
        date: d.toISOString().slice(0, 10),
        unitsSold: Number(Math.max(0, velocity * noise).toFixed(1)),
      });
    }
    return pts;
  }, [salesHistory, product]);

  // Compute forecast for next 14 days
  const { forecast } = useMemo(() => {
    return generateDemandForecast(activeHistory, 14);
  }, [activeHistory]);

  // Project stock depletion curve with interactive "what-if" parameters
  const projection = useMemo(() => {
    if (!product) {
      return { daysUntilStockout: null, daysWithoutStock: 0, depletionCurve: [] };
    }
    return projectStockDepletion(product.stockOnHand, forecast, leadDays, orderQty);
  }, [product, forecast, leadDays, orderQty]);

  // Dynamic live reorder calculation based on simulated lead time
  const liveReorderQty = useMemo(() => {
    if (!product) return 0;
    return calculateReorderQuantity(product.avgDailySales, product.stockOnHand, leadDays, 7);
  }, [product, leadDays]);

  if (!product) return null;

  // Format WhatsApp order message
  const whatsappMsg = category?.whatsappTemplates?.order
    ? category.whatsappTemplates.order(
        storeName,
        product.productName,
        orderQty,
        product.attributes,
        lang
      )
    : t.whatsappOrderMessage(storeName, product.productName, orderQty);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">{product.productName}</h2>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    product.abcClass === 'A'
                      ? 'bg-emerald-100 text-emerald-800'
                      : product.abcClass === 'B'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Class {product.abcClass || 'B'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {product.productId} • {product.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Key Facts Summary */}
          <div
            className={`rounded-2xl border p-4 ${
              product.isStockoutRisk
                ? 'border-rose-200 bg-rose-50/70 text-rose-950'
                : product.isDeadStock
                ? 'border-amber-200 bg-amber-50/70 text-amber-950'
                : 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {product.isStockoutRisk ? (
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h3 className="text-sm font-bold">
                  {product.isStockoutRisk
                    ? '⚠️ Stock may run out before next delivery arrives!'
                    : product.isDeadStock
                    ? '📦 Money tied up in slow-moving stock'
                    : '✅ Healthy stock cover'}
                </h3>
                <p className="text-xs leading-relaxed opacity-90">{product.friendlyStatusText}</p>
                <div className="pt-2 text-xs font-semibold">
                  <span>Action Needed: </span>
                  <span className="font-bold underline">{product.suggestedAction}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Numbers Tile */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Stock on Shelf</span>
              <span className="text-lg font-bold text-slate-900">{product.stockOnHand}</span>
              <span className="text-[10px] text-slate-400 block">units</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Daily Demand</span>
              <span className="text-lg font-bold text-emerald-700">~{product.avgDailySales}</span>
              <span className="text-[10px] text-slate-400 block">units / day</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Stock Cover</span>
              <span
                className={`text-lg font-bold ${
                  product.isStockoutRisk ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {product.daysOfCover >= 900 ? '0 sales' : `${product.daysOfCover}d`}
              </span>
              <span className="text-[10px] text-slate-400 block">remaining</span>
            </div>
          </div>

          {/* Category Attributes (if present) */}
          {category && category.productFields.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {category.labels[lang] || category.labels.en} Domain Specifications
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {category.productFields.map((f) => {
                  const rawVal = product.attributes?.[f.key];
                  const valStr =
                    rawVal !== undefined && rawVal !== ''
                      ? f.format
                        ? f.format(rawVal)
                        : String(rawVal)
                      : '—';
                  return (
                    <div
                      key={f.key}
                      className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-xs"
                    >
                      <span className="text-[10px] text-slate-400 block truncate">
                        {f.label[lang] || f.label.en}
                      </span>
                      <span className="font-bold text-slate-800 font-mono block mt-0.5 truncate">
                        {valStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive What-If Simulator Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Interactive &quot;What-If&quot; Depletion Simulator
                </h3>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                Live Model
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Adjust supplier delivery lead time and order quantity to see how stock depletion and
              zero-stock days change live on the chart.
            </p>

            {/* Slider 1: Lead Days */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Supplier Delivery Time:
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {leadDays} {leadDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={14}
                step={1}
                value={leadDays}
                onChange={(e) => setLeadDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 day (local rush)</span>
                <span>Default: {product.supplierLeadDays}d</span>
                <span>14 days</span>
              </div>
            </div>

            {/* Slider 2: Order Quantity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-slate-400" /> Simulated Order Quantity:
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {orderQty} units
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={5}
                value={orderQty}
                onChange={(e) => setOrderQty(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 units (no reorder)</span>
                <span>Suggested: {liveReorderQty} units</span>
                <span>120 units</span>
              </div>
            </div>

            {/* Chart: Projected Stock Depletion Curve */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-slate-500" />
                  14-Day Stock Depletion Curve
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Projected Stock
                  </span>
                  {projection.daysWithoutStock > 0 && (
                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      {projection.daysWithoutStock} Empty Days
                    </span>
                  )}
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={projection.depletionCurve}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="stockFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => {
                        const d = new Date(val + 'T00:00:00');
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-lg">
                              <p className="font-semibold text-slate-900">{data.date}</p>
                              <p className="text-emerald-700 font-bold">
                                Projected Stock: {data.projectedStock} units
                              </p>
                              {data.isDeliveryDay && (
                                <p className="text-emerald-600 font-medium">
                                  🚚 Delivery arrives (+{orderQty} units)
                                </p>
                              )}
                              {data.isStockout && (
                                <p className="text-rose-600 font-bold">⚠️ Out of Stock (0 units)</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="projectedStock"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#stockFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Simulation Result Badge */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
                <div>
                  <span className="text-slate-500">Depletion Result: </span>
                  {projection.daysWithoutStock > 0 ? (
                    <strong className="text-rose-700 font-bold">
                      Stock hits zero in {projection.daysUntilStockout} days ({projection.daysWithoutStock} days empty)
                    </strong>
                  ) : (
                    <strong className="text-emerald-700 font-bold">
                      Zero stockout days! Full shelf coverage maintained.
                    </strong>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formula Transparency Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
              {t.btnHowCalculated}
            </h4>
            <div className="text-xs text-slate-700 space-y-1.5 font-mono bg-white p-3 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-sans font-semibold text-[11px]">
                Reorder Formula: max(0, ceil(Velocity × (Lead Days + Buffer Days) - Stock on Hand))
              </div>
              <div className="text-emerald-800 font-bold">
                max(0, ceil({product.avgDailySales} × ({leadDays} + 7) - {product.stockOnHand})) ={' '}
                <span className="underline">{liveReorderQty} units</span>
              </div>
            </div>
          </div>

          {/* Unit Economics Card */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 p-3 bg-white">
              <span className="text-slate-500 block text-[11px] uppercase font-semibold">Unit Margins</span>
              <div className="mt-1 font-medium">Selling: {formatINR(product.retailPrice)}</div>
              <div className="text-slate-600">Wholesale: {formatINR(product.unitCost)}</div>
              <div className="text-emerald-700 font-bold">
                Profit: {formatINR(product.retailPrice - product.unitCost)} / unit
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 bg-white">
              <span className="text-slate-500 block text-[11px] uppercase font-semibold">Reorder Value</span>
              <div className="mt-1 font-medium">Qty: {orderQty} units</div>
              <div className="text-slate-600">Total Cost: {formatINR(orderQty * product.unitCost)}</div>
              <div className="text-emerald-700 font-bold">
                Retail Revenue: {formatINR(orderQty * product.retailPrice)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-md flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            {t.btnClose}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{t.btnWhatsApp} ({orderQty} units)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
