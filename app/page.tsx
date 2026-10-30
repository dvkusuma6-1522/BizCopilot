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
  addDbAction,
  getDbSetting,
  setDbSetting,
  DBAction,
  seedCategoryDemoData,
  saveBusinessProfile,
  recordQuickSale,
  undoQuickSale,
  recordStockIn,
  clearDemoData,
  getTourSeen,
  setTourSeen,
} from '@/lib/db';
import { SupportedLanguage, translations } from '@/lib/i18n';
import { BusinessProfile } from '@/lib/categories/types';
import { getCategory } from '@/lib/categories/registry';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { CategoryPickerModal } from '@/components/onboarding/CategoryPickerModal';
import { CategoryKpiSection } from '@/components/dashboard/CategoryKpiSection';

import { FESTIVALS_DATA } from '@/lib/festivals/data';
import { upcomingFestivals } from '@/lib/engine/festivals';
import { buildDigest, DigestAction } from '@/lib/engine/digest';
import { DailyDigestCard } from '@/components/dashboard/DailyDigestCard';
import { FestivalStrip } from '@/components/dashboard/FestivalStrip';
import { FestivalReminderBanner } from '@/components/dashboard/FestivalReminderBanner';
import { FestivalCalendarView } from '@/components/calendar/FestivalCalendarView';
import { SettingsModal } from '@/components/settings/SettingsModal';

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
import { MoneySavedDialog } from '@/components/dashboard/MoneySavedDialog';

import { SalesView } from '@/components/sales/SalesView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { RecommendationsView } from '@/components/recommendations/RecommendationsView';
import { CopilotChat } from '@/components/copilot/CopilotChat';
import { DataImportView } from '@/components/upload/DataImportView';

// Fast Onboarding & Entry Components
import { ToastUndoProvider, useToastUndo } from '@/components/ui/ToastUndo';
import { DemoDataBanner } from '@/components/dashboard/DemoDataBanner';
import { FastOnboardingModal } from '@/components/onboarding/FastOnboardingModal';
import { DashboardTour } from '@/components/onboarding/DashboardTour';
import { QuickActionFAB, QuickActionType } from '@/components/actions/QuickActionFAB';
import { QuickSaleModal } from '@/components/sales/QuickSaleModal';
import { VoiceEntryModal } from '@/components/voice/VoiceEntryModal';
import { BarcodeScannerModal } from '@/components/barcode/BarcodeScannerModal';
import { BillExtractModal } from '@/components/bills/BillExtractModal';
import { applyStockDecrement, revertStockDecrement } from '@/lib/engine/fast-entry';

