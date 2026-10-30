export interface SalesRecord {
  date: string; // YYYY-MM-DD
  productId: string;
  productName: string;
  category: string;
  unitsSold: number;
  unitPrice: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  category: string;
  stockOnHand: number;
  reorderLevel: number;
  supplierLeadDays: number;
  unitCost: number;
  retailPrice: number;
  barcode?: string;
  attributes?: Record<string, unknown>;
}

export type InventoryStatus = 'critical' | 'warning' | 'healthy';
export type ABCClass = 'A' | 'B' | 'C';

export interface CalculatedInventoryItem extends InventoryItem {
  unitsSoldInPeriod: number;
  avgDailySales: number;
  daysOfCover: number; // In days; 999 or high if 0 sales
  status: InventoryStatus;
  statusReason: string;
  friendlyStatusText: string;
  isStockoutRisk: boolean;
  isDeadStock: boolean;
  isOverstocked: boolean;
  deadStockValue: number; // stockOnHand * unitCost
  suggestedAction: string;
  recommendedReorderQty: number;
  howCalculated: string;
  abcClass?: ABCClass;
}

export interface PeriodSummary {
  periodDays: number;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  prevPeriodRevenue: number;
  revenueChangePct: number;
  totalUnitsSold: number;
  prevPeriodUnitsSold: number;
  unitsChangePct: number;
  stockoutRiskCount: number;
  deadStockCount: number;
  deadStockTotalCost: number;
  totalInventoryCost: number;
  totalRetailValue: number;
  salesHealth: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  salesHealthReason: string;
  inventoryHealth: 'Optimal' | 'Balanced' | 'High Risk' | 'Overstocked';
  inventoryHealthReason: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface BusinessAlert {
  id: string;
  severity: AlertSeverity;
  type: 'sales_decline' | 'stockout_risk' | 'dead_stock' | 'reorder_needed';
  title: string;
  productId: string;
  productName: string;
  supportingData: string;
  recommendedAction: string;
  targetSection: 'sales' | 'inventory' | 'recommendations';
}

// Owner-centric dashboard cards for the redesigned Home Screen
export interface ActTodayItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  headline: string;
  simpleExplanation: string;
  supportingNumbers: string;
  suggestedAction: string;
  howCalculated: string;
  targetSection: 'sales' | 'inventory';
}

export interface WatchThisWeekItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  headline: string;
  reason: string;
  supportingNumbers: string;
  recommendedAction: string;
  howCalculated: string;
  targetSection: 'sales' | 'inventory';
}

export interface DoingWellItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  headline: string;
  positiveSignal: string;
  supportingNumbers: string;
  takeaway: string;
  targetSection: 'sales' | 'inventory';
}

export interface AIRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'Stockout Prevention' | 'Sales Decline Investigation' | 'Dead Stock Reduction' | 'Replenishment' | string;
  title: string;
  productId: string;
  productName: string;
  whatIsHappening: string;
  supportingNumbers: string;
  whyOwnerShouldCare: string;
  recommendedNextStep: string;
  howCalculated: string;
  targetSection: 'sales' | 'inventory';
}

export interface DailySalesTrend {
  date: string;
  displayDate: string;
  revenue: number;
  units: number;
  isDrop?: boolean;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  revenue: number;
  unitsSold: number;
  shareOfRevenue: number;
  baselineUnits?: number;
  changePct?: number;
  abcClass: ABCClass;
  abcDescription: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  dataBadges?: { label: string; value: string; color?: string }[];
}

export type ActiveTab = 'overview' | 'sales' | 'inventory' | 'recommendations' | 'copilot' | 'calendar' | 'import';
