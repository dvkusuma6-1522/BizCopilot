'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  generateActTodayItems,
  generateWatchThisWeekItems,
  generateDoingWellItems,
  generateAIRecommendations,
} from '@/lib/recommendation-engine';
import {
  initDatabase,
  resetDatabaseToDemo,
  saveImportedDataToDb,
  getDbActions,
  updateDbActionStatus,
  getDbSetting,
  setDbSetting,
  DBAction,
} from '@/lib/db';
import { SupportedLanguage, translations } from '@/lib/i18n';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { ProductPerformanceChart } from '@/components/dashboard/ProductPerformanceChart';
import { HealthSummaryCard } from '@/components/dashboard/HealthSummaryCard';
import { ActTodaySection } from '@/components/dashboard/ActTodaySection';
import { WatchThisWeekSection } from '@/components/dashboard/WatchThisWeekSection';
import { DoingWellSection } from '@/components/dashboard/DoingWellSection';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { MoneySavedDialog } from '@/components/dashboard/MoneySavedDialog';

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
  LineChart,
  ShieldCheck,
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

  // Advanced features state
  const [mode, setMode] = useState<'owner' | 'analyst'>('owner');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isMoneySavedOpen, setIsMoneySavedOpen] = useState<boolean>(false);
  const [dbActions, setDbActions] = useState<DBAction[]>([]);

  // Load persisted records from Dexie on client mount
  useEffect(() => {
    setIsMounted(true);

    const loadData = async () => {
      try {
        const { sales, inventory } = await initDatabase();
        if (sales && sales.length > 0) {
          setSalesRecords(sales);
          if (sales !== INITIAL_SALES_RECORDS && sales.length !== INITIAL_SALES_RECORDS.length) {
            setIsCustomData(true);
          }
        }
        if (inventory && inventory.length > 0) {
          setInventoryItems(inventory);
        }

        const actions = await getDbActions();
        setDbActions(actions);

        const savedLang = (await getDbSetting('language', 'en')) as SupportedLanguage;
        setLang(savedLang);

        const savedMode = (await getDbSetting('mode', 'owner')) as 'owner' | 'analyst';
        setMode(savedMode);

        const onboardingDone = await getDbSetting('onboardingComplete', 'false');
        if (onboardingDone !== 'true') {
          setIsTourOpen(true);
        }
      } catch (e) {
        console.error('Dexie initial load error:', e);
      }
    };

    loadData();
  }, []);

  const t = translations[lang] || translations.en;

  // Language update with persistence
  const handleSetLang = useCallback(async (newLang: SupportedLanguage) => {
    setLang(newLang);
    await setDbSetting('language', newLang);
  }, []);

  // Mode update with persistence
  const handleSetMode = useCallback(async (newMode: 'owner' | 'analyst') => {
    setMode(newMode);
    await setDbSetting('mode', newMode);
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

  // Redesigned 3 Prominent Business Sections
  const actTodayItems = useMemo(() => {
    return generateActTodayItems(inventoryMetrics, productPerformance);
  }, [inventoryMetrics, productPerformance]);

  const watchThisWeekItems = useMemo(() => {
    return generateWatchThisWeekItems(inventoryMetrics, productPerformance);
  }, [inventoryMetrics, productPerformance]);

  const doingWellItems = useMemo(() => {
    return generateDoingWellItems(inventoryMetrics, productPerformance);
  }, [inventoryMetrics, productPerformance]);

  const aiRecommendations = useMemo(() => {
    return generateAIRecommendations(inventoryMetrics, productPerformance);
  }, [inventoryMetrics, productPerformance]);

  // Calculate Money Saved total from completed actions
  const totalMoneySaved = useMemo(() => {
    return dbActions
      .filter((a) => a.status === 'done')
      .reduce((sum, a) => sum + (a.impactValue || 0), 0);
  }, [dbActions]);

  // Handle marking an action as Done
  const handleActionDone = async (
    productId: string,
    productName: string,
    impactValue: number
  ) => {
    const existing = dbActions.find((a) => a.productId === productId);
    if (existing && existing.id) {
      await updateDbActionStatus(existing.id, 'done');
    }
    setDbActions((prev) => {
      const idx = prev.findIndex((a) => a.productId === productId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          status: 'done',
          impactValue,
          completedAt: new Date().toISOString(),
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            storeId: 1,
            type: 'reorder',
            productId,
            productName,
            description: `Replenished stock of ${productName}`,
            suggestedAction: 'Order placed',
            impactValue,
            status: 'done',
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const handleActionDismiss = async (productId: string) => {
    const existing = dbActions.find((a) => a.productId === productId);
    if (existing && existing.id) {
      await updateDbActionStatus(existing.id, 'dismissed');
    }
    setDbActions((prev) => prev.filter((a) => a.productId !== productId));
  };

  // Handle navigation with optional product context
  const handleNavigate = (tab: ActiveTab, productId?: string) => {
    setActiveTab(tab);
    if (productId) {
      setHighlightProductId(productId);
    }
  };

  // Import custom CSV/Excel data
  const handleImportSuccess = async (newSales: SalesRecord[], newInventory: InventoryItem[]) => {
    setSalesRecords(newSales);
    setInventoryItems(newInventory);
    setIsCustomData(true);
    await saveImportedDataToDb(newSales, newInventory);
  };

  // Reset to default FreshMart demo data
  const handleResetData = async () => {
    const res = await resetDatabaseToDemo();
    setSalesRecords(res.sales);
    setInventoryItems(res.inventory);
    setIsCustomData(false);
    setHighlightProductId(undefined);
    const actions = await getDbActions();
    setDbActions(actions);
  };

  const handleCloseTour = async () => {
    setIsTourOpen(false);
    await setDbSetting('onboardingComplete', 'true');
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span>Opening BizCopilot Advisor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar (Desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        stockoutCount={actTodayItems.length}
        recommendationCount={aiRecommendations.length}
        lang={lang}
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
          mode={mode}
          setMode={handleSetMode}
          lang={lang}
          setLang={handleSetLang}
          moneySaved={totalMoneySaved}
          onOpenMoneySaved={() => setIsMoneySavedOpen(true)}
          onOpenTour={() => setIsTourOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Store Context Banner */}
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
                          {isCustomData ? t.customData : t.sampleData}
                        </span>
                        {mode === 'owner' ? (
                          <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-xs font-bold">
                            {t.ownerMode}
                          </span>
                        ) : (
                          <span className="rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-xs font-bold">
                            {t.analystMode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {STORE_TYPE} • {STORE_LOCATION} • Reporting: {periodSummary.startDate} to {periodSummary.endDate} ({periodDays} days)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {totalMoneySaved > 0 && (
                      <button
                        onClick={() => setIsMoneySavedOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-300 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-xs hover:bg-emerald-100 transition-all"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>{t.moneySaved}: {formatINR(totalMoneySaved)}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab('copilot')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-[0.98]"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{t.askCopilotBtn}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Owner-Friendly Metric Cards (shown in Analyst mode or accessible in Owner mode) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title={t.metricSalesTitle}
                  value={formatINR(periodSummary.totalRevenue)}
                  changePct={periodSummary.revenueChangePct}
                  comparisonLabel={`vs previous ${periodDays}d`}
                  icon={IndianRupee}
                  iconColor="text-emerald-700"
                  iconBg="bg-emerald-50"
                  tooltip={t.metricSalesTooltip}
                />

                <MetricCard
                  title={t.metricUnitsTitle}
                  value={formatNumber(periodSummary.totalUnitsSold)}
                  changePct={periodSummary.unitsChangePct}
                  comparisonLabel={`vs previous ${periodDays}d`}
                  icon={ShoppingBag}
                  iconColor="text-teal-700"
                  iconBg="bg-teal-50"
                  tooltip={t.metricUnitsTooltip}
                />

                <MetricCard
                  title={t.metricStockoutTitle}
                  value={`${periodSummary.stockoutRiskCount} ${periodSummary.stockoutRiskCount === 1 ? 'Product' : 'Products'}`}
                  statusBadge={periodSummary.stockoutRiskCount > 0 ? 'Urgent Order' : 'All Protected'}
                  badgeColor={
                    periodSummary.stockoutRiskCount > 0
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }
                  icon={AlertTriangle}
                  iconColor={periodSummary.stockoutRiskCount > 0 ? 'text-rose-600' : 'text-emerald-600'}
                  iconBg={periodSummary.stockoutRiskCount > 0 ? 'bg-rose-50' : 'bg-emerald-50'}
                  tooltip={t.metricStockoutTooltip}
                />

                <MetricCard
                  title={t.metricDeadStockTitle}
                  value={formatINR(periodSummary.deadStockTotalCost)}
                  statusBadge={
                    periodSummary.deadStockCount > 0
                      ? `${periodSummary.deadStockCount} SKU(s) Idle`
                      : 'Fast Moving'
                  }
                  badgeColor={
                    periodSummary.deadStockCount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }
                  icon={PackageX}
                  iconColor="text-amber-600"
                  iconBg="bg-amber-50"
                  tooltip={t.metricDeadStockTooltip}
                />
              </div>

              {/* SECTION 1: ACT TODAY (Critical problems) */}
              <ActTodaySection
                items={actTodayItems}
                onNavigate={handleNavigate}
                onActionDone={handleActionDone}
                onActionDismiss={handleActionDismiss}
                lang={lang}
                storeName={STORE_NAME}
              />

              {/* SECTION 2: WATCH THIS WEEK (Decisions needed this week) */}
              <WatchThisWeekSection
                items={watchThisWeekItems}
                onNavigate={handleNavigate}
                onActionDone={handleActionDone}
                onActionDismiss={handleActionDismiss}
                lang={lang}
              />

              {/* SECTION 3: DOING WELL (Positive business signals) */}
              <DoingWellSection
                items={doingWellItems}
                onNavigate={handleNavigate}
                lang={lang}
              />

              {/* In Analyst Mode: Show Health Scorecard and Charts */}
              {mode === 'analyst' && (
                <>
                  <HealthSummaryCard summary={periodSummary} />

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <LineChart className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Store Performance & Trends</h3>
                          <p className="text-xs text-slate-500">Daily turnover patterns and highest earning product lines</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('sales')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        <span>Detailed Sales Analytics</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SalesTrendChart data={salesTrend} periodDays={periodDays} />
                      <ProductPerformanceChart products={productPerformance} />
                    </div>
                  </div>
                </>
              )}
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
              lang={lang}
              storeName={STORE_NAME}
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
              lang={lang}
            />
          )}

          {/* TAB 6: DATA IMPORT (CSV & Excel) */}
          {activeTab === 'import' && (
            <DataImportView
              currentInventory={inventoryItems}
              onImportSuccess={handleImportSuccess}
              onResetData={handleResetData}
              onNavigate={setActiveTab}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on screen < 1024px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        stockoutCount={actTodayItems.length}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        currentLang={lang}
        onSelectLang={handleSetLang}
        currentMode={mode}
        onSelectMode={handleSetMode}
        onChooseUpload={() => setActiveTab('import')}
      />

      {/* Money Saved Breakdown Dialog */}
      <MoneySavedDialog
        isOpen={isMoneySavedOpen}
        onClose={() => setIsMoneySavedOpen(false)}
        actions={dbActions}
        lang={lang}
      />
    </div>
  );
}
