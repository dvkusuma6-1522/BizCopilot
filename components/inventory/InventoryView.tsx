'use client';

import React, { useState } from 'react';
import { CalculatedInventoryItem, InventoryStatus, ActiveTab } from '@/lib/types';
import { formatINR, formatNumber } from '@/lib/analytics';
import {
  Search,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  X,
  Info,
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
      return matchSearch && matchStatus && matchCategory;
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
          label: 'Critical',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          label: 'Warning',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: AlertTriangle,
        };
      case 'healthy':
        return {
          label: 'Healthy',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Inventory Intelligence & Stock Cover</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent stock cover calculated using daily velocity over the last {periodDays} days
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
            {inventory.filter((i) => i.isStockoutRisk).length} Stockout Risk
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            {inventory.filter((i) => i.isDeadStock).length} Dead Stock Item(s)
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            {inventory.filter((i) => i.status === 'healthy').length} Healthy SKUs
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
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
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
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
                    Avg Daily Sales <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('daysOfCover')}
                  className="cursor-pointer py-3.5 text-right hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    Days of Cover <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('supplierLeadDays')}
                  className="cursor-pointer py-3.5 text-right hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    Supplier Lead <ArrowUpDown className="h-3 w-3" />
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
                    <td className="py-3.5 text-right font-semibold text-slate-900">
                      {formatNumber(item.stockOnHand)} units
                    </td>
                    <td className="py-3.5 text-right font-medium text-slate-600">
                      {item.avgDailySales} / day
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
                        {item.daysOfCover >= 900 ? 'No sales' : `${item.daysOfCover} days`}
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
          <span>Showing {filteredItems.length} of {inventory.length} inventory products</span>
          <span className="italic">Click any row to view diagnostic calculations and reorder advice</span>
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
                    {selectedProduct.status}
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
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Transparent Calculation Formulas
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Average Daily Sales:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedProduct.unitsSoldInPeriod} units / {periodDays} days ={' '}
                      <strong className="text-emerald-700">{selectedProduct.avgDailySales} units/day</strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Days of Stock Cover:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedProduct.stockOnHand} stock / {selectedProduct.avgDailySales} daily ={' '}
                      <strong
                        className={
                          selectedProduct.isStockoutRisk ? 'text-rose-700' : 'text-slate-900'
                        }
                      >
                        {selectedProduct.daysOfCover >= 900 ? 'N/A (No sales)' : `${selectedProduct.daysOfCover} days`}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Supplier Lead Delivery:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedProduct.supplierLeadDays} days delivery window
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200/70 p-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Unit Economics</span>
                  <div className="mt-1 text-xs space-y-0.5">
                    <div>Retail Price: <strong>{formatINR(selectedProduct.retailPrice)}</strong></div>
                    <div>Unit Cost: <strong>{formatINR(selectedProduct.unitCost)}</strong></div>
                    <div className="text-emerald-700">
                      Unit Margin: {formatINR(selectedProduct.retailPrice - selectedProduct.unitCost)} (
                      {(
                        ((selectedProduct.retailPrice - selectedProduct.unitCost) /
                          selectedProduct.retailPrice) *
                        100
                      ).toFixed(0)}
                      %)
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/70 p-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Capital Locked</span>
                  <div className="mt-1 text-xs space-y-0.5">
                    <div>Stock on Hand: <strong>{selectedProduct.stockOnHand} units</strong></div>
                    <div>Inventory at Cost: <strong>{formatINR(selectedProduct.stockOnHand * selectedProduct.unitCost)}</strong></div>
                    <div className="text-slate-500">Retail Value: {formatINR(selectedProduct.stockOnHand * selectedProduct.retailPrice)}</div>
                  </div>
                </div>
              </div>

              {/* Diagnostic Assessment */}
              <div
                className={`rounded-xl border p-3.5 text-xs ${
                  selectedProduct.isStockoutRisk
                    ? 'border-rose-200 bg-rose-50 text-rose-900'
                    : selectedProduct.isDeadStock
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Info className="h-4 w-4 shrink-0" />
                  Diagnostic Reason:
                </div>
                <p className="leading-relaxed">{selectedProduct.statusReason}</p>
                <div className="mt-2 pt-2 border-t border-black/10 font-medium">
                  <strong>Suggested Action:</strong> {selectedProduct.suggestedAction}
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
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
