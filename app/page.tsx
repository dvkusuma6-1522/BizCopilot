'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  InventoryItem,
  SalesRecord,
} from '@/lib/types';
import {
  INITIAL_INVENTORY,
  INITIAL_SALES_RECORDS,
  STORE_NAME,
  STORE_TYPE,
  STORE_LOCATION,
} from '@/lib/demo-data';
import {
  calculateInventoryMetrics,
  calculatePeriodSummary,
  getDailySalesTrend,
  getProductPerformance,
  formatINR,
  formatNumber,
} from '@/lib/analytics';
import {
  generateBusinessAlerts,
  generateAIRecommendations,
} from '@/lib/recommendation-engine';
import {
  loadSalesData,
  saveSalesData,
  loadInventoryData,
  saveInventoryData,
  resetDemoData,
} from '@/lib/storage';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { ProductPerformanceChart } from '@/components/dashboard/ProductPerformanceChart';
import { BusinessAlerts } from '@/components/dashboard/BusinessAlerts';
import { HealthSummaryCard } from '@/components/dashboard/HealthSummaryCard';
import { RecommendationPreview } from '@/components/dashboard/RecommendationPreview';

import { SalesView } from '@/components/sales/SalesView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { RecommendationsView } from '@/components/recommendations/RecommendationsView';
import { CopilotChat } from '@/components/copilot/CopilotChat';
import { DataImportView } from '@/components/upload/DataImportView';

