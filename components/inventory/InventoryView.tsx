'use client';

import React, { useState } from 'react';
import { CalculatedInventoryItem, InventoryStatus, ActiveTab, ABCClass } from '@/lib/types';
import { formatINR, formatNumber } from '@/lib/analytics';
import {
  Search,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  X,
  HelpCircle,
  PackageX,
} from 'lucide-react';

interface InventoryViewProps {
  inventory: CalculatedInventoryItem[];
  periodDays: number;
  highlightProductId?: string;
  onNavigate: (tab: ActiveTab, productId?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  periodDays,
  highlightProductId,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InventoryStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [abcFilter, setAbcFilter] = useState<'All' | ABCClass>('All');
  const [selectedProduct, setSelectedProduct] = useState<CalculatedInventoryItem | null>(() => {
    if (highlightProductId) {
      return inventory.find((i) => i.productId === highlightProductId) || null;
    }
    return null;
  });

  const [sortField, setSortField] = useState<keyof CalculatedInventoryItem>('daysOfCover');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const categories = ['All', ...Array.from(new Set(inventory.map((i) => i.category)))];

  const handleSort = (field: keyof CalculatedInventoryItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredItems = inventory
    .filter((item) => {
      const matchSearch =
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.productId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchABC = abcFilter === 'All' || item.abcClass === abcFilter;
      return matchSearch && matchStatus && matchCategory && matchABC;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'critical':
        return {
          label: 'Critical Problem',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          label: 'Watch This Week',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: AlertTriangle,
        };
      case 'healthy':
        return {
          label: 'Healthy Stock',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
        };
    }
  };

  // Stockout risk items
  const stockoutItems = inventory.filter((i) => i.isStockoutRisk);
  // Dead stock items
  const deadStockItems = inventory.filter((i) => i.isDeadStock);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Inventory & Stock Cover Intelligence</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Days of stock remaining calculated using daily customer demand over the last {periodDays} days
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
            {stockoutItems.length} Urgent Stockout
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            {deadStockItems.length} Idle Dead Stock
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            {inventory.filter((i) => i.status === 'healthy').length} Healthy SKUs
          </div>
        </div>
      </div>

      {/* Prominent Stockout Countdown Warning */}
      {stockoutItems.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/60 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                Imminent Stockout Warning: Stock may run out before delivery!
              </h3>
              {stockoutItems.map((item) => (
                <p key={item.productId} className="mt-1 text-xs text-rose-900 font-medium">
                  • <strong>{item.productName}:</strong> Approximately <strong>{item.daysOfCover} days of stock left</strong> ({item.stockOnHand} units on hand), while supplier delivery takes <strong>{item.supplierLeadDays} days</strong>.
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dead Stock Money Tied Up Warning */}
      {deadStockItems.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
              <PackageX className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Money tied up in products that are not selling:
              </h3>
              {deadStockItems.map((item) => (
                <p key={item.productId} className="mt-1 text-xs text-amber-900 font-medium">
                  • <strong>{item.productName}:</strong> {item.stockOnHand} units sitting in shop with only {item.unitsSoldInPeriod} unit(s) sold recently. <strong>{formatINR(item.deadStockValue)}</strong> tied up at cost ({formatINR(item.stockOnHand * item.retailPrice)} retail value).
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={abcFilter}
            onChange={(e) => setAbcFilter(e.target.value as 'All' | ABCClass)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="All">All ABC Priorities</option>
            <option value="A">Class A (Top 70% Revenue)</option>
            <option value="B">Class B (Core 20% Revenue)</option>
            <option value="C">Class C (Low Revenue)</option>
          </select>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'critical', 'warning', 'healthy'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'critical' ? 'Critical' : st === 'warning' ? 'Watch' : st === 'healthy' ? 'Healthy' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table with Owner-Friendly Headers */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th
                  onClick={() => handleSort('productName')}
                  className="cursor-pointer py-3.5 pl-4 hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    Product <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="cursor-pointer py-3.5 hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    Category <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 text-center">ABC Rank</th>
                <th
                  onClick={() => handleSort('stockOnHand')}
                  className="cursor-pointer py-3.5 text-right hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    Stock on Hand <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgDailySales')}
                  className="cursor-pointer py-3.5 text-right hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    Daily Demand <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('daysOfCover')}
                  className="cursor-pointer py-3.5 text-right hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    Stock Left <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('supplierLeadDays')}
                  className="cursor-pointer py-3.5 text-right hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    Delivery Takes <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.map((item) => {
                const badge = getStatusBadge(item.status);
                const Icon = badge.icon;
                const isHighlighted = item.productId === highlightProductId;

                return (
                  <tr
                    key={item.productId}
                    className={`cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-emerald-50/80 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                    onClick={() => setSelectedProduct(item)}
                  >
                    <td className="py-3.5 pl-4 font-bold text-slate-900">
                      <div>{item.productName}</div>
                      <span className="text-[10px] font-mono text-slate-400">{item.productId}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`inline-block rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                          item.abcClass === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.abcClass === 'B'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Class {item.abcClass || 'B'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-semibold text-slate-900">
                      {formatNumber(item.stockOnHand)} units
                    </td>
                    <td className="py-3.5 text-right font-medium text-slate-600">
                      ~{item.avgDailySales} / day
                    </td>
                    <td className="py-3.5 text-right font-bold">
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold ${
                          item.isStockoutRisk
                            ? 'bg-rose-100 text-rose-800'
                            : item.daysOfCover > 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'text-slate-800'
                        }`}
                      >
                        {item.daysOfCover >= 900 ? 'No recent sales' : `About ${item.daysOfCover} days`}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-slate-600 font-medium">
                      {item.supplierLeadDays} days
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.badge}`}
                      >
                        <Icon className="h-3 w-3" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(item);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs hover:border-emerald-400 hover:text-emerald-800 hover:bg-emerald-50 transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredItems.length} of {inventory.length} store products</span>
          <span className="italic">Click any row to inspect simple countdowns and how stock cover was calculated</span>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedProduct.productName}</h3>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      getStatusBadge(selectedProduct.status).badge
                    }`}
                  >
                    {getStatusBadge(selectedProduct.status).label}
                  </span>
                  <span className="rounded-md bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                    Class {selectedProduct.abcClass || 'B'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Product ID: {selectedProduct.productId} • Category: {selectedProduct.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="mt-4 space-y-4">
              {/* Simple Owner-Friendly Summary */}
              <div
                className={`rounded-xl border p-3.5 text-xs ${
                  selectedProduct.isStockoutRisk
                    ? 'border-rose-200 bg-rose-50 text-rose-950 font-medium'
                    : selectedProduct.isDeadStock
                    ? 'border-amber-200 bg-amber-50 text-amber-950 font-medium'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-950 font-medium'
                }`}
              >
                <div className="font-bold text-sm mb-1">
                  {selectedProduct.isStockoutRisk
                    ? '⚠️ Stock may run out before delivery!'
                    : selectedProduct.isDeadStock
                    ? '📦 Money tied up in unsold stock'
                    : '✅ Stock levels are healthy'}
                </div>
                <p className="leading-relaxed">{selectedProduct.friendlyStatusText}</p>
                <div className="mt-2 pt-2 border-t border-black/10">
                  <strong>Recommended Next Step:</strong> {selectedProduct.suggestedAction}
                </div>
              </div>

              {/* How We Calculated This */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
                  How we calculated this
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Average Daily Demand:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedProduct.unitsSoldInPeriod} units sold ÷ {periodDays} days ={' '}
                      <strong className="text-emerald-700">{selectedProduct.avgDailySales} units/day</strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Days of Stock Left:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedProduct.stockOnHand} stock ÷ {selectedProduct.avgDailySales} daily demand ={' '}
                      <strong
                        className={
                          selectedProduct.isStockoutRisk ? 'text-rose-700' : 'text-slate-900'
                        }
                      >
                        {selectedProduct.daysOfCover >= 900 ? 'No sales' : `About ${selectedProduct.daysOfCover} days`}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Supplier Delivery Time:</span>
                    <span className="font-semibold text-slate-900">
                      Takes <strong>{selectedProduct.supplierLeadDays} days</strong> for next delivery to arrive
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200/70 p-3 bg-white">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Unit Economics</span>
                  <div className="mt-1 text-xs space-y-0.5">
                    <div>Retail Selling Price: <strong>{formatINR(selectedProduct.retailPrice)}</strong></div>
                    <div>Wholesale Unit Cost: <strong>{formatINR(selectedProduct.unitCost)}</strong></div>
                    <div className="text-emerald-700 font-medium">
                      Profit per Unit: {formatINR(selectedProduct.retailPrice - selectedProduct.unitCost)} (
                      {(
                        ((selectedProduct.retailPrice - selectedProduct.unitCost) /
                          selectedProduct.retailPrice) *
                        100
                      ).toFixed(0)}
                      % margin)
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/70 p-3 bg-white">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Cash Locked</span>
                  <div className="mt-1 text-xs space-y-0.5">
                    <div>Stock on Hand: <strong>{selectedProduct.stockOnHand} units</strong></div>
                    <div>Inventory at Cost: <strong>{formatINR(selectedProduct.stockOnHand * selectedProduct.unitCost)}</strong></div>
                    <div className="text-slate-500">Retail Value: {formatINR(selectedProduct.stockOnHand * selectedProduct.retailPrice)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  onNavigate('copilot');
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Ask Copilot about {selectedProduct.productName} →
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