import {
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  PackageX,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function HomePage() {
  return (
    <ToastUndoProvider>
      <MainDashboardApp />
    </ToastUndoProvider>
  );
}

function MainDashboardApp() {
  const { showToast } = useToastUndo();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [periodDays, setPeriodDays] = useState<number>(14);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(INITIAL_SALES_RECORDS);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [isCustomData, setIsCustomData] = useState<boolean>(false);
  const [highlightProductId, setHighlightProductId] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Business Category Profile state
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    categoryId: 'kirana',
    businessName: STORE_NAME,
    city: 'Bengaluru',
    language: 'en',
    createdAt: new Date().toISOString(),
  });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isFirstRun, setIsFirstRun] = useState<boolean>(false);
  const [isFastOnboardingOpen, setIsFastOnboardingOpen] = useState<boolean>(false);
  const [isDashboardTourOpen, setIsDashboardTourOpen] = useState<boolean>(false);

  // Fast entry modal states
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState<boolean>(false);
  const [isVoiceEntryOpen, setIsVoiceEntryOpen] = useState<boolean>(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState<boolean>(false);
  const [isBillExtractOpen, setIsBillExtractOpen] = useState<boolean>(false);

  const category = useMemo(() => {
    return getCategory(businessProfile.categoryId);
  }, [businessProfile.categoryId]);

  // Advanced features state
  const [mode, setMode] = useState<'owner' | 'analyst'>('owner');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [isMoneySavedOpen, setIsMoneySavedOpen] = useState<boolean>(false);
  const [dbActions, setDbActions] = useState<DBAction[]>([]);

  // Settings & Festival reminder state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [festivalRemindersEnabled, setFestivalRemindersEnabled] = useState<boolean>(true);
  const [dismissedFestivalIds, setDismissedFestivalIds] = useState<string[]>([]);
  const [digestNotificationEnabled, setDigestNotificationEnabled] = useState<boolean>(false);
  const [digestTime, setDigestTime] = useState<string>('08:00');

  // Load persisted records from Dexie on client mount
  useEffect(() => {
    setIsMounted(true);

    const loadData = async () => {
      try {
        const { sales, inventory, profile } = await initDatabase();
        if (profile) {
          setBusinessProfile(profile);
          if (profile.language) {
            setLang(profile.language);
          }
        }
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

        const savedLang = (await getDbSetting('language', profile?.language || 'en')) as SupportedLanguage;
        setLang(savedLang);

        const savedMode = (await getDbSetting('mode', 'owner')) as 'owner' | 'analyst';
        setMode(savedMode);

        const savedFestReminders = await getDbSetting('festivalRemindersEnabled', 'true');
        setFestivalRemindersEnabled(savedFestReminders === 'true');

        const savedDismissed = await getDbSetting('dismissedFestivalIds', '[]');
        try {
          setDismissedFestivalIds(JSON.parse(savedDismissed));
        } catch {}

        const savedDigestNotif = await getDbSetting('digestNotificationEnabled', 'false');
        setDigestNotificationEnabled(savedDigestNotif === 'true');

        const savedDigestTime = await getDbSetting('digestTime', '08:00');
        setDigestTime(savedDigestTime);

        const onboardingDone = await getDbSetting('onboardingComplete', 'false');
        if (onboardingDone !== 'true') {
          setIsFirstRun(true);
          setIsFastOnboardingOpen(true);
        } else {
          const tourSeen = await getTourSeen();
          if (!tourSeen) {
            setIsDashboardTourOpen(true);
          }
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

  const handleToggleFestivalReminders = useCallback(async (enabled: boolean) => {
    setFestivalRemindersEnabled(enabled);
    await setDbSetting('festivalRemindersEnabled', enabled ? 'true' : 'false');
  }, []);

  const handleDismissFestivalReminder = useCallback(async (festId: string) => {
    setDismissedFestivalIds((prev) => {
      const updated = [...prev, festId];
      setDbSetting('dismissedFestivalIds', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleToggleDigestNotification = useCallback(async (enabled: boolean) => {
    setDigestNotificationEnabled(enabled);
    await setDbSetting('digestNotificationEnabled', enabled ? 'true' : 'false');
  }, []);

  const handleSetDigestTime = useCallback(async (time: string) => {
    setDigestTime(time);
    await setDbSetting('digestTime', time);
  }, []);

  const handleDigestActionDone = useCallback(async (action: DigestAction) => {
    await addDbAction({
      storeId: 1,
      type:
        action.type === 'stockout' || action.type === 'festival_reorder'
          ? 'reorder'
          : 'discount_dead_stock',
      productId: action.productId || 'DIGEST',
      productName: action.productName || 'Daily Action',
      description: `Completed from Daily Digest`,
      suggestedAction: action.type,
      impactValue: (action.params.deadStockValue as number) || 500,
      status: 'done',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    const refreshed = await getDbActions();
    setDbActions(refreshed);

    showToast({
      message: `Completed: ${action.productName || 'Daily Action'}`,
      durationMs: 5000,
      undoLabel: 'Undo',
      onUndo: async () => {
        const existing = refreshed.find((a) => a.productId === (action.productId || 'DIGEST'));
        if (existing && existing.id) {
          await updateDbActionStatus(existing.id, 'suggested');
          const reverted = await getDbActions();
          setDbActions(reverted);
        }
      },
    });
  }, [showToast]);

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

  // Daily Digest (Urgent Top 3 Actions)
  const dailyDigest = useMemo(() => {
    return buildDigest(
      inventoryMetrics,
      productPerformance,
      FESTIVALS_DATA,
      new Date(),
      businessProfile.categoryId
    );
  }, [inventoryMetrics, productPerformance, businessProfile.categoryId]);

  // Upcoming Relevant Festivals
  const upcomingRelevantFestivals = useMemo(() => {
    return upcomingFestivals(new Date(), businessProfile.categoryId, 45, FESTIVALS_DATA);
  }, [businessProfile.categoryId]);

  // Redesigned 3 Prominent Business Sections with Category Rules integration
  const actTodayItems = useMemo(() => {
    return generateActTodayItems(
      inventoryMetrics,
      productPerformance,
      category,
      lang,
      salesRecords,
      periodDays
    );
  }, [inventoryMetrics, productPerformance, category, lang, salesRecords, periodDays]);

  const watchThisWeekItems = useMemo(() => {
    return generateWatchThisWeekItems(
      inventoryMetrics,
      productPerformance,
      category,
      lang,
      salesRecords,
      periodDays
    );
  }, [inventoryMetrics, productPerformance, category, lang, salesRecords, periodDays]);

  const doingWellItems = useMemo(() => {
    return generateDoingWellItems(
      inventoryMetrics,
      productPerformance,
      category,
      lang,
      salesRecords,
      periodDays
    );
  }, [inventoryMetrics, productPerformance, category, lang, salesRecords, periodDays]);

  const aiRecommendations = useMemo(() => {
    return generateAIRecommendations(
      inventoryMetrics,
      productPerformance,
      category,
      lang,
      salesRecords,
      periodDays
    );
  }, [inventoryMetrics, productPerformance, category, lang, salesRecords, periodDays]);

  // Calculate Money Saved total from completed actions
  const totalMoneySaved = useMemo(() => {
    return dbActions
      .filter((a) => a.status === 'done')
      .reduce((sum, a) => sum + (a.impactValue || 0), 0);
  }, [dbActions]);

  // Handle marking an action as Done with 5s undo
  const handleActionDone = async (
    productId: string,
    productName: string,
    impactValue: number
  ) => {
    const existing = dbActions.find((a) => a.productId === productId);
    let actionId = existing?.id;
    if (existing && existing.id) {
      await updateDbActionStatus(existing.id, 'done');
    } else {
      actionId = await addDbAction({
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
      });
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
            id: actionId,
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

    showToast({
      message: `Marked "${productName}" as done`,
      durationMs: 5000,
      undoLabel: 'Undo',
      onUndo: async () => {
        if (actionId) {
          await updateDbActionStatus(actionId, 'suggested');
          setDbActions((prev) =>
            prev.map((a) =>
              a.productId === productId ? { ...a, status: 'suggested' } : a
            )
          );
        }
      },
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
    showToast({
      message: `Loaded ${newSales.length} sales rows & ${newInventory.length} products!`,
      durationMs: 4000,
    });
  };

  // First-run fast onboarding handler
  const handleFastOnboardingComplete = async (newProfile: BusinessProfile) => {
    setBusinessProfile(newProfile);
    setLang(newProfile.language);
    await saveBusinessProfile(newProfile);
    await setDbSetting('language', newProfile.language);
    await setDbSetting('onboardingComplete', 'true');
    await setDbSetting('isDemoData', 'true');

    // Seed selected category demo data immediately
    const demoRes = await seedCategoryDemoData(newProfile.categoryId);
    setSalesRecords(demoRes.sales);
    setInventoryItems(demoRes.inventory);
    setIsCustomData(false);
    setHighlightProductId(undefined);
    const actions = await getDbActions();
    setDbActions(actions);

    setIsFastOnboardingOpen(false);

    // Trigger tour if not yet seen
    const tourSeen = await getTourSeen();
    if (!tourSeen) {
      setIsDashboardTourOpen(true);
    }
  };

  // Switch business type handler
  const handleCategoryComplete = async (
    newProfile: BusinessProfile,
    options: { loadDemo: boolean }
  ) => {
    setBusinessProfile(newProfile);
    setLang(newProfile.language);
    await saveBusinessProfile(newProfile);
    await setDbSetting('language', newProfile.language);
    await setDbSetting('onboardingComplete', 'true');

    if (options.loadDemo) {
      const demoRes = await seedCategoryDemoData(newProfile.categoryId);
      setSalesRecords(demoRes.sales);
      setInventoryItems(demoRes.inventory);
      setIsCustomData(false);
      setHighlightProductId(undefined);
      const actions = await getDbActions();
      setDbActions(actions);
    }
    setIsCategoryModalOpen(false);
  };

  // Reset to current category's demo data
  const handleResetData = async () => {
    const res = await resetDatabaseToDemo(businessProfile.categoryId);
    setSalesRecords(res.sales);
    setInventoryItems(res.inventory);
    setIsCustomData(false);
    setHighlightProductId(undefined);
    const actions = await getDbActions();
    setDbActions(actions);
    showToast({
      message: `Demo reset to ${category.labels[lang] || category.labels.en}`,
      durationMs: 4000,
    });
  };

  // Clear demo data to start fresh with own store data
  const handleClearDemoData = async () => {
    await clearDemoData();
    setSalesRecords([]);
    setInventoryItems([]);
    setIsCustomData(true);
    showToast({
      message: 'Demo data cleared! Add your first item or upload your bill.',
      durationMs: 4000,
    });
    setActiveTab('import');
  };

  const handleCloseTour = async () => {
    setIsDashboardTourOpen(false);
    await setTourSeen(true);
  };

  // Quick Action FAB handler
  const handleQuickAction = (action: QuickActionType) => {
    if (action === 'sale') setIsQuickSaleOpen(true);
    else if (action === 'stock') setIsBillExtractOpen(true);
    else if (action === 'barcode') setIsBarcodeScannerOpen(true);
    else if (action === 'voice') setIsVoiceEntryOpen(true);
    else if (action === 'bill') setIsBillExtractOpen(true);
  };

  // Fast Sale Record with 5s Undo
  const handleRecordSale = async (
    lines: { productId: string; quantity: number; unitPrice?: number }[]
  ) => {
    const { saleIds, adjustments, totalAmount } = await recordQuickSale(lines);
    const { updatedInventory } = applyStockDecrement(inventoryItems, lines);
    setInventoryItems(updatedInventory);

    const today = new Date().toISOString().split('T')[0];
    const newSales: SalesRecord[] = lines.map((l) => {
      const prod = inventoryItems.find((p) => p.productId === l.productId);
      return {
        date: today,
        productId: l.productId,
        productName: prod?.productName || l.productId,
        category: prod?.category || 'General',
        unitsSold: l.quantity,
        unitPrice: l.unitPrice ?? prod?.retailPrice ?? 0,
      };
    });
    setSalesRecords((prev) => [...prev, ...newSales]);

    showToast({
      message: `Sale recorded: ${formatINR(totalAmount)} (${lines.length} items)`,
      durationMs: 5000,
      undoLabel: 'Undo Sale',
      onUndo: async () => {
        await undoQuickSale(saleIds, adjustments);
        const restored = revertStockDecrement(updatedInventory, adjustments);
        setInventoryItems(restored);
        setSalesRecords((prev) => prev.slice(0, prev.length - newSales.length));
      },
    });
  };

  // Stock Inward with 5s Undo
  const handleRecordStockIn = async (
    items: { productId: string; quantity: number; unitCost?: number }[]
  ) => {
    await recordStockIn(items);
    setInventoryItems((prev) =>
      prev.map((p) => {
        const item = items.find((i) => i.productId === p.productId);
        if (!item) return p;
        return {
          ...p,
          stockOnHand: p.stockOnHand + item.quantity,
          unitCost: item.unitCost ?? p.unitCost,
        };
      })
    );

    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    showToast({
      message: `Stock added: +${totalQty} units`,
      durationMs: 5000,
      undoLabel: 'Undo Stock',
      onUndo: async () => {
        const revertItems = items.map((i) => ({
          productId: i.productId,
          quantity: -i.quantity,
        }));
        await recordStockIn(revertItems);
        setInventoryItems((prev) =>
          prev.map((p) => {
            const item = items.find((i) => i.productId === p.productId);
            if (!item) return p;
            return {
              ...p,
              stockOnHand: Math.max(0, p.stockOnHand - item.quantity),
            };
          })
        );
      },
    });
  };

  // Add new product from barcode or bill
  const handleAddNewProduct = async (product: Partial<InventoryItem>) => {
    const fullProduct: InventoryItem = {
      productId: product.productId || `P-${Date.now().toString().slice(-4)}`,
      productName: product.productName || 'New Product',
      category: product.category || 'General',
      stockOnHand: product.stockOnHand ?? 10,
      reorderLevel: product.reorderLevel ?? 5,
      supplierLeadDays: product.supplierLeadDays ?? 3,
      unitCost: product.unitCost ?? 40,
      retailPrice: product.retailPrice ?? 50,
      barcode: product.barcode,
    };
    await recordStockIn([
      {
        productId: fullProduct.productId,
        quantity: fullProduct.stockOnHand,
        unitCost: fullProduct.unitCost,
      },
    ]);
    setInventoryItems((prev) => [fullProduct, ...prev]);
    showToast({
      message: `Added new product: ${fullProduct.productName}`,
      durationMs: 4000,
    });
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 pb-20 lg:pb-0">
      {/* Sidebar (Desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        stockoutCount={actTodayItems.length}
        recommendationCount={aiRecommendations.length}
        lang={lang}
        category={category}
        storeName={businessProfile.businessName}
        skuCount={inventoryItems.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
          onOpenTour={() => setIsDashboardTourOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          category={category}
          onOpenCategoryPicker={() => setIsCategoryModalOpen(true)}
          businessName={businessProfile.businessName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Persistent Demo Data Banner */}
              <DemoDataBanner
                isDemoData={!isCustomData}
                onClearDemoData={handleClearDemoData}
                onNavigateToImport={() => setActiveTab('import')}
                lang={lang}
              />

              {/* Store Context Banner */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
                      <CategoryIcon iconName={category.icon} className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-slate-900">{businessProfile.businessName}</h2>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs font-semibold">
                          {category.labels[lang] || category.labels.en}
                        </span>
                        <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-xs font-medium">
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
                        {category.description[lang] || category.description.en} • {businessProfile.city} • Reporting: {periodSummary.startDate} to {periodSummary.endDate} ({periodDays} days)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="min-h-[48px] inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-emerald-500 hover:text-emerald-800 hover:bg-emerald-50 transition-all active:scale-95"
                      title="Switch business type"
                    >
                      <CategoryIcon iconName={category.icon} className="h-4 w-4 text-emerald-600" />
                      <span>Switch Business Type</span>
                    </button>

                    {totalMoneySaved > 0 && (
                      <button
                        onClick={() => setIsMoneySavedOpen(true)}
                        className="min-h-[48px] inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-300 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-xs hover:bg-emerald-100 transition-all active:scale-95"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>{t.moneySaved}: {formatINR(totalMoneySaved)}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab('copilot')}
                      className="min-h-[48px] inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-95"
                    >
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>{t.askCopilotBtn}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Owner-Friendly Metric Cards */}
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
                  iconColor="text-blue-700"
                  iconBg="bg-blue-50"
                  tooltip={t.metricUnitsTooltip}
                />
                <MetricCard
                  title={t.metricStockoutTitle}
                  value={String(inventoryMetrics.filter((i) => i.isStockoutRisk).length)}
                  statusBadge={inventoryMetrics.filter((i) => i.isStockoutRisk).length > 0 ? (lang === 'kn' ? 'ತುರ್ತು' : lang === 'hi' ? 'आवश्यक' : 'Urgent') : undefined}
                  icon={AlertTriangle}
                  iconColor="text-rose-700"
                  iconBg="bg-rose-50"
                  tooltip={t.metricStockoutTooltip}
                />
                <MetricCard
                  title={t.metricDeadStockTitle}
                  value={formatINR(periodSummary.deadStockTotalCost)}
                  statusBadge={periodSummary.deadStockTotalCost > 0 ? (lang === 'kn' ? 'ಕ್ರಮ ಅಗತ್ಯ' : lang === 'hi' ? 'ध्यान दें' : 'Action Needed') : undefined}
                  icon={PackageX}
                  iconColor="text-amber-700"
                  iconBg="bg-amber-50"
                  tooltip={t.metricDeadStockTooltip}
                />
              </div>

              {/* Category-Specific KPIs Section */}
              <CategoryKpiSection
                category={category}
                inventory={inventoryMetrics}
                sales={salesRecords}
                periodDays={periodDays}
                lang={lang}
              />

              {/* Festival Reminder Banner */}
              {festivalRemindersEnabled && (
                <FestivalReminderBanner
                  festivals={FESTIVALS_DATA}
                  dismissedIds={dismissedFestivalIds}
                  onDismiss={handleDismissFestivalReminder}
                  onOpenCalendar={() => setActiveTab('calendar')}
                  lang={lang}
                />
              )}

              {/* Daily Digest Card */}
              <DailyDigestCard
                digest={dailyDigest}
                lang={lang}
                storeName={businessProfile.businessName}
                onActionDone={handleDigestActionDone}
                onNavigateToProduct={(pId, section) => {
                  setHighlightProductId(pId);
                  setActiveTab(section === 'sales' ? 'sales' : 'inventory');
                }}
              />

              {/* Festival Strip */}
              <FestivalStrip
                festivals={upcomingRelevantFestivals}
                inventory={inventoryMetrics}
                lang={lang}
                onOpenCalendar={() => setActiveTab('calendar')}
              />

              {/* Health Summary Card */}
              <HealthSummaryCard summary={periodSummary} />

              {/* 3 Prominent Business Decision Sections */}
              <div className="space-y-6">
                <ActTodaySection
                  items={actTodayItems}
                  onNavigate={handleNavigate}
                  onActionDone={handleActionDone}
                  onActionDismiss={handleActionDismiss}
                  lang={lang}
                  storeName={businessProfile.businessName}
                />

                <WatchThisWeekSection
                  items={watchThisWeekItems}
                  onNavigate={handleNavigate}
                  onActionDone={handleActionDone}
                  onActionDismiss={handleActionDismiss}
                  lang={lang}
                />

                <DoingWellSection
                  items={doingWellItems}
                  onNavigate={handleNavigate}
                  lang={lang}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesTrendChart data={salesTrend} periodDays={periodDays} />
                <ProductPerformanceChart products={productPerformance} />
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & STOCKOUTS */}
          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventoryMetrics}
              periodDays={periodDays}
              highlightProductId={highlightProductId}
              onNavigate={handleNavigate}
              lang={lang}
              category={category}
              storeName={businessProfile.businessName}
            />
          )}

          {/* TAB 3: SALES & REVENUE */}
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

          {/* TAB 4: RECOMMENDATIONS */}
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
              category={category}
              storeName={businessProfile.businessName}
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
              category={category}
            />
          )}

          {/* TAB 7: FESTIVAL & PEAK-DAY CALENDAR */}
          {activeTab === 'calendar' && (
            <FestivalCalendarView
              inventory={inventoryMetrics}
              category={category}
              lang={lang}
              storeName={businessProfile.businessName}
              onNavigateToProduct={(pId) => {
                setHighlightProductId(pId);
                setActiveTab('inventory');
              }}
            />
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) for fast entry */}
      <QuickActionFAB onSelectAction={handleQuickAction} lang={lang} />

      {/* Mobile Bottom Navigation (Visible on screen < 1024px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        stockoutCount={actTodayItems.length}
      />

      {/* First-Run Fast Onboarding Modal (Language -> Category -> Shop Name) */}
      <FastOnboardingModal
        isOpen={isFastOnboardingOpen}
        currentLang={lang}
        onSelectLang={handleSetLang}
        onComplete={handleFastOnboardingComplete}
      />

      {/* 3-Step Skippable Dashboard Tour */}
      <DashboardTour
        isOpen={isDashboardTourOpen}
        onClose={handleCloseTour}
        lang={lang}
      />

      {/* Quick Sale Entry Modal (with large keypad) */}
      <QuickSaleModal
        isOpen={isQuickSaleOpen}
        onClose={() => setIsQuickSaleOpen(false)}
        inventory={inventoryItems}
        onSaveSale={handleRecordSale}
        lang={lang}
      />

      {/* Voice Entry Modal (Web Speech en-IN, kn-IN, hi-IN) */}
      <VoiceEntryModal
        isOpen={isVoiceEntryOpen}
        onClose={() => setIsVoiceEntryOpen(false)}
        inventory={inventoryItems}
        lang={lang}
        onRecordSale={handleRecordSale}
        onRecordStockIn={handleRecordStockIn}
      />

      {/* Barcode Scanner Modal (html5-qrcode camera stream) */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        inventory={inventoryItems}
        lang={lang}
        onRecordSale={handleRecordSale}
        onRecordStockIn={handleRecordStockIn}
        onAddNewProduct={handleAddNewProduct}
      />

      {/* Photo of Bill to Stock Entry Modal */}
      <BillExtractModal
        isOpen={isBillExtractOpen}
        onClose={() => setIsBillExtractOpen(false)}
        inventory={inventoryItems}
        lang={lang}
        onRecordStockIn={handleRecordStockIn}
        onAddNewProduct={handleAddNewProduct}
      />

      {/* Legacy Category Picker (from Settings or Header) */}
      <CategoryPickerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        isFirstRun={isFirstRun}
        currentProfile={businessProfile}
        currentLang={lang}
        onComplete={handleCategoryComplete}
      />

      {/* Settings & Reminders Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        setLang={handleSetLang}
        mode={mode}
        setMode={handleSetMode}
        profile={businessProfile}
        onOpenCategoryPicker={() => setIsCategoryModalOpen(true)}
        festivalRemindersEnabled={festivalRemindersEnabled}
        onToggleFestivalReminders={handleToggleFestivalReminders}
        digestNotificationEnabled={digestNotificationEnabled}
        onToggleDigestNotification={handleToggleDigestNotification}
        digestTime={digestTime}
        onSetDigestTime={handleSetDigestTime}
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