import {
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  PackageX,
  Sparkles,
  ArrowRight,
  Store,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [periodDays, setPeriodDays] = useState<number>(14);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(INITIAL_SALES_RECORDS);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [isCustomData, setIsCustomData] = useState<boolean>(false);
  const [highlightProductId, setHighlightProductId] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Load persisted records on client mount
  useEffect(() => {
    setIsMounted(true);
    const savedSales = loadSalesData();
    const savedInv = loadInventoryData();
    if (savedSales !== INITIAL_SALES_RECORDS) {
      setSalesRecords(savedSales);
      setIsCustomData(true);
    }
    if (savedInv !== INITIAL_INVENTORY) {
      setInventoryItems(savedInv);
    }
  }, []);

  // Compute analytics deterministically
  const inventoryMetrics = useMemo(() => {
    return calculateInventoryMetrics(inventoryItems, salesRecords, periodDays);
  }, [inventoryItems, salesRecords, periodDays]);

  const periodSummary = useMemo(() => {
    return calculatePeriodSummary(inventoryItems, salesRecords, periodDays);
  }, [inventoryItems, salesRecords, periodDays]);

  const salesTrend = useMemo(() => {
    return getDailySalesTrend(salesRecords, periodDays);
  }, [salesRecords, periodDays]);

  const productPerformance = useMemo(() => {
    return getProductPerformance(salesRecords, periodDays);
  }, [salesRecords, periodDays]);

  const businessAlerts = useMemo(() => {
    return generateBusinessAlerts(inventoryMetrics, productPerformance);
  }, [inventoryMetrics, productPerformance]);

  const aiRecommendations = useMemo(() => {
    return generateAIRecommendations(inventoryMetrics, productPerformance);
  }, [inventoryMetrics, productPerformance]);

  // Handle navigation with optional product context
  const handleNavigate = (tab: ActiveTab, productId?: string) => {
    setActiveTab(tab);
    if (productId) {
      setHighlightProductId(productId);
    }
  };

  // Import custom CSV data
  const handleImportSuccess = (newSales: SalesRecord[], newInventory: InventoryItem[]) => {
    setSalesRecords(newSales);
    setInventoryItems(newInventory);
    setIsCustomData(true);
    saveSalesData(newSales);
    saveInventoryData(newInventory);
  };

  // Reset to default FreshMart demo data
  const handleResetData = () => {
    const res = resetDemoData();
    setSalesRecords(res.sales);
    setInventoryItems(res.inventory);
    setIsCustomData(false);
    setHighlightProductId(undefined);
  };

  if (!isMounted) {
    // Avoid hydration layout mismatch by rendering a clean loading shell
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span>Initializing BizCopilot Advisor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        stockoutCount={periodSummary.stockoutRiskCount}
        recommendationCount={aiRecommendations.length}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          periodDays={periodDays}
          setPeriodDays={setPeriodDays}
          onResetData={handleResetData}
          setMobileOpen={setMobileOpen}
          isCustomData={isCustomData}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Demo Store Context Banner */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-slate-900">{STORE_NAME}</h2>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs font-semibold">
                          Sample Store Dataset
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {STORE_TYPE} • {STORE_LOCATION} • Reporting Window: {periodSummary.startDate} to {periodSummary.endDate} ({periodDays} days)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('copilot')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Ask Copilot Today&apos;s Actions</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Primary Executive Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Revenue"
                  value={formatINR(periodSummary.totalRevenue)}
                  changePct={periodSummary.revenueChangePct}
                  comparisonLabel={`vs previous ${periodDays}d`}
                  icon={IndianRupee}
                  iconColor="text-emerald-700"
                  iconBg="bg-emerald-50"
                  tooltip="Total sales receipts across the selected period. Compares with an identical previous window."
                />

                <MetricCard
                  title="Units Sold"
                  value={formatNumber(periodSummary.totalUnitsSold)}
                  changePct={periodSummary.unitsChangePct}
                  comparisonLabel={`vs previous ${periodDays}d`}
                  icon={ShoppingBag}
                  iconColor="text-teal-700"
                  iconBg="bg-teal-50"
                  tooltip="Total physical quantity of grocery items sold across the analysis period."
                />

                <MetricCard
                  title="Stockout Risk"
                  value={`${periodSummary.stockoutRiskCount} Product${periodSummary.stockoutRiskCount === 1 ? '' : 's'}`}
                  statusBadge={periodSummary.stockoutRiskCount > 0 ? 'Urgent Reorder' : 'All Protected'}
                  badgeColor={
                    periodSummary.stockoutRiskCount > 0
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }
                  icon={AlertTriangle}
                  iconColor={periodSummary.stockoutRiskCount > 0 ? 'text-rose-600' : 'text-emerald-600'}
                  iconBg={periodSummary.stockoutRiskCount > 0 ? 'bg-rose-50' : 'bg-emerald-50'}
                  tooltip="Products where current stock cover in days is less than distributor delivery lead time."
                />

                <MetricCard
                  title="Dead Stock Value"
                  value={formatINR(periodSummary.deadStockTotalCost)}
                  statusBadge={
                    periodSummary.deadStockCount > 0
                      ? `${periodSummary.deadStockCount} SKU(s) Slow`
                      : 'High Velocity'
                  }
                  badgeColor={
                    periodSummary.deadStockCount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }
                  icon={PackageX}
                  iconColor="text-amber-600"
                  iconBg="bg-amber-50"
                  tooltip="Capital tied up in products with zero or near-zero sales over recent weeks (calculated at unit cost)."
                />
              </div>

              {/* Charts Section: Sales Trend & Top Contribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesTrendChart data={salesTrend} periodDays={periodDays} />
                <ProductPerformanceChart products={productPerformance} />
              </div>

              {/* Business Health Summary Scorecard */}
              <HealthSummaryCard summary={periodSummary} />

              {/* Critical Business Alerts */}
              <BusinessAlerts alerts={businessAlerts} onNavigate={handleNavigate} />

              {/* Top AI Recommendations Preview */}
              <RecommendationPreview
                recommendations={aiRecommendations}
                onNavigate={handleNavigate}
              />
            </div>
          )}

          {/* TAB 2: SALES ANALYTICS */}
          {activeTab === 'sales' && (
            <SalesView
              salesTrend={salesTrend}
              productPerformance={productPerformance}
              summary={periodSummary}
              periodDays={periodDays}
              setPeriodDays={setPeriodDays}
              onNavigate={handleNavigate}
            />
          )}

          {/* TAB 3: INVENTORY INTELLIGENCE */}
          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventoryMetrics}
              periodDays={periodDays}
              highlightProductId={highlightProductId}
              onNavigate={handleNavigate}
            />
          )}

          {/* TAB 4: AI RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <RecommendationsView
              recommendations={aiRecommendations}
              onNavigate={handleNavigate}
            />
          )}

          {/* TAB 5: AI COPILOT */}
          {activeTab === 'copilot' && (
            <CopilotChat
              summary={periodSummary}
              inventory={inventoryMetrics}
              productPerformance={productPerformance}
            />
          )}

          {/* TAB 6: DATA IMPORT (CSV) */}
          {activeTab === 'import' && (
            <DataImportView
              currentInventory={inventoryItems}
              onImportSuccess={handleImportSuccess}
              onResetData={handleResetData}
              onNavigate={setActiveTab}
            />
          )}
        </main>
      </div>
    </div>
  );
}
